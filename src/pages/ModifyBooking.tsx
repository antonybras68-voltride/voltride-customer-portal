import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useTranslation } from '../i18n/useTranslation'
import { getBookingDetail, modifyBooking } from '../api'

interface ModifyBookingProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function ModifyBooking({ customer, onLogout }: ModifyBookingProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id!)
        setBooking(data)
        setStartDate(data.startDate)
        setEndDate(data.endDate)
        setStartTime(data.startTime)
        setEndTime(data.endTime)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id])

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

  if (!booking || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">{error || t('detail.notFound')}</p>
          <button onClick={() => navigate('/reservas')} className="mt-4 text-[#ffaf10] underline">
            {t('detail.backToList')}
          </button>
        </div>
      </div>
    )
  }

  const getVehicleName = (b: any) => {
    const name = b.fleetVehicle?.vehicle?.name
    if (!name) return 'Véhicule'
    if (typeof name === 'string') {
      try { return JSON.parse(name).es || name } catch { return name }
    }
    return name.es || name.en || name.fr || 'Véhicule'
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
    setSubmitting(true)
    setError('')
    try {
      await modifyBooking(booking.id, { startDate, endDate, startTime, endTime })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">✓</div>
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
          <p className="text-sm text-gray-500 mb-6">{getVehicleName(booking)} — {t('bookings.ref')} {booking.reference}</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

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

            <button type="submit" disabled={!isValid || submitting} className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50" style={{ backgroundColor: '#ffaf10' }}>
              {submitting ? t('modify.confirming') : t('modify.confirm')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}