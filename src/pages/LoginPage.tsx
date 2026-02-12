import { useState } from 'react'
import Header from '../components/Header'
import { config } from '../config'

interface LoginPageProps {
  onLogin: (customer: { id: number; firstName: string; lastName: string; email: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // MOCK : on simule l'envoi du code
    setTimeout(() => {
      setStep('code')
      setLoading(false)
    }, 1000)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // MOCK : on simule la vérification (n'importe quel code de 6 chiffres marche)
    setTimeout(() => {
      if (code.length === 6) {
        onLogin({ id: 1, firstName: 'Juan', lastName: 'García', email })
      } else {
        setError('El código debe tener 6 dígitos')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Mi Reserva
          </h1>
          <p className="text-center text-gray-500 mb-8">
            {step === 'email'
              ? 'Introduce tu email para acceder a tus reservas'
              : `Hemos enviado un código a ${email}`}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6] mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: config.accentColor }}
              >
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6] mb-2 text-center text-2xl tracking-[0.5em] font-mono"
              />
              <p className="text-xs text-gray-400 mb-4 text-center">
                Introduce el código de 6 dígitos
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all"
                style={{ backgroundColor: config.accentColor }}
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                ← Cambiar email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}