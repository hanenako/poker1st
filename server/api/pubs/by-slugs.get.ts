/**
 * GET /api/pubs/by-slugs?slugs=slug1,slug2,slug3
 * 비교 페이지용 — slug 배열로 pub 목록 반환
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const raw = String(query.slugs ?? '')
  if (!raw) return []

  const slugs = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
  if (!slugs.length) return []

  const pubs = await prisma.pub.findMany({
    where: { slug: { in: slugs }, publishedAt: { not: null } },
    include: { images: { take: 1, orderBy: { orderNo: 'asc' } } }
  })

  // 쿼리 순서대로 정렬
  return slugs.map(slug => pubs.find(p => p.slug === slug)).filter(Boolean)
})
