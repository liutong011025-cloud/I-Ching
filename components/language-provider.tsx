'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Language = 'zh' | 'en'
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'zh', setLanguage: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>('zh')
  useEffect(() => {
    try { if (localStorage.getItem('eguide-language') === 'en') updateLanguage('en') } catch {}
  }, [])
  useEffect(() => { document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en' }, [language])
  const setLanguage = (next: Language) => {
    updateLanguage(next)
    try { localStorage.setItem('eguide-language', next) } catch {}
  }
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
