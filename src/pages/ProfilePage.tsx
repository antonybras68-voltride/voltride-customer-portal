import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useTranslation } from '../i18n/useTranslation'
import { getProfile, updateProfile, requestDataDeletion } from '../api'

interface ProfilePageProps {
  customer: { id: string; firstName: string; lastName: string; email: string }
  onLogout: () => void
}

export default function ProfilePage({ customer, onLogout }: ProfilePageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'done'>('idle')
  const [deletionInfo, setDeletionInfo] = useState<any>(null)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(customer.id)
        setProfile(data)
        setFirstName(data.firstName || '')
        setLastName(data.lastName || '')
        setPhone(data.phone || '')
        setAddress(data.address || '')
        setPostalCode(data.postalCode || '')
        setCity(data.city || '')
        setCountry(data.country || '')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [customer.id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile(customer.id, {
        firstName, lastName, phone, address, postalCode, city, country
      })
      setSuccess(t('profile.saved'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = async () => {
    try {
      const result = await requestDataDeletion(customer.id)
      setDeletionInfo(result)
      setDeleteStep('done')
    } catch (err: any) {
      setError(err.message)
      setDeleteStep('idle')
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customerName={customer.firstName} onLogout={onLogout} />
      <div className="max-w-lg mx-auto px-4 py-8">
        <button onClick={() => navigate('/reservas')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← {t('profile.backToBookings')}
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{t('profile.title')}</h1>
          <p className="text-sm text-gray-500 mb-6">{profile?.email}</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4">{success}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.firstName')}</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.lastName')}</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.address')}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.postalCode')}</label>
                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.city')}</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.country')}</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#abdee6]" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ backgroundColor: '#ffaf10' }}>
              {saving ? '...' : t('profile.save')}
            </button>
          </form>
        </div>

        {/* Section RGPD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t('profile.dataTitle')}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('profile.dataDescription')}</p>

          {profile?.lastBookingEndDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                {t('profile.retentionWarning')} {profile.lastBookingEndDate}.
                {t('profile.retentionExplanation')}
              </p>
            </div>
          )}

          {profile?.activeBookingsCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">{t('profile.activeBookingsWarning')}</p>
            </div>
          )}

          {deleteStep === 'idle' && (
            <button
              onClick={() => setDeleteStep('confirm')}
              disabled={profile?.activeBookingsCount > 0}
              className="w-full py-3 rounded-lg font-semibold border-2 border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('profile.requestDeletion')}
            </button>
          )}

          {deleteStep === 'confirm' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 mb-4">{t('profile.confirmDeletion')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteStep('idle')}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">
                  {t('profile.cancelDeletion')}
                </button>
                <button onClick={handleDeleteRequest}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-semibold">
                  {t('profile.confirmDeleteBtn')}
                </button>
              </div>
            </div>
          )}

          {deleteStep === 'done' && deletionInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800">{deletionInfo.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}