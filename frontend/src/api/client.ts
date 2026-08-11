import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT token vào mọi request nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('space_journey_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirect về /admin/login nếu token hết hạn
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('space_journey_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── API Helpers ──────────────────────────────────────────────────────────────
export const scenesApi = {
  getAll: (adminView = false) =>
    api.get('/api/scenes', { params: { adminView } }),
  reorder: (items: { id: string; order: number }[]) =>
    api.patch('/api/scenes/reorder', { items }),
  toggle: (id: string, isVisible: boolean) =>
    api.patch(`/api/scenes/${id}/toggle`, { isVisible }),
  updateContent: (id: string, title: string, description: string) =>
    api.put(`/api/scenes/${id}/content`, { title, description }),
}

export const photosApi = {
  getAll: (sceneId?: string, adminView = false) =>
    api.get('/api/photos', { params: { sceneId, adminView } }),
  upload: (formData: FormData) =>
    api.post('/api/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: {
    name?: string
    description?: string
    sceneId?: string
    order?: number
    isVisible?: boolean
  }) => api.patch(`/api/photos/${id}`, data),
  delete: (id: string) => api.delete(`/api/photos/${id}`),
}

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string }>('/api/auth/login', { username, password }),
}
