import { createContext, useContext, useState } from 'react'
import fr from '../i18n/fr'
import en from '../i18n/en'

const translations = { fr, en }
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('gm_lang')
    if (saved) return saved
    return navigator.language?.startsWith('fr') ? 'fr' : 'en'
  })

  const t = (key) => translations[lang]?.[key] ?? translations.fr[key] ?? key

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('gm_lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
