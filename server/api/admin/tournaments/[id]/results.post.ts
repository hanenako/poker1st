export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  if (!body.playerName || !body.place) {
    throw createError({ statusCode: 400, statusMessage: '순위와 플레이어명은 필수입니다.' })
  }

  return prisma.tournamentResult.create({
    data: {
      tournamentId,
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
