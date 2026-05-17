/**
 * POST /api/admin/pubs
 * 새 펍 생성.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  if (!body.slug || !body.name || !body.city || !body.address) {
    throw createError({ statusCode: 400, statusMessage: 'slug, name, city, address는 필수입니다.' })
  }

  const pub = await prisma.pub.create({
    data: {
      slug:          body.slug,
      name:          body.name,
      nameKo:        body.nameKo        || null,
      nameJa:        body.nameJa        || null,
      countryCode:   body.countryCode   || 'JP',
      city:          body.city,
      district:      body.district      || null,
      address:       body.address,
      addressKo:      body.addressKo      || null,
      nearestStation: body.nearestStation || null,
      walkMinutes:    body.walkMinutes    ? Number(body.walkMinutes) : null,
      lat:            body.lat            || null,
      lng:           body.lng           || null,
      phone:         body.phone         || null,
      websiteUrl:    body.websiteUrl    || null,
      twitterUrl:    body.twitterUrl    || null,
      instagramUrl:  body.instagramUrl  || null,
      youtubeUrl:     body.youtubeUrl     || null,
      flickrUrl:      body.flickrUrl      || null,
      coverImageUrl: body.coverImageUrl || null,
      description:   body.description   || null,
      descriptionKo: body.descriptionKo || null,
      descriptionJa: body.descriptionJa || null,
      hours:         body.hours         || undefined,
      features:      body.features      || undefined,
      videos:        body.videos        || undefined,
      publishedAt:   body.published ? new Date() : null,
      ...(Array.isArray(body.images) && body.images.length ? {
        images: {
          create: body.images.map((img: { url: string; caption?: string }, i: number) => ({
            url: img.url,
            caption: img.caption ?? null,
            orderNo: i
          }))
        }
      } : {})
    }
  })

  return pub
})
