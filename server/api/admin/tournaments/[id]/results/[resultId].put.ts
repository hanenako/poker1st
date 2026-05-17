export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const resultId = Number(getRouterParam(event, 'resultId'))
  const body = await readBody(event)

  if (!body.playerName || !body.place) {
    throw createError({ statusCode: 400, statusMessage: '순위와 플레이어명은 필수입니다.' })
  }

  return prisma.tournamentResult.update({
    where: { id: resultId },
    data: {
      eventId:      body.eventId      ? Number(body.eventId) : null,
      place:        Number(body.place),
      playerName:   body.playerName,
      playerNameKo: body.playerNameKo || null,
      country:      body.country      || null,
      prize:        body.prize        ? Number(body.prize)   : null,
      prizeText:    body.prizeText    || null,
      note:         body.note         || null,
    }
  })
})
