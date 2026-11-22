import { LANGUAGES, languageNames, type Language } from '../i18n/messages'

type LanguageSwitcherProps = {
  value: Language
  label: string
  onChange: (language: Language) => void
}

export function LanguageSwitcher({ value, label, onChange }: LanguageSwitcherProps) {
  return (
    <div className="language" role="group" aria-label={label}>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          lang={language}
          className="language__option"
          aria-pressed={language === value}
          title={languageNames[language]}
          onClick={() => onChange(language)}
        >
          {language.toUpperCase()}
          <span className="visually-hidden"> {languageNames[language]}</span>
        </button>
      ))}
    </div>
  )
}
