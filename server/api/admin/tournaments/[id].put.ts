/**
 * PUT /api/admin/tournaments/:id
 */
import type { TournamentStatus } from '@prisma/client'

type Body = {
  brandId: number
  slug: string
  titleShort: string
  titleFull: string
  titleFullKo?: string
  titleFullJa?: string
  countryCode: string
  city: string
  timezone?: string
  venueName?: string
  venueAddress?: string
  startDate: string
  endDate: string
  posterImageUrl?: string
  status?: TournamentStatus
  autoStatus?: boolean
  description?: string
  descriptionKo?: string
  descriptionJa?: string
  playerGuides?: { ja?: string; ko?: string; en?: string }
  published?: boolean
}

function calcStatus(startDate: string, endDate: string): TournamentStatus {
  const now   = new Date()
  const start = new Date(startDate)
  const end   = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  if (now < start) return 'UPCOMING'
  if (now > end)   return 'FINISHED'
  return 'ONGOING'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const body = await readBody<Body>(event)

  // 기존 publishedAt 유지/해제 처리 — 한 번 publish 됐다면 그 시각 보존, draft로 내리면 null
  const existing = await prisma.tournament.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'not found' })
  }

  const publishedAt = body.published
    ? existing.publishedAt ?? new Date()
    : null

  const updated = await prisma.tournament.update({
    where: { id },
    data: {
      brandId: body.brandId,
      slug: body.slug,
      titleShort: body.titleShort,
      titleFull: body.titleFull,
      titleFullKo: body.titleFullKo || null,
      titleFullJa: body.titleFullJa || null,
      countryCode: body.countryCode || 'JP',
      city: body.city,
      timezone: body.timezone || 'Asia/Tokyo',
      venueName: body.venueName || null,
      venueAddress: body.venueAddress || null,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      posterImageUrl: body.posterImageUrl || null,
      status: body.autoStatus ? calcStatus(body.startDate, body.endDate) : (body.status ?? existing.status),
      description: body.description || null,
      descriptionKo: body.descriptionKo || null,
      descriptionJa: body.descriptionJa || null,
      playerGuides: body.playerGuides ?? undefined,
      publishedAt
    }
  })

  return updated
})
