// middleware.ts
import createIntlMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './lib/i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Create a mutable response that Supabase can attach cookies to.
  //    We start with NextResponse.next() so Supabase can set/refresh tokens.
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies so subsequent reads in this same middleware
          // call see the refreshed token.
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          )
          // Rebuild supabaseResponse with the mutated request so Next.js
          // propagates the new cookies downstream.
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. IMPORTANT: call getUser() on every request — this is what refreshes
  //    the access token when it expires. Do not skip this even for public routes.
  const { data: { user } } = await supabase.auth.getUser()

  // 3. Run next-intl for locale routing.
  const intlResponse = intlMiddleware(request)

  // 4. If intl wants to redirect (e.g. / → /es), honour that redirect but
  //    copy the Supabase session cookies onto it first.
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    supabaseResponse.cookies.getAll().forEach(cookie => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return intlResponse
  }

  // 5. Protected route checks.
  const localePattern = locales.join('|')
  const isProtectedRoute = new RegExp(`^/(${localePattern})/(reservations|admin)`).test(pathname)
  const isAdminRoute = new RegExp(`^/(${localePattern})/admin`).test(pathname)
  const pathLocale = pathname.split('/')[1]
  const locale = (locales as readonly string[]).includes(pathLocale) ? pathLocale : defaultLocale

  if (isProtectedRoute && !user) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const redirectResponse = NextResponse.redirect(loginUrl)
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      const adminDeniedRedirect = NextResponse.redirect(new URL(`/${locale}`, request.url))
      supabaseResponse.cookies.getAll().forEach(cookie => {
        adminDeniedRedirect.cookies.set(cookie.name, cookie.value, cookie)
      })
      return adminDeniedRedirect
    }
  }

  // 6. For normal (non-redirect) intl responses, copy intl headers into the
  //    supabaseResponse so locale headers are preserved, then return it.
  intlResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value)
  })

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
