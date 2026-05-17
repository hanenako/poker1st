/**
 * POST /api/admin/brands
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  if (!body.slug || !body.name) {
    throw createError({ statusCode: 400, statusMessage: 'slug와 name은 필수입니다.' })
  }

  return prisma.brand.create({
    data: {
      slug:        body.slug,
      name:        body.name,
      nameKo:      body.nameKo      || null,
      nameJa:      body.nameJa      || null,
      logoUrl:      body.logoUrl      || null,
      websiteUrl:   body.websiteUrl   || null,
      twitterUrl:   body.twitterUrl   || null,
      instagramUrl: body.instagramUrl || null,
      youtubeUrl:    body.youtubeUrl    || null,
      flickrUrl:     body.flickrUrl     || null,
      countryCode:  body.countryCode  || 'JP',
      description:   body.description   || null,
      descriptionKo: body.descriptionKo || null,
      descriptionJa: body.descriptionJa || null,
    }
  })
})
