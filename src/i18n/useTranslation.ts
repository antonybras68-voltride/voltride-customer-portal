import { translations, type Lang } from './translations'

let currentLang: Lang = 'es'

export function setLang(lang: Lang) {
  currentLang = lang
}

export function getLang(): Lang {
  return currentLang
}

export function initLang() {
  const urlParams = new URLSearchParams(window.location.search)
  const urlLang = urlParams.get('lang')
  if (urlLang && ['es', 'fr', 'en'].includes(urlLang)) {
    currentLang = urlLang as Lang
    return
  }

  const browserLang = navigator.language.slice(0, 2)
  if (['es', 'fr', 'en'].includes(browserLang)) {
    currentLang = browserLang as Lang
    return
  }

  currentLang = 'es'
}

export function t(key: string): string {
  return translations[currentLang]?.[key] || translations['es'][key] || key
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function useTranslation() {
  return { t, lang: currentLang, setLang, formatDate }
}