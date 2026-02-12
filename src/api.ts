const API_URL = import.meta.env.VITE_API_URL || 'https://api-voltrideandmotorrent-production.up.railway.app'

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}/api/customer-portal${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

// Auth
export async function sendLoginCode(email: string) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function verifyCode(email: string, code: string) {
  return request('/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code })
  })
}

// Bookings
export async function getBookings(customerId: string) {
  return request(`/bookings?customerId=${customerId}`)
}

export async function getBookingDetail(bookingId: string) {
  return request(`/bookings/${bookingId}`)
}

// Modify
export async function modifyBooking(bookingId: string, data: {
  startDate: string; endDate: string; startTime: string; endTime: string
}) {
  return request(`/bookings/${bookingId}/modify`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

// Cancel
export async function cancelBooking(bookingId: string) {
  return request(`/bookings/${bookingId}/cancel`, {
    method: 'PUT'
  })
}

// Extend
export async function checkExtendAvailability(bookingId: string, newEndDate: string, newEndTime: string) {
  return request(`/bookings/${bookingId}/extend/check`, {
    method: 'POST',
    body: JSON.stringify({ newEndDate, newEndTime })
  })
}

export async function confirmExtension(bookingId: string, data: {
  newEndDate: string; newEndTime: string; paymentMethod: 'stripe' | 'agency'
}) {
  return request(`/bookings/${bookingId}/extend/confirm`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// Profile
export async function getProfile(customerId: string) {
  return request(`/profile/${customerId}`)
}

export async function updateProfile(customerId: string, data: {
  firstName?: string; lastName?: string; phone?: string;
  address?: string; postalCode?: string; city?: string; country?: string; language?: string
}) {
  return request(`/profile/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function requestDataDeletion(customerId: string) {
  return request(`/profile/${customerId}/delete-request`, {
    method: 'POST'
  })
}