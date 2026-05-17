/**
 * POST /api/admin/tournaments/:id/results/bulk
 * CSV 파싱 후 전달된 rows 배열을 일괄 등록
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))
  const { rows } = await readBody(event)

  if (!Array.isArray(rows) || !rows.length) {
    throw createError({ statusCode: 400, statusMessage: 'rows 배열이 필요합니다.' })
  }

  // 이벤트 이름 → id 매핑
  const eventList = await prisma.event.findMany({
    where: { tournamentId },
    select: { id: true, name: true }
  })
  const eventMap = new Map(eventList.map(e => [e.name.trim().toLowerCase(), e.id]))

  const data = rows.map((r, i) => {
    if (!r.place || !r.playerName) {
      throw createError({ statusCode: 400, statusMessage: `${i + 1}행: 순위와 플레이어명은 필수입니다.` })
    }
    const eventId = r.eventName
      ? (eventMap.get(String(r.eventName).trim().toLowerCase()) ?? null)
      : null

    return {
      tournamentId,
      eventId,
      place:        Number(r.place),
      playerName:   String(r.playerName).trim(),
      playerNameKo: r.playerNameKo ? String(r.playerNameKo).trim() : null,
      country:      r.country      ? String(r.country).trim()      : null,
      prize:        r.prize        ? Number(r.prize)                : null,
      prizeText:    r.prizeText    ? String(r.prizeText).trim()     : null,
      note:         r.note         ? String(r.note).trim()          : null,
    }
  })

  const result = await prisma.tournamentResult.createMany({ data })
  return { ok: true, created: result.count }
})
