import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useTranslation } from '../i18n/useTranslation'
import { getBookingDetail, checkExtendAvailability, confirmExtension } from '../api'

interface ExtendBookingProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

type Step = 'form' | 'checking' | 'available' | 'unavailable' | 'payment' | 'success'

export default function ExtendBooking({ customer, onLogout }: ExtendBookingProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, formatDate } = useTranslation()

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newEndDate, setNewEndDate] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'agency' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pricing, setPricing] = useState<any>(null)
  const [agencyPaymentAvailable, setAgencyPaymentAvailable] = useState(true)
  const [extensionResult, setExtensionResult] = useState<any>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id!)
        setBooking(data)
        setNewEndDate(data.endDate)
        setNewEndTime(data.endTime)
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

  const currentEndDate = booking.contract?.currentEndDate || booking.endDate
  const calculateDays = (start: string, end: string) => {
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
  }
  const originalDays = calculateDays(booking.startDate, currentEndDate)
  const newTotalDays = calculateDays(booking.startDate, newEndDate)
  const extraDays = newTotalDays - originalDays
  const isValidExtension = newEndDate > currentEndDate || (newEndDate === currentEndDate && newEndTime > booking.endTime)

  const checkAvailability = async () => {
    setStep('checking')
    setError('')
    try {
      const result = await checkExtendAvailability(booking.id, newEndDate, newEndTime)
      setPricing(result.pricing)
      setAgencyPaymentAvailable(result.agencyPaymentAvailable !== false)
      setStep(result.available ? 'available' : 'unavailable')
    } catch (err: any) {
      setError(err.message)
      setStep('form')
    }
  }

  const handleConfirm = async () => {
    if (!paymentMethod) return
    setSubmitting(true)
    setError('')
    try {
      const result = await confirmExtension(booking.id, {
        newEndDate,
        newEndTime,
        paymentMethod
      })
      setExtensionResult(result.extension)
      setStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const extensionPrice = pricing?.totalAmount || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate(`/reservas/${booking.id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          {t('extend.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {error && step !== 'checking' && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {step === 'form' && (
            <>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{t('extend.title')}</h1>
              <p className="text-sm text-gray-500 mb-6">{getVehicleName(booking)} — {t('bookings.ref')} {booking.reference}</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">{t('extend.currentBooking')}</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.start')}</span>
                  <span className="font-medium">{formatDate(booking.startDate)} {t('detail.at')} {booking.startTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.expectedEnd')}</span>
                  <span className="font-medium">{formatDate(currentEndDate)} {t('detail.at')} {booking.endTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('extend.duration')}</span>
                  <span className="font-medium">{originalDays} {t('modify.days')}</span>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">{t('extend.newEndDate')}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('extend.endDate')}</label>
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} min={currentEndDate} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{t('extend.endTime')}</label>
                  <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
                </div>
              </div>

              {isValidExtension && extraDays > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{t('extend.extraDays')}</span>
                    <span className="font-medium">+{extraDays} {t('modify.days')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('extend.newTotalDuration')}</span>
                    <span className="font-medium">{newTotalDays} {t('modify.days')}</span>
                  </div>
                </div>
              )}

              <button onClick={checkAvailability} disabled={!isValidExtension || extraDays <= 0} className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50" style={{ backgroundColor: '#ffaf10' }}>
                {t('extend.checkAvailability')}
              </button>
            </>
          )}

          {step === 'checking' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-spin">⏳</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{t('extend.checking')}</h2>
              <p className="text-sm text-gray-500">{t('extend.checkingMsg')}</p>
            </div>
          )}

          {step === 'unavailable' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✗</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">{t('extend.unavailable')}</h2>
              <p className="text-sm text-gray-500 mb-6">{t('extend.unavailableMsg')}</p>
              <button onClick={() => setStep('form')} className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#ffaf10' }}>
                {t('extend.chooseDates')}
              </button>
            </div>
          )}

          {step === 'available' && pricing && (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✓</div>
                <h2 className="text-lg font-bold text-gray-800">{t('extend.available')}</h2>
                <p className="text-sm text-gray-500">{t('extend.availableMsg')}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.newEnd')}</span>
                  <span className="font-medium">{formatDate(newEndDate)} {t('detail.at')} {newEndTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.extraDays')}</span>
                  <span className="font-medium">+{pricing.additionalDays} {t('modify.days')}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                  <span>{t('extend.amountToPay')}</span>
                  <span className="text-lg" style={{ color: '#ffaf10' }}>{extensionPrice}€</span>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">{t('extend.howToPay')}</p>
              <div className="space-y-3 mb-6">
                <button onClick={() => { setPaymentMethod('stripe'); setStep('payment') }} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all">
                  <span className="text-2xl">💳</span>
                  <span>
                    <p className="font-semibold text-gray-800 text-sm">{t('extend.payNow')}</p>
                    <p className="text-xs text-gray-500">{t('extend.payNowDesc')} {extensionPrice}€</p>
                  </span>
                </button>
                {agencyPaymentAvailable && (<button onClick={() => { setPaymentMethod('agency'); setStep('payment') }} className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all">
                  <span className="text-2xl">🏪</span>
                  <span>
                    <p className="font-semibold text-gray-800 text-sm">{t('extend.payAgency')}</p>
                    <p className="text-xs text-gray-500">{t('extend.payAgencyDesc')} {extensionPrice}€ {t('extend.payAgencyDescEnd')}</p>
                  </span>
                </button>)}
              </div>
            </>
          )}

          {step === 'payment' && pricing && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('extend.confirmTitle')}</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.vehicle')}</span>
                  <span className="font-medium">{getVehicleName(booking)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.newEnd')}</span>
                  <span className="font-medium">{formatDate(newEndDate)} {t('detail.at')} {newEndTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('extend.extraDays')}</span>
                  <span className="font-medium">+{pricing.additionalDays}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                  <span>{t('extend.amount')}</span>
                  <span style={{ color: '#ffaf10' }}>{extensionPrice}€</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                {paymentMethod === 'stripe' ? (
                  <p className="text-sm text-blue-800">{t('extend.stripeMsg')} <strong>{extensionPrice}€</strong> {t('extend.stripeMsgEnd')}</p>
                ) : (
                  <p className="text-sm text-blue-800">{t('extend.agencyMsg')} <strong>{extensionPrice}€</strong> {t('extend.agencyMsgMid')}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('available')} className="flex-1 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                  {t('extend.back2')}
                </button>
                <button onClick={handleConfirm} disabled={submitting} className="flex-1 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50" style={{ backgroundColor: '#ffaf10' }}>
                  {submitting ? t('extend.processing') : t('extend.confirmBtn')}
                </button>
              </div>
            </>
          )}

          {step === 'success' && extensionResult && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✓</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('extend.success')}</h2>
              <p className="text-sm text-gray-500 mb-6">
                {paymentMethod === 'stripe'
                  ? `${t('extend.stripePaid')} ${extensionResult.totalAmount}€ ${t('extend.stripePaidEnd')}`
                  : `${t('extend.agencyPending')} ${extensionResult.totalAmount}€ ${t('extend.agencyPendingEnd')}`
                }
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">{t('extend.newEnd')}</span>
                  <span className="font-medium">{formatDate(newEndDate)} {t('detail.at')} {newEndTime}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">{t('extend.totalDuration')}</span>
                  <span className="font-medium">{newTotalDays} {t('modify.days')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">{t('extend.paymentMethod')}</span>
                  <span className="font-medium">{paymentMethod === 'stripe' ? t('extend.cardPaid') : t('extend.agencyPendingLabel')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('extend.newContract')}</span>
                  <span className="font-medium text-[#ffaf10]">{extensionResult.extensionNumber}</span>
                </div>
              </div>
              <button onClick={() => navigate(`/reservas/${booking.id}`)} className="w-full py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: '#ffaf10' }}>
                {t('extend.backToBooking')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}