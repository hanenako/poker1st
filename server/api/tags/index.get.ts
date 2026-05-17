/**
 * GET /api/tags
 * 태그 전체 목록 (폼 select용).
 */
export default defineEventHandler(async () => {
  return prisma.tag.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }]
  })
})
