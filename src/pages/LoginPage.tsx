import { useState } from 'react'
import Header from '../components/Header'
import { config } from '../config'
import { useTranslation } from '../i18n/useTranslation'
import { sendLoginCode, verifyCode } from '../api'

interface LoginPageProps {
  onLogin: (customer: { id: string; firstName: string; lastName: string; email: string }) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await sendLoginCode(email)
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError(t('login.codeError'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await verifyCode(email, code)
      onLogin(data.customer)
    } catch (err: any) {
      setError(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto mt-16 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {t('login.title')}
          </h1>
          <p className="text-center text-gray-500 mb-8">
            {step === 'email'
              ? t('login.subtitle')
              : `${t('login.codeSent')} ${email}`}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6] mb-4"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: config.accentColor }}
              >
                {loading ? t('login.sending') : t('login.sendCode')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.verificationCode')}
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
                {t('login.codeHint')}
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: config.accentColor }}
              >
                {loading ? t('login.verifying') : t('login.verify')}
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError('') }}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                {t('login.changeEmail')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}