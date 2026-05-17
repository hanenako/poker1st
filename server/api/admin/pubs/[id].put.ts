/**
 * PUT /api/admin/pubs/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.pub.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Pub not found' })

  if (Array.isArray(body.images)) {
    await prisma.pubImage.deleteMany({ where: { pubId: id } })
    if (body.images.length) {
      await prisma.pubImage.createMany({
        data: body.images.map((img: { url: string; caption?: string }, i: number) => ({
          pubId: id,
          url: img.url,
          caption: img.caption ?? null,
          orderNo: i
        }))
      })
    }
  }

  const pub = await prisma.pub.update({
    where: { id },
    data: {
      slug:          body.slug          ?? existing.slug,
      name:          body.name          ?? existing.name,
      nameKo:        body.nameKo        ?? null,
      nameJa:        body.nameJa        ?? null,
      countryCode:   body.countryCode   ?? existing.countryCode,
      city:          body.city          ?? existing.city,
      district:      body.district      ?? null,
      address:       body.address       ?? existing.address,
      addressKo:      body.addressKo      ?? null,
      nearestStation: body.nearestStation ?? null,
      walkMinutes:    body.walkMinutes    ? Number(body.walkMinutes) : null,
      lat:            body.lat            ?? null,
      lng:           body.lng           ?? null,
      phone:         body.phone         ?? null,
      websiteUrl:    body.websiteUrl    ?? null,
      twitterUrl:    body.twitterUrl    ?? null,
      instagramUrl:  body.instagramUrl  ?? null,
      youtubeUrl:     body.youtubeUrl     ?? null,
      flickrUrl:      body.flickrUrl      ?? null,
      coverImageUrl:  body.coverImageUrl  ?? null,
      notice:         body.notice         ?? null,
      noticeUntil:    body.noticeUntil    ? new Date(body.noticeUntil) : null,
      noticeImageUrl: body.noticeImageUrl ?? null,
      noticeUrl:      body.noticeUrl      ?? null,
      description:    body.description    ?? null,
      descriptionKo: body.descriptionKo ?? null,
      descriptionJa: body.descriptionJa ?? null,
      hours:         body.hours         ?? undefined,
      features:      body.features      ?? undefined,
      videos:        body.videos        ?? undefined,
      publishedAt:   body.published
        ? (existing.publishedAt ?? new Date())
        : null
    }
  })

  return pub
})
