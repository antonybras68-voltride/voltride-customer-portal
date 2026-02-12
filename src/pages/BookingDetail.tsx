import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { mockBookings } from '../mock/data'

interface BookingDetailProps {
  customer: { id: number; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function BookingDetail({ customer, onLogout }: BookingDetailProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const booking = mockBookings.find(b => b.id === Number(id))

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

  const canModify = booking.status !== 'CANCELLED' && !booking.checkedIn
  const canCancel = !booking.checkedIn && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
  const canExtend = booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && !booking.checkedOut

  const startDateTime = new Date(`${booking.startDate}T${booking.startTime}`)
  const hoursBeforeStart = (startDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  const refundable = hoursBeforeStart >= 48

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/reservas')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Mis reservas
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{booking.fleetVehicle.vehicle.name.es}</h1>
              <p className="text-sm text-gray-500">Ref: {booking.reference}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Fecha inicio</span>
              <span className="font-medium">{booking.startDate} a las {booking.startTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Fecha fin</span>
              <span className="font-medium">{booking.endDate} a las {booking.endTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Precio total</span>
              <span className="font-bold text-lg">{booking.totalPrice}€</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Pagado</span>
              <span className="font-medium text-green-600">{booking.paidAmount}€</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500">Fianza</span>
              <span className="font-medium">{booking.depositAmount}€</span>
            </div>
          </div>

          {booking.options.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Opciones</h3>
              {booking.options.map((opt, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{opt.option.name} x{opt.quantity}</span>
                  <span>{opt.totalPrice}€</span>
                </div>
              ))}
            </div>
          )}

          {booking.contract && (
            <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mb-3">
              Descargar contrato ({booking.contract.contractNumber})
            </button>
          )}

          <div className="space-y-3 mt-4">
            <div className="flex gap-3">
              {canModify && (
                <button
                  onClick={() => navigate(`/reservas/${booking.id}/modificar`)}
                  className="flex-1 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: '#ffaf10' }}
                >
                  Modificar fechas
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => {
                    const message = refundable
                      ? `Su reserva será cancelada y recibirá un reembolso completo de ${booking.paidAmount}€`
                      : `Su reserva será cancelada. El anticipo de ${booking.paidAmount}€ no será reembolsado (cancelación con menos de 48h de antelación)`
                    if (confirm(message + '\n\n¿Confirmar cancelación?')) {
                      alert('Reserva cancelada (mock)')
                    }
                  }}
                  className="flex-1 py-3 rounded-lg font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50"
                >
                  Cancelar reserva
                </button>
              )}
            </div>
            {canExtend && (
              <button
                onClick={() => navigate(`/reservas/${booking.id}/prolongar`)}
                className="w-full py-3 rounded-lg font-semibold border-2 border-[#abdee6] text-[#abdee6] hover:bg-cyan-50"
              >
                Prolongar reserva
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}