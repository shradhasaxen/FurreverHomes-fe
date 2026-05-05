import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/':                      '🐾 FurrEver Homes — Find Your Forever Friend',
  '/adopt':                 '🐶 Adopt a Pet — FurrEver Homes',
  '/add-pet':               '🐱 List Your Pet — FurrEver Homes',
  '/login':                 '🔐 Sign In — FurrEver Homes',
  '/blog':                  '✍️ Pet Blog — FurrEver Homes',
  '/shopping':              '🛍️ Pet Shop — FurrEver Homes',
  '/payment':               '💳 Checkout — FurrEver Homes',
  '/grooming':              '✂️ Pet Grooming — FurrEver Homes',
  '/pet-house':             '🏠 Pet Boarding — FurrEver Homes',
  '/book-pet':              '📅 Book a Pet — FurrEver Homes',
  '/dashboard':             '🏠 Dashboard — FurrEver Homes',
  '/dashboard/my-pets':     '🐾 My Pets — FurrEver Homes',
  '/dashboard/orders':      '📦 My Orders — FurrEver Homes',
  '/dashboard/bookings':    '📅 My Bookings — FurrEver Homes',
  '/dashboard/adoptions':   '❤️ My Adoptions — FurrEver Homes',
  '/dashboard/profile':     '👤 My Profile — FurrEver Homes',
  '/admin':                 '⚡ Admin Overview — FurrEver Homes',
  '/admin/users':           '👥 Users — Admin',
  '/admin/orders':          '📦 Orders — Admin',
  '/admin/bookings':        '📅 Bookings — Admin',
  '/admin/adoptions':       '❤️ Adoptions — Admin',
}

export default function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] || '🐾 FurrEver Homes'
  }, [pathname])
}
