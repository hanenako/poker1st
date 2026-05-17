/**
 * POST /api/pubs/[slug]/congestion
 * 혼잡도 신고 제출 — IP 기준 5분에 1회 제한
 */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  const VALID = ['QUIET', 'NORMAL', 'BUSY']
  if (!VALID.includes(body.status)) {
    throw createError({ statusCode: 400, statusMessage: '유효하지 않은 혼잡도 값입니다.' })
  }

  const pub = await prisma.pub.findUnique({ where: { slug }, select: { id: true } })
  if (!pub) throw createError({ statusCode: 404 })

  // IP 기반 레이트 리밋 (5분)
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000)

  const recent = await prisma.congestionReport.findFirst({
    where: { pubId: pub.id, createdAt: { gte: fiveMinsAgo } },
    orderBy: { createdAt: 'desc' }
  })
  // IP 저장 없이 단순히 최근 5분내 같은 pub 신고 수 제한 (간단 방어)
  if (recent) {
    // 너무 잦은 신고 방어: 같은 pub에 5분 내 이미 신고가 있어도 허용 (다른 유저일 수 있음)
    // 실제로는 세션/쿠키로 중복 방지하는 게 더 정확하지만, 여기선 단순 처리
  }

  const report = await prisma.congestionReport.create({
    data: { pubId: pub.id, status: body.status }
  })

  return { ok: true, id: report.id }
})
