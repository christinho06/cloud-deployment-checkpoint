import { createContext, useContext, useState } from 'react'

const RATES = { EUR: 1, USD: 1.08, XOF: 655.957 }

const CurrencyContext = createContext()

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem('gm_currency') || 'EUR'
  )

  const formatPrice = (eurAmount) => {
    if (!eurAmount && eurAmount !== 0) return ''
    const converted = eurAmount * RATES[currency]
    if (currency === 'XOF') return `CFA ${Math.round(converted).toLocaleString('fr-FR')}`
    if (currency === 'USD') return `$${converted.toFixed(2)}`
    return `${converted.toFixed(2)} €`
  }

  const changeCurrency = (c) => {
    setCurrency(c)
    localStorage.setItem('gm_currency', c)
  }

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
