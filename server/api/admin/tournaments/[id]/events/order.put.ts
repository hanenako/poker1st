/**
 * PUT /api/admin/tournaments/:id/events/order
 * body: [{ id: number, orderNo: number }, ...]
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ id: number; orderNo: number }[]>(event)

  await Promise.all(
    body.map(({ id, orderNo }) =>
      prisma.event.update({ where: { id }, data: { orderNo } })
    )
  )

  return { ok: true }
})
