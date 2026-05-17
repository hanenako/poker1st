/**
 * 다국어 로케일 선택
 * 쿠키에 'locale' 저장. 언어 추가 시 LOCALES 배열에만 추가하면 됨.
 */
export type Locale = 'ko' | 'ja' | 'en'

export const LOCALES = [
  { value: 'ko' as Locale, label: '한국어', flag: '🇰🇷' },
  { value: 'ja' as Locale, label: '日本語', flag: '🇯🇵' },
  { value: 'en' as Locale, label: 'English', flag: '🇺🇸' },
]

export function useLocale() {
  const locale = useCookie<Locale>('locale', {
    default: () => 'ko',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  function setLocale(l: Locale) {
    locale.value = l
  }

  const currentLocale = computed(() =>
    LOCALES.find(l => l.value === locale.value) ?? LOCALES[0]
  )

  /** ko/ja/en 필드 중 현재 로케일에 맞는 값 반환 */
  function t(
    ko: string | null | undefined,
    ja: string | null | undefined,
    en: string | null | undefined
  ): string {
    if (locale.value === 'ja') return ja || ko || en || ''
    if (locale.value === 'en') return en || ko || ja || ''
    return ko || en || ja || ''
  }

  const isKo = computed(() => locale.value === 'ko')
  const isJa = computed(() => locale.value === 'ja')
  const isEn = computed(() => locale.value === 'en')

  return { locale, setLocale, currentLocale, t, isKo, isJa, isEn }
}
