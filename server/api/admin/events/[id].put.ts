/**
 * PUT /api/admin/events/:id
 * 이벤트 수정. body.tagIds: number[] (전체 교체)
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  const updated = await prisma.event.update({
    where: { id },
    data: {
      orderNo:           body.orderNo           ?? existing.orderNo,
      eventNo:           body.eventNo != null   ? Number(body.eventNo) : null,
      name:              body.name              ?? existing.name,
      nameKo:            body.nameKo             || null,
      date:              body.date ? new Date(body.date) : existing.date,
      registrationStart: body.registrationStart  || null,
      registrationClose: body.registrationClose  || null,
      buyInAmount:       body.buyInAmount        ? Number(body.buyInAmount)   : null,
      buyInCurrency:     body.buyInCurrency      || existing.buyInCurrency,
      buyInText:         body.buyInText          || null,
      startingStack:     body.startingStack      ? Number(body.startingStack) : null,
      gtdAmount:         body.gtdAmount          ? Number(body.gtdAmount)     : null,
      gtdText:           body.gtdText            || null,
      gameType:          body.gameType           || null,
      structure:         body.structure          || null,
      reEntry:           body.reEntry            || null,
      nextDayPct:        body.nextDayPct         ? Number(body.nextDayPct)    : null,
      levelDuration:     body.levelDuration      || null,
      inPrize:           body.inPrize            ? Number(body.inPrize)       : null,
      days:              Array.isArray(body.days) && body.days.length ? body.days : undefined,
      description:       body.description        || null
    },
    include: { tags: { include: { tag: true } } }
  })

  // 태그 전체 교체
  if (Array.isArray(body.tagIds)) {
    await prisma.eventTag.deleteMany({ where: { eventId: id } })
    if (body.tagIds.length) {
      await prisma.eventTag.createMany({
        data: body.tagIds.map((tagId: number) => ({ eventId: id, tagId })),
        skipDuplicates: true
      })
    }
  }

  return updated
})
