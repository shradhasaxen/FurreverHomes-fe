import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'

// ─── Token storage ────────────────────────────────────────────────────────────
export const session = {
  getAccessToken: () => localStorage.getItem('feh_access'),
  setAccessToken: (t) => localStorage.setItem('feh_access', t),
  getRefreshToken: () => localStorage.getItem('feh_refresh'),
  setRefreshToken: (t) => localStorage.setItem('feh_refresh', t),
  getUser: () => { try { return JSON.parse(localStorage.getItem('feh_user')) } catch { return null } },
  setUser: (u) => localStorage.setItem('feh_user', JSON.stringify(u)),
  getExpiresAt: () => parseInt(localStorage.getItem('feh_expires_at') || '0'),
  setExpiresAt: (expiresIn) => localStorage.setItem('feh_expires_at', String(Date.now() + expiresIn * 1000)),
  isLoggedIn: () => !!localStorage.getItem('feh_access'),
  isTokenExpired: () => Date.now() >= parseInt(localStorage.getItem('feh_expires_at') || '0'),
  clear: () => {
    localStorage.removeItem('feh_access')
    localStorage.removeItem('feh_refresh')
    localStorage.removeItem('feh_user')
    localStorage.removeItem('feh_expires_at')
  },
  saveAuthResponse: (data) => {
    session.setAccessToken(data.accessToken)
    session.setRefreshToken(data.refreshToken)
    session.setExpiresAt(data.expiresIn)
    session.setUser({ userId: data.userId, name: data.name, email: data.email, role: data.role })
  },
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({ baseURL: BASE })

let isRefreshing = false
let refreshQueue = []

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
  refreshQueue = []
}

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = session.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const refreshToken = session.getRefreshToken()
    if (!refreshToken) {
      session.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const res = await axios.post(`${BASE}/auth/refresh`, { refreshToken })
      const data = res.data.data
      session.saveAuthResponse(data)
      processQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      session.clear()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

// ─── Helper to unwrap ApiResponse wrapper ─────────────────────────────────────
const unwrap = (res) => res.data.data

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', {
    name: data.name,
    email: data.email,
    password: data.password,
    phoneNumber: data.phone_num,
  }).then(unwrap),

  login: (data) => api.post('/auth/login', {
    email: data.email,
    password: data.password,
  }).then(unwrap),

  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(unwrap),

  logout: () => api.post('/auth/logout').then(() => session.clear()),
}

// ─── My Pets API (saved pet profiles) ────────────────────────────────────────
export const myPetsApi = {
  getAll: () => api.get('/my-pets').then(unwrap),
  add: (data) => api.post('/my-pets', data).then(unwrap),
  update: (id, data) => api.put(`/my-pets/${id}`, data).then(unwrap),
  remove: (id) => api.delete(`/my-pets/${id}`).then(unwrap),
}

// ─── Pet API (adoption/sale listings) ────────────────────────────────────────
export const petApi = {
  fetchAll: ({ petType, listingType, keyword, page = 0, size = 12 } = {}) => {
    const params = new URLSearchParams()
    if (petType) params.set('petType', petType.toUpperCase())
    if (listingType) params.set('listingType', listingType.toUpperCase())
    if (keyword) params.set('keyword', keyword)
    params.set('page', page)
    params.set('size', size)
    return api.get(`/pets?${params}`).then(unwrap)
  },
  getById: (id) => api.get(`/pets/${id}`).then(unwrap),
  getMyPets: () => api.get('/pets/my-pets').then(unwrap),
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
    return api.post('/pets', formData).then(unwrap)
  },
  delete: (id) => api.delete(`/pets/${id}`).then(unwrap),
}

// ─── Adoption API ─────────────────────────────────────────────────────────────
export const adoptionApi = {
  submit: (petId, message) => api.post('/adoptions', { petId, applicantMessage: message }).then(unwrap),
  getMyRequests: (page = 0, size = 10) => api.get(`/adoptions/my-requests?page=${page}&size=${size}`).then(unwrap),
}

// ─── Booking API ──────────────────────────────────────────────────────────────
export const bookingApi = {
  submit: (data) => api.post('/bookings', data).then(unwrap),
  getMyBookings: (page = 0, size = 10) => api.get(`/bookings/my-bookings?page=${page}&size=${size}`).then(unwrap),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`).then(unwrap),
}

export const groomingApi = {
  submit: (data) => bookingApi.submit({
    petName: data.petName,
    petType: data.petType?.toUpperCase(),
    petAgeMonths: parseInt(data.petAge),
    petAddress: data.petAddress,
    mobileNumber: data.mobileNumber,
    serviceType: 'GROOMING',
    bookingDate: data.bookingDate,
    bookingTime: data.bookingTime,
    notes: data.notes || null,
  }),
}

export const houseApi = {
  submit: (data) => bookingApi.submit({
    petName: data.petName,
    petType: data.petType?.toUpperCase(),
    petAddress: data.petAddress,
    mobileNumber: data.mobileNumber,
    serviceType: 'BOARDING',
    bookingDate: data.bookingDate,
    durationDays: parseInt(data.duration),
    notes: data.notes || null,
  }),
}

// ─── Orders API ───────────────────────────────────────────────────────────────
export const orderApi = {
  place: (data) => api.post('/orders', data).then(unwrap),
  getAll: (page = 0, size = 10) => api.get(`/orders?page=${page}&size=${size}`).then(unwrap),
  getById: (id) => api.get(`/orders/${id}`).then(unwrap),
  cancel: (id) => api.patch(`/orders/${id}/cancel`).then(unwrap),
}

// ─── Blog API ─────────────────────────────────────────────────────────────────
export const blogApi = {
  fetchAll: (page = 0, size = 20) => api.get(`/blogs?page=${page}&size=${size}`).then(unwrap),
  submit: (data) => api.post('/blogs', {
    title: data.blog?.split('\n')[0] || data.name,
    content: data.blog || data.content,
  }).then(unwrap),
  delete: (id) => api.delete(`/blogs/${id}`).then(unwrap),
}

// ─── AI Assistant API ─────────────────────────────────────────────────────────
export const assistantApi = {
  chat: (message, sessionId) => api.post('/assistant/chat', { message, sessionId }).then(unwrap),
}

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/users/me').then(unwrap),
}

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminApi = {
  getAllUsers: (page = 0, size = 20) => api.get(`/admin/users?page=${page}&size=${size}`).then(unwrap),
  getAllBookings: (page = 0, size = 20) => api.get(`/admin/bookings?page=${page}&size=${size}`).then(unwrap),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status?status=${status}`).then(unwrap),
  getAllOrders: (page = 0, size = 20) => api.get(`/admin/orders?page=${page}&size=${size}`).then(unwrap),
  updateOrderStatus: (id, status, trackingId) => {
    const params = new URLSearchParams({ status })
    if (trackingId) params.set('trackingId', trackingId)
    return api.patch(`/admin/orders/${id}/status?${params}`).then(unwrap)
  },
  getAllAdoptions: (page = 0, size = 20) => api.get(`/adoptions?page=${page}&size=${size}`).then(unwrap),
}

export default api
