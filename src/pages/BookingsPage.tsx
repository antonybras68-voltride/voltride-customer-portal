import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { mockBookings } from '../mock/data'
import { useTranslation } from '../i18n/useTranslation'

interface BookingsPageProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function BookingsPage({ customer, onLogout }: BookingsPageProps) {
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()

  const upcoming = mockBookings.filter(b =>
    (b.checkedIn && !b.checkedOut) ||
    (new Date(b.startDate) >= new Date() && b.status !== 'CANCELLED' && b.status !== 'COMPLETED')
  )
  const past = mockBookings.filter(b =>
    b.status === 'COMPLETED' || b.status === 'CANCELLED' ||
    (!b.checkedIn && new Date(b.startDate) < new Date())
  )

  const BookingCard = ({ booking }: { booking: typeof mockBookings[0] }) => (
    <div
      onClick={() => navigate(`/reservas/${booking.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-800">{booking.fleetVehicle.vehicle.name.es}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('bookings.title')}</h1>

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

        {mockBookings.length === 0 && (
          <p className="text-center text-gray-400 mt-12">{t('bookings.empty')}</p>
        )}
      </div>
    </div>
  )
}