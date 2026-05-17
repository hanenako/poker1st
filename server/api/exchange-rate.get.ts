/**
 * GET /api/exchange-rate
 * JPY → KRW 환율을 외부 무료 API에서 가져와 1시간 캐싱
 * 출처: https://open.er-api.com (무료, 인증키 불필요)
 */

// 서버 메모리 캐시 (재시작 시 초기화)
let cache: { rate: number; updatedAt: string } | null = null
let cacheTs = 0
const CACHE_TTL = 60 * 60 * 1000 // 1시간

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cache && now - cacheTs < CACHE_TTL) {
    return { ...cache, cached: true }
  }

  try {
    const res = await $fetch<{ rates: Record<string, number>; time_last_update_utc: string }>(
      'https://open.er-api.com/v6/latest/JPY',
      { timeout: 5000 }
    )

    const rate = res.rates?.KRW
    if (!rate) throw new Error('KRW rate not found')

    cache = {
      rate: Math.round(rate * 100) / 100,
      updatedAt: res.time_last_update_utc
    }
    cacheTs = now
    return { ...cache, cached: false }
  } catch (e) {
    // 외부 API 실패 시 캐시 있으면 반환, 없으면 fallback
    if (cache) return { ...cache, cached: true, stale: true }
    return { rate: 9.5, updatedAt: null, cached: false, stale: true }
  }
})
