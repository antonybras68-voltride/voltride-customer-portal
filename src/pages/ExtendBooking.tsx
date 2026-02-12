import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { mockBookings } from '../mock/data'

interface ExtendBookingProps {
  customer: { id: number; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

type Step = 'form' | 'checking' | 'available' | 'unavailable' | 'payment' | 'success'

export default function ExtendBooking({ customer, onLogout }: ExtendBookingProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const booking = mockBookings.find(b => b.id === Number(id))

  const [newEndDate, setNewEndDate] = useState(booking?.endDate || '')
  const [newEndTime, setNewEndTime] = useState(booking?.endTime || '')
  const [step, setStep] = useState<Step>('form')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'agency' | null>(null)
  const [loading, setLoading] = useState(false)

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header customerName={customer.firstName} onLogout={onLogout} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Reserva no encontrada</p>
          <button onClick={() => navigate('/reservas')} className="mt-4 text-[#ffaf10] underline">
            Volver a mis reservas
          </button>
        </div>
      </div>
    )
  }

  const calculateDays = (start: string, end: string) => {
    const diffTime = new Date(end).getTime() - new Date(start).getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const originalDays = calculateDays(booking.startDate, booking.endDate)
  const newTotalDays = calculateDays(booking.startDate, newEndDate)
  const extraDays = newTotalDays - originalDays

  const pricePerDay = booking.totalPrice / originalDays
  const extensionPrice = Math.round(extraDays * pricePerDay)

  const isValidExtension = newEndDate > booking.endDate || (newEndDate === booking.endDate && newEndTime > booking.endTime)

  const checkAvailability = () => {
    setStep('checking')
    setTimeout(() => {
      const available = Math.random() > 0.1
      setStep(available ? 'available' : 'unavailable')
    }, 1500)
  }

  const confirmExtension = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate(`/reservas/${booking.id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Volver al detalle
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {step === 'form' && (
            <>
              <h1 className="text-xl font-bold text-gray-800 mb-1">Prolongar reserva</h1>
              <p className="text-sm text-gray-500 mb-6">
                {booking.fleetVehicle.vehicle.name.es} — Ref: {booking.reference}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">Reserva actual</p>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Inicio</span>
                  <span className="font-medium">{booking.startDate} a las {booking.startTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Fin prevista</span>
                  <span className="font-medium">{booking.endDate} a las {booking.endTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duracion</span>
                  <span className="font-medium">{originalDays} dia{originalDays > 1 ? 's' : ''}</span>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Nueva fecha de devolucion</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={booking.endDate}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]"
                  />
                </div>
              </div>

              {isValidExtension && extraDays > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Dias adicionales</span>
                    <span className="font-medium">+{extraDays} dia{extraDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Nueva duracion total</span>
                    <span className="font-medium">{newTotalDays} dia{newTotalDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="border-t border-amber-200 mt-2 pt-2 flex justify-between font-semibold">
                    <span>Coste prolongacion</span>
                    <span className="text-lg" style={{ color: '#ffaf10' }}>{extensionPrice}€</span>
                  </div>
                </div>
              )}

              <button
                onClick={checkAvailability}
                disabled={!isValidExtension || extraDays <= 0}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: '#ffaf10' }}
              >
                Verificar disponibilidad
              </button>
            </>
          )}

          {step === 'checking' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">...</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Verificando disponibilidad...</h2>
              <p className="text-sm text-gray-500">Comprobando que el vehiculo esta libre para las nuevas fechas</p>
            </div>
          )}

          {step === 'unavailable' && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">X</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">Vehiculo no disponible</h2>
              <p className="text-sm text-gray-500 mb-6">
                Lo sentimos, el vehiculo ya esta reservado para las fechas seleccionadas.
                Puede intentar con otras fechas.
              </p>
              <button
                onClick={() => setStep('form')}
                className="w-full py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: '#ffaf10' }}
              >
                Elegir otras fechas
              </button>
            </div>
          )}

          {step === 'available' && (
            <>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">OK</div>
                <h2 className="text-lg font-bold text-gray-800">Vehiculo disponible</h2>
                <p className="text-sm text-gray-500">Puede prolongar su reserva</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Nueva fecha de fin</span>
                  <span className="font-medium">{newEndDate} a las {newEndTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Dias adicionales</span>
                  <span className="font-medium">+{extraDays}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Importe a pagar</span>
                  <span className="text-lg" style={{ color: '#ffaf10' }}>{extensionPrice}€</span>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">Como desea pagar?</p>
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => { setPaymentMethod('stripe'); setStep('payment') }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all"
                >
                  <span className="text-2xl">CARD</span>
                  <span>
                    <p className="font-semibold text-gray-800 text-sm">Pagar ahora con tarjeta</p>
                    <p className="text-xs text-gray-500">Pago seguro por Stripe — {extensionPrice}€</p>
                  </span>
                </button>

                <button
                  onClick={() => { setPaymentMethod('agency'); setStep('payment') }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-left transition-all"
                >
                  <span className="text-2xl">SHOP</span>
                  <span>
                    <p className="font-semibold text-gray-800 text-sm">Pagar en agencia al devolver</p>
                    <p className="text-xs text-gray-500">El importe de {extensionPrice}€ se cobrara al check-out</p>
                  </span>
                </button>
              </div>
            </>
          )}

          {step === 'payment' && (
            <>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmar prolongacion</h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Vehiculo</span>
                  <span className="font-medium">{booking.fleetVehicle.vehicle.name.es}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Nueva fecha de fin</span>
                  <span className="font-medium">{newEndDate} a las {newEndTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Dias adicionales</span>
                  <span className="font-medium">+{extraDays}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Importe</span>
                  <span style={{ color: '#ffaf10' }}>{extensionPrice}€</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                {paymentMethod === 'stripe' ? (
                  <p className="text-sm text-blue-800">
                    Se realizara un cargo de <strong>{extensionPrice}€</strong> en su tarjeta ahora.
                    Un nuevo contrato sera generado con las nuevas fechas.
                  </p>
                ) : (
                  <p className="text-sm text-blue-800">
                    El importe de <strong>{extensionPrice}€</strong> sera cobrado en agencia al devolver el vehiculo.
                    El operador tendra la informacion del pago pendiente al hacer el check-out.
                    Un nuevo contrato sera generado con las nuevas fechas.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('available')}
                  className="flex-1 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Atras
                </button>
                <button
                  onClick={confirmExtension}
                  disabled={loading}
                  className="flex-1 py-3 rounded-lg font-semibold text-white transition-all"
                  style={{ backgroundColor: '#ffaf10' }}
                >
                  {loading ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">OK</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reserva prolongada</h2>
              <p className="text-sm text-gray-500 mb-6">
                {paymentMethod === 'stripe'
                  ? `El pago de ${extensionPrice}€ ha sido procesado correctamente.`
                  : `El importe de ${extensionPrice}€ sera cobrado en agencia al devolver el vehiculo.`
                }
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Nueva fecha de fin</span>
                  <span className="font-medium">{newEndDate} a las {newEndTime}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Duracion total</span>
                  <span className="font-medium">{newTotalDays} dia{newTotalDays > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Metodo de pago</span>
                  <span className="font-medium">{paymentMethod === 'stripe' ? 'Tarjeta (pagado)' : 'En agencia (pendiente)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nuevo contrato</span>
                  <span className="font-medium text-[#ffaf10]">CTR-2026-003-EXT</span>
                </div>
              </div>

              <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-3">
                Descargar nuevo contrato (PDF)
              </button>

              <button
                onClick={() => navigate(`/reservas/${booking.id}`)}
                className="w-full py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: '#ffaf10' }}
              >
                Volver a mi reserva
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}