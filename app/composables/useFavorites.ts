/**
 * useFavorites
 * - 로그인 시: 서버 API 기반 즐겨찾기
 * - 비로그인 시: localStorage 기반 즐겨찾기 (tournament ID 배열)
 */
export const useFavorites = () => {
  const { loggedIn } = useUserSession()

  // 앱 전역 공유 상태
  const favIds = useState<number[]>('favIds', () => [])
  const loaded = useState<boolean>('favsLoaded', () => false)

  // ── localStorage 헬퍼 ───────────────────────────────────
  const LS_KEY = 'pokertripjp_favs'

  function readLocalIds(): number[] {
    if (import.meta.server) return []
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function writeLocalIds(ids: number[]) {
    if (import.meta.server) return
    try { localStorage.setItem(LS_KEY, JSON.stringify(ids)) } catch {}
  }

  // ── 초기 로드 ────────────────────────────────────────────
  async function ensureLoaded() {
    if (loaded.value) return

    if (loggedIn.value) {
      const data = await $fetch<{ id: number }[]>('/api/favorites')
      favIds.value = data.map(t => t.id)
    } else {
      favIds.value = readLocalIds()
    }
    loaded.value = true
  }

  function isFav(id: number) {
    return favIds.value.includes(id)
  }

  async function toggleFav(tournamentId: number) {
    if (loggedIn.value) {
      // 서버 동기
      if (isFav(tournamentId)) {
        await $fetch(`/api/favorites/${tournamentId}`, { method: 'DELETE' })
        favIds.value = favIds.value.filter(id => id !== tournamentId)
      } else {
        await $fetch('/api/favorites', { method: 'POST', body: { tournamentId } })
        favIds.value = [...favIds.value, tournamentId]
      }
    } else {
      // localStorage 동기
      let ids = readLocalIds()
      if (ids.includes(tournamentId)) {
        ids = ids.filter(id => id !== tournamentId)
      } else {
        ids = [...ids, tournamentId]
      }
      writeLocalIds(ids)
      favIds.value = ids
    }
  }

  return { ensureLoaded, isFav, toggleFav, favIds, loaded, readLocalIds }
}
