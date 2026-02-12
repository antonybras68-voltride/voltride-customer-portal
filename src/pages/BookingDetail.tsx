import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { useTranslation } from '../i18n/useTranslation'
import { getBookingDetail, cancelBooking } from '../api'

interface BookingDetailProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function BookingDetail({ customer, onLogout }: BookingDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id!)
        setBooking(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [id])

  const getVehicleName = (b: any) => {
    const name = b.fleetVehicle?.vehicle?.name
    if (!name) return 'Véhicule'
    if (typeof name === 'string') {
      try { return JSON.parse(name).es || name } catch { return name }
    }
    return name.es || name.en || name.fr || 'Véhicule'
  }

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

  const canModify = booking.status !== 'CANCELLED' && !booking.checkedIn
  const canCancel = !booking.checkedIn && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  const canExtend = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && !booking.checkedOut

  const startDateTime = new Date(`${booking.startDate}T${booking.startTime}`)
  const hoursBeforeStart = (startDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  const refundable = hoursBeforeStart >= 48

  const handleCancel = async () => {
    const message = refundable
      ? `${t('detail.cancelRefund')} ${booking.paidAmount}€`
      : `${t('detail.cancelNoRefund')} ${booking.paidAmount}€ ${t('detail.cancelNoRefundEnd')}`
    if (!confirm(message + `\n\n${t('detail.cancelConfirm')}`)) return

    setCancelling(true)
    try {
      await cancelBooking(booking.id)
      alert(t('detail.cancelDone'))
      // Recharger les données
      const updated = await getBookingDetail(id!)
      setBooking(updated)
    } catch (err: any) {
      alert(err.message || 'Error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/reservas')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          {t('detail.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{getVehicleName(booking)}</h1>
              <p className="text-sm text-gray-500">{t('bookings.ref')} {booking.reference}</p>
            </div>
            <StatusBadge status={booking.checkedIn && !booking.checkedOut ? 'IN_PROGRESS' : booking.status} />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{t('detail.startDate')}</span>
              <span className="font-medium">{formatDate(booking.startDate)} {t('detail.at')} {booking.startTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{t('detail.endDate')}</span>
              <span className="font-medium">{formatDate(booking.endDate)} {t('detail.at')} {booking.endTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{t('detail.totalPrice')}</span>
              <span className="font-bold text-lg">{booking.totalPrice}€</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{t('detail.paid')}</span>
              <span className="font-medium text-green-600">{booking.paidAmount}€</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">{t('detail.deposit')}</span>
              <span className="font-medium">{booking.depositAmount}€</span>
            </div>
          </div>

          {booking.options && booking.options.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">{t('detail.options')}</h3>
              {booking.options.map((opt: any, i: number) => {
                const optName = opt.option?.name
                let displayName = 'Option'
                if (optName) {
                  if (typeof optName === 'string') {
                    try { displayName = JSON.parse(optName).es || optName } catch { displayName = optName }
                  } else {
                    displayName = optName.es || optName.en || 'Option'
                  }
                }
                return (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{displayName} x{opt.quantity}</span>
                    <span>{opt.totalPrice}€</span>
                  </div>
                )
              })}
            </div>
          )}

          {booking.contract?.contractPdfUrl && (
            <a
              href={booking.contract.contractPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-3 text-center"
            >
              {t('detail.downloadContract')} ({booking.contract.contractNumber})
            </a>
          )}

          {/* Extensions passées */}
          {booking.contract?.extensions && booking.contract.extensions.length > 0 && (
            <div className="mb-6 bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">{t('detail.extensions') || 'Extensions'}</h3>
              {booking.contract.extensions.map((ext: any) => (
                <div key={ext.id} className="flex justify-between text-sm py-1">
                  <span className="text-blue-700">{ext.extensionNumber} — +{ext.additionalDays}j</span>
                  <span className="font-medium">{ext.totalAmount}€ ({ext.paymentStatus})</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 mt-4">
            <div className="flex gap-3">
              {canModify && (
                <button
                  onClick={() => navigate(`/reservas/${booking.id}/modificar`)}
                  className="flex-1 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: '#ffaf10' }}
                >
                  {t('detail.modify')}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-lg font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? '...' : t('detail.cancel')}
                </button>
              )}
            </div>
            {canExtend && (
              <button
                onClick={() => navigate(`/reservas/${booking.id}/prolongar`)}
                className="w-full py-3 rounded-lg font-semibold border-2 border-[#abdee6] text-[#abdee6] hover:bg-cyan-50"
              >
                {t('detail.extend')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}