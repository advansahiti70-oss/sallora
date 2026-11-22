import { useEffect, useState } from 'react'
import { LANGUAGES, messages, type Language } from './messages'

const STORAGE_KEY = 'sallora.language'

const isLanguage = (value: string | null): value is Language =>
  value !== null && (LANGUAGES as readonly string[]).includes(value)

/** The visitor's saved choice, else the first browser language we speak, else English. */
function startingLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(saved)) return saved
  } catch {
    // Storage can be blocked (private mode); the browser language still works.
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLanguage(base)) return base
  }
  return 'en'
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(startingLanguage)
  const t = messages[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.title = t.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description)
  }, [language, t])

  const chooseLanguage = (next: Language) => {
    setLanguage(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Not saved; the page still switches.
    }
  }

  return { language, chooseLanguage, t }
}
