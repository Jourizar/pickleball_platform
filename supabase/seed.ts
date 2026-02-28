// supabase/seed.ts
// Run with: npx tsx supabase/seed.ts
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seed() {
  console.log('🌱 Starting seed...')

  // ── Membership Plans ─────────────────────────────────────
  const { error: plansError } = await supabase.from('membership_plans').upsert([
    {
      name: 'Mini Player',
      age_range: '5–12 años',
      price: 30,
      benefits: ['Acceso a canchas (fines de semana)', 'Clases grupales', 'Torneos juveniles'],
      badge_color: '#eab308',
      cta_label: 'Suscribirse',
      display_order: 1,
      is_active: true,
    },
    {
      name: 'Youth Player',
      age_range: '13–17 años',
      price: 50,
      benefits: ['Acceso a canchas (lun–dom)', 'Sesiones de coaching', 'Liga juvenil'],
      badge_color: '#22c55e',
      cta_label: 'Suscribirse',
      display_order: 2,
      is_active: true,
    },
    {
      name: 'Adult Member',
      age_range: '18–49 años',
      price: 50,
      benefits: ['Acceso completo a canchas', 'Juego abierto', 'Elegible para torneos'],
      badge_color: '#3b82f6',
      cta_label: 'Suscribirse',
      display_order: 3,
      is_active: true,
    },
    {
      name: 'Senior Player',
      age_range: '50+ años',
      price: 30,
      benefits: ['Acceso completo a canchas', 'Liga social sénior', 'Sesiones de bienestar'],
      badge_color: '#f97316',
      cta_label: 'Suscribirse',
      display_order: 4,
      is_active: true,
    },
    {
      name: 'Plan Familiar',
      age_range: 'Hasta 2 adultos + 2 niños',
      price: 120,
      benefits: ['Acceso para toda la familia', 'Reserva prioritaria de canchas', 'Torneos familiares'],
      badge_color: '#a855f7',
      cta_label: 'Suscribirse',
      display_order: 5,
      is_active: true,
    },
  ])
  if (plansError) { console.error('Plans error:', plansError.message); process.exit(1) }
  console.log('✅ Membership plans seeded')

  // ── FAQs ─────────────────────────────────────────────────
  const { error: faqsError } = await supabase.from('faqs').upsert([
    { question: '¿Qué es el pickleball?', answer: 'El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping pong. Se juega en una cancha pequeña con paletas sólidas y una pelota de plástico con agujeros.', display_order: 1, is_visible: true },
    { question: '¿Necesito experiencia previa para unirme?', answer: 'No. El Nell Pickleball Club da la bienvenida a principiantes. Ofrecemos clases introductorias para todos los niveles.', display_order: 2, is_visible: true },
    { question: '¿Cuáles son los horarios del club?', answer: 'Estamos abiertos de lunes a viernes de 7:00 AM a 9:00 PM y los fines de semana de 7:00 AM a 8:00 PM.', display_order: 3, is_visible: true },
    { question: '¿Cómo reservo una cancha?', answer: 'Crea una cuenta, inicia sesión y ve a la página de Reservaciones. Selecciona la fecha, la cancha disponible y el horario que prefieras.', display_order: 4, is_visible: true },
    { question: '¿Qué equipamiento necesito?', answer: 'Solo necesitas ropa deportiva cómoda y zapatillas. El club tiene paletas y pelotas disponibles para préstamo para nuevos miembros.', display_order: 5, is_visible: true },
    { question: '¿Los precios están en pesos dominicanos?', answer: 'Sí, todos nuestros precios están en pesos dominicanos (RD$).', display_order: 6, is_visible: true },
    { question: '¿Puedo cancelar mi membresía?', answer: 'Sí, puedes cancelar tu membresía en cualquier momento desde tu página de cuenta. La cancelación se aplica al final del período de facturación actual.', display_order: 7, is_visible: true },
    { question: '¿Hay torneos para principiantes?', answer: 'Sí, organizamos torneos para todos los niveles, incluyendo categorías para principiantes y jugadores recreativos.', display_order: 8, is_visible: true },
  ])
  if (faqsError) { console.error('FAQs error:', faqsError.message); process.exit(1) }
  console.log('✅ FAQs seeded')

  // ── Courts ───────────────────────────────────────────────
  const { error: courtsError } = await supabase.from('courts').upsert([
    { name: 'Cancha 1', description: 'Cancha principal con iluminación LED para juego nocturno.', is_active: true },
  ])
  if (courtsError) { console.error('Courts error:', courtsError.message); process.exit(1) }
  console.log('✅ Courts seeded')

  // ── Site Settings ─────────────────────────────────────────
  const { error: settingsError } = await supabase.from('site_settings').upsert([
    { key: 'whatsapp_number', value: '18091234567' },
    { key: 'whatsapp_enabled', value: 'true' },
    { key: 'zapier_webhook_url', value: '' },
    { key: 'stripe_enabled', value: 'false' },
  ], { onConflict: 'key' })
  if (settingsError) { console.error('Settings error:', settingsError.message); process.exit(1) }
  console.log('✅ Site settings seeded')

  // ── Site Content ──────────────────────────────────────────
  const { error: contentError } = await supabase.from('site_content').upsert([
    { page: 'home', section: 'hero', key: 'title', value: 'Bienvenido al Nell Pickleball Club' },
    { page: 'home', section: 'hero', key: 'subtitle', value: 'El primer club de pickleball de República Dominicana. Únete a nuestra comunidad y descubre el deporte que está conquistando el mundo.' },
    { page: 'home', section: 'hero', key: 'cta_primary', value: 'Únete Ahora' },
    { page: 'home', section: 'hero', key: 'cta_secondary', value: 'Aprende Más' },
    { page: 'home', section: 'mission', key: 'title', value: 'Nuestra Misión' },
    { page: 'home', section: 'mission', key: 'body', value: 'Promover el pickleball en República Dominicana creando una comunidad inclusiva y apasionada por este deporte.' },
    { page: 'home', section: 'vision', key: 'title', value: 'Nuestra Visión' },
    { page: 'home', section: 'vision', key: 'body', value: 'Ser el club de pickleball de referencia en el Caribe, formando campeones y conectando personas a través del deporte.' },
    { page: 'about', section: 'story', key: 'title', value: 'Nuestra Historia' },
    { page: 'about', section: 'story', key: 'body', value: '<p>El Nell Pickleball Club nació de la pasión por el deporte y el deseo de traer a República Dominicana uno de los deportes de más rápido crecimiento en el mundo.</p>' },
    { page: 'about', section: 'video', key: 'url', value: 'https://www.youtube.com/watch?v=V5TyLYMjQbA' },
    { page: 'guide', section: 'body', key: 'content', value: '<h2>¿Qué es el Pickleball?</h2><p>El pickleball es un deporte de raqueta que combina elementos del tenis, el bádminton y el ping pong...</p>' },
    { page: 'guide', section: 'video', key: 'url', value: 'https://www.youtube.com/watch?v=V5TyLYMjQbA' },
  ], { onConflict: 'page,section,key' })
  if (contentError) { console.error('Content error:', contentError.message); process.exit(1) }
  console.log('✅ Site content seeded')

  console.log('\n🎉 Seed complete!')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
