/**
 * Every user-facing string, in Albanian (sq), Macedonian (mk) and English (en).
 * Tone: calm, direct, warm (docs/brand-book.md). Taglines come from the brand book.
 * The sq and mk wording was written by Claude: have a native speaker check it before launch.
 */
export const LANGUAGES = ['sq', 'mk', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const languageNames: Record<Language, string> = {
  sq: 'Shqip',
  mk: 'Македонски',
  en: 'English',
}

const en = {
  title: 'Sallora · Every table, on time.',
  description:
    'Sallora connects to the cameras a café or restaurant already has and tells the waiters, live, which table needs them.',
  languageLabel: 'Language',
  tagline: 'Every table, on time.',
  pitch:
    'Sallora connects to the cameras a café or restaurant already has and tells the waiters, live, which table needs them, with no new cameras and no video ever leaving the venue.',
  offer: 'Free 14-day pilot, then €39 a month per venue.',
  promise: 'It watches tables, not people.',
  madeFor: 'Built for cafés and restaurants in Kosovo and North Macedonia.',
}

export type Messages = Record<keyof typeof en, string>

export const messages: Record<Language, Messages> = {
  sq: {
    title: 'Sallora · Çdo tavolinë, në kohë.',
    description:
      'Sallora lidhet me kamerat që kafeneja ose restoranti i ka tashmë dhe u tregon kamarierëve, në kohë reale, cila tavolinë ka nevojë për ta.',
    languageLabel: 'Gjuha',
    tagline: 'Çdo tavolinë, në kohë.',
    pitch:
      'Sallora lidhet me kamerat që kafeneja ose restoranti i ka tashmë dhe u tregon kamarierëve, në kohë reale, cila tavolinë ka nevojë për ta, pa kamera të reja, dhe videoja nuk del kurrë nga lokali.',
    offer: 'Pilot falas për 14 ditë, pastaj 39 € në muaj për lokal.',
    promise: 'Shikon tavolinat, jo njerëzit.',
    madeFor: 'Për kafenetë dhe restorantet në Kosovë dhe në Maqedoninë e Veriut.',
  },
  mk: {
    title: 'Sallora · Секоја маса, навреме.',
    description:
      'Sallora се поврзува со камерите што кафулето или ресторанот веќе ги има и им кажува на келнерите, во реално време, на која маса ѝ се потребни.',
    languageLabel: 'Јазик',
    tagline: 'Секоја маса, навреме.',
    pitch:
      'Sallora се поврзува со камерите што кафулето или ресторанот веќе ги има и им кажува на келнерите, во реално време, на која маса ѝ се потребни, без нови камери, а видеото никогаш не излегува од локалот.',
    offer: 'Бесплатен пилот 14 дена, потоа 39 € месечно по локал.',
    promise: 'Ги гледа масите, не луѓето.',
    madeFor: 'За кафулиња и ресторани во Косово и Северна Македонија.',
  },
  en,
}
