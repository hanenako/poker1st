/**
 * GET /api/admin/brands/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const brand = await prisma.brand.findUnique({ where: { id } })
  if (!brand) throw createError({ statusCode: 404, statusMessage: 'Brand not found' })

  return brand
})
