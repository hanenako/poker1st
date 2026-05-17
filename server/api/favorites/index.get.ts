/**
 * GET /api/favorites — 로그인 유저의 즐겨찾기 목록
 */
import { applyStatus } from '../../utils/tournamentStatus'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      tournament: {
        include: { brand: { select: { slug: true, name: true, logoUrl: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return favorites.map(f => applyStatus(f.tournament))
})
