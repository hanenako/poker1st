/**
 * PUT /api/admin/brands/:id
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const existing = await prisma.brand.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Brand not found' })

  return prisma.brand.update({
    where: { id },
    data: {
      slug:        body.slug        ?? existing.slug,
      name:        body.name        ?? existing.name,
      nameKo:      body.nameKo      || null,
      nameJa:      body.nameJa      || null,
      logoUrl:      body.logoUrl      || null,
      websiteUrl:   body.websiteUrl   || null,
      twitterUrl:   body.twitterUrl   || null,
      instagramUrl: body.instagramUrl || null,
      youtubeUrl:    body.youtubeUrl    || null,
      flickrUrl:     body.flickrUrl     || null,
      countryCode:  body.countryCode  ?? existing.countryCode,
      description:   body.description   || null,
      descriptionKo: body.descriptionKo || null,
      descriptionJa: body.descriptionJa || null,
    }
  })
})
