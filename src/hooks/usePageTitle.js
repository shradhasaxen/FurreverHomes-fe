import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const TITLES = {
  '/':          '🐾 FurrEver Homes — Find Your Forever Friend',
  '/adopt':     '🐶 Adopt a Pet — FurrEver Homes',
  '/add-pet':   '🐱 List Your Pet — FurrEver Homes',
  '/signup':    '🔐 Sign Up — FurrEver Homes',
  '/blog':      '✍️ Pet Blog — FurrEver Homes',
  '/shopping':  '🛍️ Pet Shop — FurrEver Homes',
  '/payment':   '💳 Checkout — FurrEver Homes',
  '/grooming':  '✂️ Pet Grooming — FurrEver Homes',
  '/pet-house': '🏠 Pet Boarding — FurrEver Homes',
  '/book-pet':  '📅 Book a Pet — FurrEver Homes',
}

export default function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = TITLES[pathname] || '🐾 FurrEver Homes'
  }, [pathname])
}
