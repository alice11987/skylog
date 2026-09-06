const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const searchFlight = (flight, date) =>
  request(`/flights/search?flight=${encodeURIComponent(flight)}&date=${date}`)

export const getTrips = () => request('/trips')

export const saveTrip = (trip) =>
  request('/trips', { method: 'POST', body: JSON.stringify(trip) })

export const deleteTrip = (id) =>
  request(`/trips/${id}`, { method: 'DELETE' })

export const refreshTrip = (id) =>
  request(`/trips/${id}/refresh`, { method: 'POST' })
