import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach JWT on every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('fd_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear session and redirect to login
client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fd_token')
      localStorage.removeItem('fd_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default client

// ── Named API functions ───────────────────────────────────────────────────────

export const authApi = {
  login:    data => client.post('/auth/login', data),
  register: data => client.post('/auth/register', data),
}

export const kpiApi = {
  summary: ()           => client.get('/kpi/summary'),
  history: (days = 30)  => client.get(`/kpi/history?days=${days}`),
  live:    ()           => client.get('/kpi/live'),
}

export const reportsApi = {
  weekly:  () => client.get('/reports/weekly'),
  monthly: () => client.get('/reports/monthly'),
  fraud:   () => client.get('/reports/fraud'),
}
