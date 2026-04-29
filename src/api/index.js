const BASE = import.meta.env.VITE_API_URL || '/api'

// ─── Token helpers ────────────────────────────────────────────────────────────
export const auth = {
  getToken: () => localStorage.getItem('feh_token'),
  setToken: (token) => localStorage.setItem('feh_token', token),
  setUser: (user) => localStorage.setItem('feh_user', JSON.stringify(user)),
  getUser: () => { try { return JSON.parse(localStorage.getItem('feh_user')) } catch { return null } },
  clear: () => { localStorage.removeItem('feh_token'); localStorage.removeItem('feh_user') },
  isLoggedIn: () => !!localStorage.getItem('feh_token'),
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = auth.getToken()
  const headers = { ...options.headers }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    auth.clear()
    window.location.href = '/signup'
    throw new Error('Session expired. Please log in again.')
  }

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = json?.message || json?.error || `Request failed: ${res.status}`
    throw new Error(msg)
  }

  return json
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password,
      phoneNumber: data.phone_num,
    }),
  }),

  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: data.email, password: data.password }),
  }),
}

// ─── Pet API ──────────────────────────────────────────────────────────────────
export const petApi = {
  fetchAll: ({ petType, listingType, keyword, page = 0, size = 12 } = {}) => {
    const params = new URLSearchParams()
    if (petType) params.set('petType', petType.toUpperCase())
    if (listingType) params.set('listingType', listingType.toUpperCase())
    if (keyword) params.set('keyword', keyword)
    params.set('page', page)
    params.set('size', size)
    return request(`/pets?${params}`)
  },

  getById: (id) => request(`/pets/${id}`),

  getMyPets: () => request('/pets/my-pets'),

  submit: (data, imageFile) => {
    const formData = new FormData()
    const petPayload = {
      petName: data.petName || null,
      petType: data.petType?.toUpperCase(),
      petBreed: data.petBreed,
      petGender: data.petGender?.toUpperCase(),
      petAgeMonths: parseInt(data.petAge),
      vaccinationStatus: data.vaccinationStatus,
      petDescription: data.petDescription,
      reason: data.reason,
      listingType: data.adoptionOrSale === 'sale' ? 'SALE' : 'ADOPTION',
      price: data.petPrice ? parseFloat(data.petPrice) : null,
      state: data.state,
      city: data.city,
    }
    formData.append('pet', new Blob([JSON.stringify(petPayload)], { type: 'application/json' }))
    if (imageFile) formData.append('image', imageFile)
    return request('/pets', { method: 'POST', body: formData })
  },

  delete: (id) => request(`/pets/${id}`, { method: 'DELETE' }),
}

// ─── Adoption API ─────────────────────────────────────────────────────────────
export const adoptionApi = {
  submit: (petId, message) => request('/adoptions', {
    method: 'POST',
    body: JSON.stringify({ petId, applicantMessage: message }),
  }),

  getMyRequests: (page = 0, size = 10) =>
    request(`/adoptions/my-requests?page=${page}&size=${size}`),
}

// ─── Booking API (grooming + boarding + book-pet) ─────────────────────────────
export const bookingApi = {
  submit: (data) => request('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}

export const groomingApi = {
  submit: (data) => bookingApi.submit({
    petName: data.petName,
    petType: data.petType?.toUpperCase(),
    petAgeMonths: parseInt(data.petAge),
    petAddress: data.petAddress,
    mobileNumber: data.mobileNumber,
    serviceType: 'GROOMING',
    notes: data.otherSuggestions || null,
  }),
}

export const houseApi = {
  submit: (data) => bookingApi.submit({
    petName: data.petName,
    petType: data.petType?.toUpperCase(),
    petAddress: data.petAddress,
    mobileNumber: data.mobileNumber,
    serviceType: 'BOARDING',
    durationDays: parseInt(data.duration),
    notes: data.otherSuggestions || null,
  }),
}

// ─── Blog API ─────────────────────────────────────────────────────────────────
export const blogApi = {
  fetchAll: (page = 0, size = 20) => request(`/blogs?page=${page}&size=${size}`),

  submit: (data) => request('/blogs', {
    method: 'POST',
    body: JSON.stringify({
      title: data.blog?.split('\n')[0] || data.name,
      content: data.blog || data.content,
    }),
  }),

  delete: (id) => request(`/blogs/${id}`, { method: 'DELETE' }),
}

// ─── AI Assistant API ─────────────────────────────────────────────────────────
export const assistantApi = {
  chat: (message, sessionId) => request('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  }),
}

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => request('/users/me'),
}
