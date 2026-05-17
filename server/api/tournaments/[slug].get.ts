/**
 * GET /api/tournaments/:slug
 * Tournament 1건과 산하 events (+태그) 전부 반환.
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  }

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      brand: { select: { slug: true, name: true, logoUrl: true, websiteUrl: true } },
      events: {
        orderBy: [{ date: 'asc' }, { registrationStart: 'asc' }, { orderNo: 'asc' }],
        include: {
          tags: {
            include: {
              tag: { select: { slug: true, name: true, nameKo: true, category: true } }
            }
          },
          structureLevels: { orderBy: { level: 'asc' } }
        }
      }
    }
  })

  if (!tournament) {
    throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })
  }

  return applyStatus(tournament)
})
