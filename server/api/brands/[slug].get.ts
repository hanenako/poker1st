/**
 * GET /api/brands/:slug
 * Brand 1건 + 산하 Tournaments (실시간 상태 계산 적용).
 */
import { applyStatus } from '../../utils/tournamentStatus'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  }

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      tournaments: {
        where: { publishedAt: { not: null } },
        orderBy: { startDate: 'asc' }
      }
    }
  })

  if (!brand) {
    throw createError({ statusCode: 404, statusMessage: 'Brand not found' })
  }

  return {
    ...brand,
    tournaments: brand.tournaments.map(applyStatus)
  }
})
