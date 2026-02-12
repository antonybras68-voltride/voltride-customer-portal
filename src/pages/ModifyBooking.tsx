import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { mockBookings } from '../mock/data'
import { useTranslation } from '../i18n/useTranslation'

interface ModifyBookingProps {
  customer: { id: number; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function ModifyBooking({ customer, onLogout }: ModifyBookingProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()
  const booking = mockBookings.find(b => b.id === Number(id))

  const [startDate, setStartDate] = useState(booking?.startDate || '')
  const [endDate, setEndDate] = useState(booking?.endDate || '')
  const [startTime, setStartTime] = useState(booking?.startTime || '')
  const [endTime, setEndTime] = useState(booking?.endTime || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">{t('detail.notFound')}</p>
          <button onClick={() => navigate('/reservas')} className="mt-4 text-[#ffaf10] underline">
            {t('detail.backToList')}
          </button>
        </div>
      </div>
    )
  }

  const calculateDays = (start: string, end: string) => {
    const diffTime = new Date(end).getTime() - new Date(start).getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const originalDays = calculateDays(booking.startDate, booking.endDate)
  const newDays = calculateDays(startDate, endDate)
  const pricePerDay = booking.totalPrice / originalDays
  const estimatedNewPrice = Math.round(newDays * pricePerDay)

  const hasChanges = startDate !== booking.startDate || endDate !== booking.endDate ||
    startTime !== booking.startTime || endTime !== booking.endTime
  const isValid = newDays > 0 && startTime !== '' && endTime !== '' && hasChanges

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1500)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">OK</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t('modify.success')}</h2>
            <p className="text-gray-500 mb-2">{t('modify.successMsg')}</p>
            <p className="text-gray-500 mb-6">{t('modify.emailConfirm')}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">{t('modify.newDates')}</span>
                <span className="font-medium">{formatDate(startDate)} → {formatDate(endDate)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">{t('modify.schedule')}</span>
                <span className="font-medium">{startTime} - {endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('modify.newPrice')}</span>
                <span className="font-bold text-lg">{estimatedNewPrice}€</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/reservas/${booking.id}`)}
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#ffaf10' }}
            >
              {t('modify.backToBooking')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate(`/reservas/${booking.id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          {t('modify.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{t('modify.title')}</h1>
          <p className="text-sm text-gray-500 mb-6">{booking.fleetVehicle.vehicle.name.es} — {t('bookings.ref')} {booking.reference}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modify.startDate')}</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modify.startTime')}</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modify.endDate')}</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('modify.endTime')}</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
            </div>

            {hasChanges && newDays > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('modify.currentDuration')}</span>
                  <span>{originalDays} {t('modify.days')} — {booking.totalPrice}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('modify.newDuration')}</span>
                  <span>{newDays} {t('modify.days')} — {estimatedNewPrice}€</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span>{t('modify.difference')}</span>
                  <span className={estimatedNewPrice - booking.totalPrice > 0 ? 'text-red-500' : 'text-green-600'}>
                    {estimatedNewPrice - booking.totalPrice > 0 ? '+' : ''}{estimatedNewPrice - booking.totalPrice}€
                  </span>
                </div>
              </div>
            )}

            <button type="submit" disabled={!isValid || loading} className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50" style={{ backgroundColor: '#ffaf10' }}>
              {loading ? t('modify.confirming') : t('modify.confirm')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}