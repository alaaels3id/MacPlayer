export interface LanguageInfo {
  code: string
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' }
]

export function getLanguageName(code: string): string {
  const normalized = code.toLowerCase().trim()
  const found = SUPPORTED_LANGUAGES.find(
    (l) => l.code === normalized || l.name.toLowerCase() === normalized
  )
  return found ? found.name : code.toUpperCase()
}

export function detectLanguageFromFilename(filename: string): string | null {
  const lower = filename.toLowerCase()
  for (const lang of SUPPORTED_LANGUAGES) {
    // Check patterns like .ar.srt, [ar], -ar-, .arabic.
    const patterns = [
      `.${lang.code}.`,
      `[${lang.code}]`,
      `_${lang.code}_`,
      `-${lang.code}-`,
      `.${lang.name.toLowerCase()}.`
    ]
    for (const p of patterns) {
      if (lower.includes(p)) {
        return lang.code
      }
    }
  }
  return null
}
