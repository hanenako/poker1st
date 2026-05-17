/**
 * POST /api/admin/tournaments/:id/events
 * 이벤트 생성. body.tagIds: number[]
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.name || !body.date) {
    throw createError({ statusCode: 400, statusMessage: 'name과 date는 필수입니다.' })
  }

  const created = await prisma.event.create({
    data: {
      tournamentId,
      orderNo:           body.orderNo           ?? 0,
      eventNo:           body.eventNo != null   ? Number(body.eventNo) : null,
      name:              body.name,
      nameKo:            body.nameKo             || null,
      date:              new Date(body.date),
      registrationStart: body.registrationStart  || null,
      registrationClose: body.registrationClose  || null,
      buyInAmount:       body.buyInAmount        ? Number(body.buyInAmount)   : null,
      buyInCurrency:     body.buyInCurrency      || 'JPY',
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
      description:       body.description        || null,
      tags: {
        create: (body.tagIds ?? []).map((tagId: number) => ({ tagId }))
      }
    },
    include: { tags: { include: { tag: true } } }
  })

  return created
})
