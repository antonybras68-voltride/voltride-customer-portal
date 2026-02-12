import { useState } from 'react'

const PHONE = '+34655489614'
const PHONE_DISPLAY = '655 489 614'

interface BookingInfo {
  reference: string
  vehicleName: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
}

interface AssistanceButtonProps {
  customerName?: string
  customerEmail?: string
  activeBooking?: BookingInfo | null
}

export default function AssistanceButton({ customerName, customerEmail, activeBooking }: AssistanceButtonProps) {
  const [open, setOpen] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  const buildMessage = (location?: string) => {
    let msg = '*ASISTENCIA SOLICITADA*\n\n'
    if (customerName) msg += `Cliente: ${customerName}\n`
    if (customerEmail) msg += `Email: ${customerEmail}\n`
    if (activeBooking) {
      msg += `\n*Vehiculo:* ${activeBooking.vehicleName}\n`
      msg += `Ref: ${activeBooking.reference}\n`
      msg += `${activeBooking.startDate} ${activeBooking.startTime} → ${activeBooking.endDate} ${activeBooking.endTime}\n`
    }
    if (location) {
      msg += `\n*Ubicacion:* ${location}\n`
    }
    return msg
  }

  const sendLocation = () => {
    setLocationStatus('loading')

    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const mapsLink = `https://maps.google.com/maps?q=${latitude},${longitude}`
        const message = buildMessage(mapsLink)
        const whatsappUrl = `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
        setLocationStatus('sent')
      },
      () => {
        setLocationStatus('error')
      }
    )
  }

  const openWhatsApp = () => {
    const message = buildMessage()
    const whatsappUrl = `https://wa.me/${PHONE.replace('+', '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const callPhone = () => {
    window.location.href = `tel:${PHONE}`
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
        style={{ width: '72px', height: '72px', fontSize: '32px' }}
      >
        {open ? '✕' : '🆘'}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="bg-green-500 text-white px-5 py-4">
            <h3 className="font-bold text-lg">Asistencia</h3>
            <p className="text-sm text-green-100">Estamos aquí para ayudarte</p>
          </div>

          {activeBooking && (
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs text-gray-500">Vehículo en curso</p>
              <p className="text-sm font-semibold text-gray-800">{activeBooking.vehicleName}</p>
              <p className="text-xs text-gray-500">Ref: {activeBooking.reference}</p>
            </div>
          )}

          <div className="p-5 space-y-3">
            <button
              onClick={sendLocation}
              disabled={locationStatus === 'loading'}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all text-left"
            >
              <span className="text-2xl">📍</span>
              <span>
                <p className="font-semibold text-gray-800 text-sm">Enviar mi ubicación</p>
                <p className="text-xs text-gray-500">
                  {locationStatus === 'loading' && 'Obteniendo ubicación...'}
                  {locationStatus === 'sent' && '✅ Ubicación enviada'}
                  {locationStatus === 'error' && '❌ No se pudo obtener la ubicación'}
                  {locationStatus === 'idle' && 'Compartir por WhatsApp'}
                </p>
              </span>
            </button>

            <button
              onClick={openWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all text-left"
            >
              <span className="text-2xl">💬</span>
              <span>
                <p className="font-semibold text-gray-800 text-sm">Escribir por WhatsApp</p>
                <p className="text-xs text-gray-500">Enviar un mensaje directo</p>
              </span>
            </button>

            <button
              onClick={callPhone}
              className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all text-left"
            >
              <span className="text-2xl">📞</span>
              <span>
                <p className="font-semibold text-gray-800 text-sm">Llamar</p>
                <p className="text-xs text-gray-500">{PHONE_DISPLAY}</p>
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
