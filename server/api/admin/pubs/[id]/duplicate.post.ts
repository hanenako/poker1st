/**
 * POST /api/admin/pubs/:id/duplicate
 * 포커룸 복사. 이름에 "(Copy)" 붙이고 draft 상태로 생성.
 * 이미지·리뷰·혼잡도 데이터는 복사하지 않음.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'invalid id' })

  const src = await prisma.pub.findUnique({ where: { id } })
  if (!src) throw createError({ statusCode: 404, statusMessage: 'Pub not found' })

  // slug 중복 회피: base-copy, base-copy-2, ...
  let newSlug = `${src.slug}-copy`
  let suffix = 2
  while (await prisma.pub.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${src.slug}-copy-${suffix++}`
  }

  const newPub = await prisma.pub.create({
    data: {
      slug:           newSlug,
      name:           `${src.name} (Copy)`,
      nameKo:         src.nameKo         ? `${src.nameKo} (복사본)` : null,
      nameJa:         src.nameJa         ? `${src.nameJa} (コピー)` : null,
      countryCode:    src.countryCode,
      city:           src.city,
      district:       src.district,
      address:        src.address,
      addressKo:      src.addressKo,
      lat:            src.lat,
      lng:            src.lng,
      phone:          src.phone,
      websiteUrl:     src.websiteUrl,
      twitterUrl:     src.twitterUrl,
      instagramUrl:   src.instagramUrl,
      youtubeUrl:     src.youtubeUrl,
      flickrUrl:      src.flickrUrl,
      nearestStation: src.nearestStation,
      walkMinutes:    src.walkMinutes,
      hours:          src.hours          ?? undefined,
      features:       src.features       ?? undefined,
      videos:         src.videos         ?? undefined,
      coverImageUrl:  src.coverImageUrl,
      description:    src.description,
      descriptionKo:  src.descriptionKo,
      descriptionJa:  src.descriptionJa,
      publishedAt:    null
    }
  })

  return { id: newPub.id, slug: newPub.slug }
})
