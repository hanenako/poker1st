/**
 * GET /api/admin/stats
 * 관리자 대시보드용 통계.
 */
import { applyStatus } from '../../utils/tournamentStatus'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [
    tournamentRows,
    eventsTotal,
    pubsTotal,
    pubsDraft,
    brandsTotal,
    noticesTotal,
    noticesPublished,
    usersTotal,
    reviewsTotal,
    reviewsAvg,
    favoritesTotal,
    recentTournaments,
    recentPubs,
    recentReviews
  ] = await Promise.all([
    prisma.tournament.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.event.count(),
    prisma.pub.count({ where: { publishedAt: { not: null } } }),
    prisma.pub.count({ where: { publishedAt: null } }),
    prisma.brand.count(),
    prisma.notice.count(),
    prisma.notice.count({ where: { publishedAt: { not: null } } }),
    prisma.user.count(),
    prisma.pubReview.count(),
    prisma.pubReview.aggregate({ _avg: { ratingAtmosphere: true, ratingDealer: true, ratingWait: true, ratingValue: true } }),
    prisma.favorite.count(),
    prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: {
        id: true, titleShort: true, status: true,
        startDate: true, endDate: true, slug: true, createdAt: true
      }
    }),
    prisma.pub.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true, slug: true, name: true,
        city: true, publishedAt: true, createdAt: true,
        _count: { select: { reviews: true } }
      }
    }),
    prisma.pubReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        ratingAtmosphere: true, ratingDealer: true, ratingWait: true, ratingValue: true,
        body: true, createdAt: true,
        pub:  { select: { id: true, slug: true, name: true } },
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    })
  ])

  const byStatus: Record<string, number> = {}
  let tournamentsTotal = 0
  for (const row of tournamentRows) {
    byStatus[row.status] = row._count._all
    tournamentsTotal += row._count._all
  }

  return {
    tournaments: {
      total:     tournamentsTotal,
      upcoming:  byStatus['UPCOMING']  ?? 0,
      ongoing:   byStatus['ONGOING']   ?? 0,
      finished:  byStatus['FINISHED']  ?? 0,
      cancelled: byStatus['CANCELLED'] ?? 0
    },
    events:    { total: eventsTotal },
    pubs:      { total: pubsTotal, draft: pubsDraft },
    brands:    { total: brandsTotal },
    notices:   { total: noticesTotal, published: noticesPublished },
    users:     { total: usersTotal },
    reviews:   {
      total: reviewsTotal,
      avgRating: (() => {
        const vals = [
          reviewsAvg._avg.ratingAtmosphere,
          reviewsAvg._avg.ratingDealer,
          reviewsAvg._avg.ratingWait,
          reviewsAvg._avg.ratingValue
        ].filter(v => v != null)
        return vals.length ? vals.reduce((s, v) => s + Number(v), 0) / vals.length : 0
      })()
    },
    favorites: { total: favoritesTotal },
    recentTournaments: recentTournaments.map(applyStatus),
    recentPubs,
    recentReviews
  }
})
