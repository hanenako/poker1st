/**
 * GET /api/brands
 */
export default defineEventHandler(async () => {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  })
  return brands
})
