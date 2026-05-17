/**
 * POST /api/admin/tournaments/:id/duplicate
 * 토너먼트 + 산하 이벤트(태그·스트럭쳐 포함) 전체 복사.
 * 새 토너먼트는 draft(publishedAt=null) 상태로 생성.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'invalid id' })

  // 원본 토너먼트 + 이벤트(태그·스트럭쳐) 조회
  const src = await prisma.tournament.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: [{ date: 'asc' }, { registrationStart: 'asc' }, { orderNo: 'asc' }],
        include: {
          tags: true,
          structureLevels: { orderBy: { level: 'asc' } }
        }
      }
    }
  })
  if (!src) throw createError({ statusCode: 404, statusMessage: 'Tournament not found' })

  // slug 중복 회피: base-copy, base-copy-2, base-copy-3 ...
  let newSlug = `${src.slug}-copy`
  let suffix = 2
  while (await prisma.tournament.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${src.slug}-copy-${suffix++}`
  }

  // 토너먼트 복사 (publishedAt=null → draft)
  const newT = await prisma.tournament.create({
    data: {
      brandId:        src.brandId,
      slug:           newSlug,
      titleShort:     `${src.titleShort} (Copy)`,
      titleFull:      `${src.titleFull} (Copy)`,
      titleFullKo:    src.titleFullKo  ? `${src.titleFullKo} (복사본)` : null,
      titleFullJa:    src.titleFullJa  ? `${src.titleFullJa} (コピー)` : null,
      countryCode:    src.countryCode,
      city:           src.city,
      timezone:       src.timezone,
      venueName:      src.venueName,
      venueAddress:   src.venueAddress,
      startDate:      src.startDate,
      endDate:        src.endDate,
      posterImageUrl: src.posterImageUrl,
      status:         'UPCOMING',
      description:    src.description,
      descriptionKo:  src.descriptionKo,
      descriptionJa:  src.descriptionJa,
      playerGuides:   src.playerGuides ?? undefined,
      publishedAt:    null
    }
  })

  // 이벤트 + 태그 + 스트럭쳐 복사
  for (const ev of src.events) {
    const newEv = await prisma.event.create({
      data: {
        tournamentId:      newT.id,
        orderNo:           ev.orderNo,
        eventNo:           ev.eventNo,
        name:              ev.name,
        nameKo:            ev.nameKo,
        date:              ev.date,
        registrationStart: ev.registrationStart,
        registrationClose: ev.registrationClose,
        buyInAmount:       ev.buyInAmount,
        buyInCurrency:     ev.buyInCurrency,
        buyInText:         ev.buyInText,
        startingStack:     ev.startingStack,
        gtdAmount:         ev.gtdAmount,
        gtdText:           ev.gtdText,
        gameType:          ev.gameType,
        structure:         ev.structure,
        reEntry:           ev.reEntry,
        nextDayPct:        ev.nextDayPct,
        levelDuration:     ev.levelDuration,
        inPrize:           ev.inPrize,
        description:       ev.description
      }
    })

    // 태그 복사
    if (ev.tags.length) {
      await prisma.eventTag.createMany({
        data: ev.tags.map(et => ({ eventId: newEv.id, tagId: et.tagId })),
        skipDuplicates: true
      })
    }

    // 스트럭쳐 레벨 복사
    if (ev.structureLevels.length) {
      await prisma.eventStructureLevel.createMany({
        data: ev.structureLevels.map(lv => ({
          eventId:    newEv.id,
          level:      lv.level,
          isBreak:    lv.isBreak,
          smallBlind: lv.smallBlind,
          bigBlind:   lv.bigBlind,
          bbAnte:     lv.bbAnte,
          minutes:    lv.minutes
        }))
      })
    }
  }

  return { id: newT.id, slug: newT.slug }
})
