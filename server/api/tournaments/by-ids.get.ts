/**
 * GET /api/tournaments/by-ids?ids=1,2,3
 * 비로그인 localStorage 즐겨찾기용 — ID 배열로 대회 목록 반환
 */
import { applyStatus } from '../../utils/tournamentStatus'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw = String(query.ids ?? '')
  if (!raw) return []

  const ids = raw.split(',').map(Number).filter(n => !isNaN(n) && n > 0)
  if (!ids.length) return []

  const tournaments = await prisma.tournament.findMany({
    where: { id: { in: ids }, publishedAt: { not: null } },
    include: { brand: { select: { slug: true, name: true, logoUrl: true } } },
    orderBy: { startDate: 'asc' }
  })

  return tournaments.map(applyStatus)
})
