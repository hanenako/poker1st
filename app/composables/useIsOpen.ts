/**
 * 포커룸 "지금 영업 중" 판단 — 로케일 대응 버전
 * hours 형식: { mon: ["17:00-28:00"], tue: ["11:00-02:00"], ... }
 * 시간대: JST (Asia/Tokyo) 기준
 *
 * 자정 넘김 처리:
 *   - "17:00-02:00" (wrap-around): inSlot에서 end < start 분기로 처리
 *   - "17:00-28:00" (28:00 = 다음날 04:00): toMin()이 1680으로 변환 후 처리
 * 두 경우 모두, 어제 슬롯을 (nowMin + 1440)으로 비교해 커버한다.
 */

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

// 오늘 슬롯 체크: end > start 이면 같은날/연장(27:00), end < start 이면 wrap-around(03:00)
function inSlot(nowMin: number, slot: string): boolean {
  const [startStr, endStr] = slot.split('-')
  if (!startStr || !endStr) return false
  const start = toMin(startStr)
  const end   = toMin(endStr)
  return end > start
    ? nowMin >= start && nowMin < end
    : nowMin >= start || nowMin < end
}

// 어제 슬롯이 자정 넘어 지금까지 이어지는지 체크
// - 27:00 스타일(end > 1440): nowMin+1440 이 [start, end) 안에 있는지
// - wrap-around 스타일(end < start, 예: 03:00): nowMin < end 이면 아직 영업중
function inSlotFromYesterday(nowMin: number, slot: string): boolean {
  const [startStr, endStr] = slot.split('-')
  if (!startStr || !endStr) return false
  const start = toMin(startStr)
  const end   = toMin(endStr)
  if (end > 1440) {
    return nowMin + 1440 >= start && nowMin + 1440 < end
  }
  if (end < start) {
    return nowMin < end
  }
  return false
}

/** 현재 영업 중인 요일 키를 반환. 어제 슬롯이 자정 넘어 활성 중이면 어제 키를 반환. */
export function getActiveDayKey(
  h: Record<string, string[]>,
  jst: Date
): string {
  const dayIdx = jst.getDay()
  const nowMin = jst.getHours() * 60 + jst.getMinutes()
  const todayKey = DAY_KEYS[dayIdx]

  const todaySlots: string[] = Array.isArray(h[todayKey]) ? h[todayKey] : []
  for (const slot of todaySlots) {
    if (inSlot(nowMin, slot)) return todayKey
  }

  const yesterdayKey = DAY_KEYS[(dayIdx + 6) % 7]
  const yesterdaySlots: string[] = Array.isArray(h[yesterdayKey]) ? h[yesterdayKey] : []
  for (const slot of yesterdaySlots) {
    if (inSlotFromYesterday(nowMin, slot)) return yesterdayKey
  }

  return todayKey
}

export interface OpenStatus {
  open:  boolean
  label: string
  color: string
}

/** composable 버전 — 로케일 반응형 레이블 반환 */
export function useIsOpen() {
  const { ui } = useUiT()

  function checkIsOpen(hours: unknown): OpenStatus {
    if (!hours || typeof hours !== 'object') return { open: false, label: '', color: '' }

    const h = hours as Record<string, string[]>
    const now = new Date()
    const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    const dayIdx = jst.getDay()
    const nowMin = jst.getHours() * 60 + jst.getMinutes()
    const todayKey = DAY_KEYS[dayIdx]

    // 오늘 슬롯
    const todaySlots: string[] = Array.isArray(h[todayKey]) ? h[todayKey] : []
    for (const slot of todaySlots) {
      if (inSlot(nowMin, slot)) return { open: true, label: ui.value.open, color: 'text-emerald-600' }
    }

    // 어제 슬롯이 자정 넘어 이어지는지
    const yesterdayKey = DAY_KEYS[(dayIdx + 6) % 7]
    const yesterdaySlots: string[] = Array.isArray(h[yesterdayKey]) ? h[yesterdayKey] : []
    for (const slot of yesterdaySlots) {
      if (inSlotFromYesterday(nowMin, slot)) return { open: true, label: ui.value.open, color: 'text-emerald-600' }
    }

    const hasAnySlot = todaySlots.length > 0
    return {
      open:  false,
      label: hasAnySlot ? ui.value.closed : ui.value.closedToday,
      color: 'text-zinc-400'
    }
  }

  return { checkIsOpen }
}

/** 하위 호환용 — 로케일 무관 (pubs/index.vue filter 전용) */
export function checkIsOpenRaw(hours: unknown): { open: boolean } {
  if (!hours || typeof hours !== 'object') return { open: false }
  const h = hours as Record<string, string[]>
  const now = new Date()
  const jst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
  const dayIdx = jst.getDay()
  const nowMin = jst.getHours() * 60 + jst.getMinutes()
  const todayKey = DAY_KEYS[dayIdx]

  const todaySlots: string[] = Array.isArray(h[todayKey]) ? h[todayKey] : []
  for (const slot of todaySlots) {
    if (inSlot(nowMin, slot)) return { open: true }
  }

  const yesterdayKey = DAY_KEYS[(dayIdx + 6) % 7]
  const yesterdaySlots: string[] = Array.isArray(h[yesterdayKey]) ? h[yesterdayKey] : []
  for (const slot of yesterdaySlots) {
    if (inSlotFromYesterday(nowMin, slot)) return { open: true }
  }

  return { open: false }
}
