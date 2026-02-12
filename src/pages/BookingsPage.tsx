import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { useTranslation } from '../i18n/useTranslation'
import { getBookings } from '../api'

interface BookingsPageProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function BookingsPage({ customer, onLogout }: BookingsPageProps) {
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getBookings(customer.id)
        setBookings(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [customer.id])

  const upcoming = bookings.filter(b =>
    (b.checkedIn && !b.checkedOut) ||
    (new Date(b.startDate) >= new Date() && b.status !== 'CANCELLED' && b.status !== 'COMPLETED')
  )
  const past = bookings.filter(b =>
    b.status === 'COMPLETED' || b.status === 'CANCELLED' ||
    (!b.checkedIn && new Date(b.startDate) < new Date())
  )

  const getVehicleName = (booking: any) => {
    const name = booking.fleetVehicle?.vehicle?.name
    if (!name) return 'Véhicule'
    if (typeof name === 'string') {
      try { return JSON.parse(name).es || name } catch { return name }
    }
    return name.es || name.en || name.fr || 'Véhicule'
  }

  const BookingCard = ({ booking }: { booking: any }) => (
    <div
      onClick={() => navigate(`/reservas/${booking.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{getVehicleName(booking)}</p>
          <p className="text-sm text-gray-500">{t('bookings.ref')} {booking.reference}</p>
        </div>
        <StatusBadge status={booking.checkedIn && !booking.checkedOut ? 'IN_PROGRESS' : booking.status} />
      </div>
      <div className="flex justify-between items-end">
        <div className="text-sm text-gray-600">
          <p>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</p>
          <p>{booking.startTime} - {booking.endTime}</p>
        </div>
        <p className="text-lg font-bold" style={{ color: '#ffaf10' }}>
          {booking.totalPrice}€
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('bookings.title')}</h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('bookings.upcoming')}</h2>
            <div className="space-y-3 mb-8">
              {upcoming.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('bookings.past')}</h2>
            <div className="space-y-3">
              {past.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </>
        )}

        {bookings.length === 0 && !error && (
          <p className="text-center text-gray-400 mt-12">{t('bookings.empty')}</p>
        )}
      </div>
    </div>
  )
}
