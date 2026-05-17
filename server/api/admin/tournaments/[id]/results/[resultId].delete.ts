export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const resultId = Number(getRouterParam(event, 'resultId'))
  await prisma.tournamentResult.delete({ where: { id: resultId } })
  return { ok: true }
})
