/**
 * usePubCompare
 * 최대 3개 포커룸을 선택해서 비교하는 기능 (localStorage 기반)
 */
const MAX = 3
const LS_KEY = 'pokertripjp_compare'

export const usePubCompare = () => {
  const compareIds = useState<string[]>('pubCompareIds', () => [])

  function readLocal(): string[] {
    if (import.meta.server) return []
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function writeLocal(ids: string[]) {
    if (import.meta.server) return
    try { localStorage.setItem(LS_KEY, JSON.stringify(ids)) } catch {}
  }

  function initCompare() {
    if (import.meta.server) return
    compareIds.value = readLocal()
  }

  function isSelected(slug: string) {
    return compareIds.value.includes(slug)
  }

  function toggle(slug: string) {
    let ids = [...compareIds.value]
    if (ids.includes(slug)) {
      ids = ids.filter(id => id !== slug)
    } else {
      if (ids.length >= MAX) ids.shift() // 3개 초과 시 가장 오래된 항목 제거
      ids.push(slug)
    }
    compareIds.value = ids
    writeLocal(ids)
  }

  function remove(slug: string) {
    const ids = compareIds.value.filter(id => id !== slug)
    compareIds.value = ids
    writeLocal(ids)
  }

  function clear() {
    compareIds.value = []
    writeLocal([])
  }

  return { compareIds, isSelected, toggle, remove, clear, initCompare }
}
