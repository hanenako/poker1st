/**
 * GET /api/admin/users?page=1&pageSize=20&q=검색어
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query    = getQuery(event)
  const page     = Math.max(1, Number(query.page) || 1)
  const pageSize = Math.min(100, Number(query.pageSize) || 20)
  const q        = String(query.q || '').trim()

  const where = q
    ? { OR: [
        { email: { contains: q, mode: 'insensitive' as const } },
        { name:  { contains: q, mode: 'insensitive' as const } },
      ]}
    : {}

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * pageSize,
      take:  pageSize,
      select: {
        id: true, email: true, name: true, role: true,
        provider: true, avatarUrl: true, createdAt: true,
        _count: { select: { reviews: true, favorites: true } }
      }
    })
  ])

  return { data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
})
