/**
 * 다크모드 관리 composable
 * - localStorage에 preference 저장
 * - prefers-color-scheme 자동 감지 (저장값 없을 때)
 * - <html class="dark"> 토글
 */
export function useColorMode() {
  const isDark = useState<boolean>('colorMode', () => false)

  function applyClass(dark: boolean) {
    if (import.meta.server) return
    document.documentElement.classList.toggle('dark', dark)
  }

  function toggle() {
    isDark.value = !isDark.value
    applyClass(isDark.value)
    try { localStorage.setItem('colorMode', isDark.value ? 'dark' : 'light') } catch {}
  }

  function init() {
    if (import.meta.server) return
    try {
      const saved = localStorage.getItem('colorMode')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = saved !== null ? saved === 'dark' : prefersDark
      isDark.value = dark
      applyClass(dark)
    } catch {}
  }

  return { isDark, toggle, init }
}
