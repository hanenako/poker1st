/**
 * PUT /api/admin/events/:id/structure
 * body: { levels: [{ level, smallBlind, bigBlind, bbAnte?, minutes }] }
 * 전체 교체 방식
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const levels = (body.levels ?? []).map((row: any, i: number) => ({
    eventId:    id,
    level:      Number(row.level)      || i + 1,
    isBreak:    Boolean(row.isBreak),
    smallBlind: row.isBreak ? 0 : (Number(row.smallBlind) || 0),
    bigBlind:   row.isBreak ? 0 : (Number(row.bigBlind)   || 0),
    bbAnte:     row.isBreak ? null : (row.bbAnte != null ? Number(row.bbAnte) : null),
    minutes:    Number(row.minutes)    || 20,
  }))

  await prisma.$transaction([
    prisma.eventStructureLevel.deleteMany({ where: { eventId: id } }),
    prisma.eventStructureLevel.createMany({ data: levels }),
  ])

  return { ok: true, count: levels.length }
})
