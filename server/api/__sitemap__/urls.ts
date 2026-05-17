export default defineEventHandler(async () => {
  const [tournaments, pubs, brands, notices] = await Promise.all([
    prisma.tournament.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true }
    }),
    prisma.pub.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true }
    }),
    prisma.brand.findMany({
      select: { slug: true, updatedAt: true }
    }),
    prisma.notice.findMany({
      where: { publishedAt: { not: null } },
      select: { id: true, updatedAt: true }
    })
  ])

  return [
    { loc: '/guide',       changefreq: 'monthly', priority: 0.7 },
    { loc: '/leaderboard', changefreq: 'weekly',  priority: 0.7 },
    ...tournaments.map(t => ({
      loc:        `/tournaments/${t.slug}`,
      lastmod:    t.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority:   0.8
    })),
    ...pubs.map(p => ({
      loc:        `/pubs/${p.slug}`,
      lastmod:    p.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority:   0.7
    })),
    ...brands.map(b => ({
      loc:        `/brands/${b.slug}`,
      lastmod:    b.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority:   0.6
    })),
    ...notices.map(n => ({
      loc:        `/notice/${n.id}`,
      lastmod:    n.updatedAt.toISOString(),
      changefreq: 'yearly',
      priority:   0.5
    }))
  ]
})
