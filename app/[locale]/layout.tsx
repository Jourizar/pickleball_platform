import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/lib/i18n/config'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // error is intentionally ignored — getUser() returns null user on failure (never throws)

  const authUser = user
    ? {
        name: (user.user_metadata?.full_name as string | undefined)
          || user.email?.split('@')[0]
          || 'Usuario',
      }
    : null

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen flex flex-col">
        <Header locale={locale} user={authUser} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  )
}
