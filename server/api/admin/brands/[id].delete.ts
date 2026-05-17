/**
 * DELETE /api/admin/brands/:id
 * 산하 tournaments가 있으면 삭제 거부.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { tournaments: true } } }
  })
  if (!brand) throw createError({ statusCode: 404, statusMessage: 'Brand not found' })

  if (brand._count.tournaments > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: `대회 ${brand._count.tournaments}개가 연결되어 있습니다. 대회를 먼저 삭제해 주세요.`
    })
  }

  await prisma.brand.delete({ where: { id } })
  return { ok: true }
})
