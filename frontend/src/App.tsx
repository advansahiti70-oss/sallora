import type { ReactNode } from 'react'
import './App.css'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { Logo } from './components/Logo'
import { useLanguage } from './i18n/useLanguage'

const NO_BREAK_SPACE = String.fromCharCode(160)

/** Digits use JetBrains Mono, as the brand book asks for prices; "39 €" never breaks across two lines. */
function withNumbers(text: string): ReactNode[] {
  return text
    .replace(/(\d) €/g, `$1${NO_BREAK_SPACE}€`)
    .split(/(\d+)/)
    .map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="num">
          {part}
        </span>
      ) : (
        part
      ),
    )
}

/** The landing page: the only screen this weekend. */
export default function App() {
  const { language, chooseLanguage, t } = useLanguage()

  return (
    <div className="page">
      <header className="topbar">
        <LanguageSwitcher value={language} label={t.languageLabel} onChange={chooseLanguage} />
      </header>

      <main className="hero">
        <h1 className="hero__brand">
          <span className="visually-hidden">Sallora</span>
          <Logo className="hero__logo" />
        </h1>
        <p className="hero__tagline">{t.tagline}</p>
        <p className="hero__pitch">{t.pitch}</p>
        <p className="hero__offer">{withNumbers(t.offer)}</p>
      </main>

      <footer className="footer">
        <p className="footer__promise">{t.promise}</p>
        <p className="footer__meta">
          {t.madeFor} <span aria-hidden="true">·</span> © 2026 Sallora
        </p>
      </footer>
    </div>
  )
}
