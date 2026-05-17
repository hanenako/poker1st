/**
 * POST /api/admin/tournaments/:id/events/bulk
 * 이벤트 일괄 생성.
 * body: { events: EventRow[] }
 *
 * EventRow: {
 *   date, name, nameKo?, buyInAmount?, buyInText?, gtdAmount?, gtdText?,
 *   gameType?, structure?, startingStack?, reEntry?, levelDuration?,
 *   registrationStart?, registrationClose?, nextDayPct?, orderNo?
 * }
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const tournamentId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ events: Record<string, unknown>[] }>(event)

  if (!Array.isArray(body?.events) || body.events.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'events 배열이 비어있습니다.' })
  }

  const rows = body.events
  for (const row of rows) {
    if (!row.name || !row.date) {
      throw createError({ statusCode: 400, statusMessage: `name과 date는 필수입니다. (row: ${JSON.stringify(row)})` })
    }
  }

  // 현재 최대 orderNo 조회 → 새 이벤트는 그 다음부터
  const last = await prisma.event.findFirst({
    where: { tournamentId },
    orderBy: { orderNo: 'desc' },
    select: { orderNo: true }
  })
  let nextOrder = (last?.orderNo ?? 0) + 1

  const created = await prisma.$transaction(
    rows.map((row, i) =>
      prisma.event.create({
        data: {
          tournamentId,
          orderNo:           row.orderNo           ? Number(row.orderNo)           : nextOrder + i,
          eventNo:           row.eventNo           ? Number(row.eventNo)           : null,
          name:              String(row.name),
          nameKo:            row.nameKo             ? String(row.nameKo)            : null,
          date:              new Date(String(row.date)),
          registrationStart: row.registrationStart  ? String(row.registrationStart) : null,
          registrationClose: row.registrationClose  ? String(row.registrationClose) : null,
          buyInAmount:       row.buyInAmount        ? Number(row.buyInAmount)        : null,
          buyInCurrency:     'JPY',
          buyInText:         row.buyInText          ? String(row.buyInText)          : null,
          startingStack:     row.startingStack      ? Number(row.startingStack)      : null,
          gtdAmount:         row.gtdAmount          ? Number(row.gtdAmount)          : null,
          gtdText:           row.gtdText            ? String(row.gtdText)            : null,
          gameType:          row.gameType           ? String(row.gameType)           : null,
          structure:         row.structure          ? String(row.structure)          : null,
          reEntry:           row.reEntry            ? String(row.reEntry)            : null,
          nextDayPct:        row.nextDayPct         ? Number(row.nextDayPct)         : null,
          levelDuration:     row.levelDuration      ? String(row.levelDuration)      : null,
        }
      })
    )
  )

  return { created: created.length }
})
