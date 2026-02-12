import { config } from '../config'
import { useTranslation } from '../i18n/useTranslation'

interface HeaderProps {
  customerName?: string
  onLogout?: () => void
}

export default function Header({ customerName, onLogout }: HeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <img src={config.logo} alt={config.name} className="h-10" />
        {customerName && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{t('header.hello')} {customerName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {t('header.logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}