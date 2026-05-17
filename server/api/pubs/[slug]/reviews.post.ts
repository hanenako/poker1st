import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  // 필수 항목 검증
  if (!body.nickname?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '닉네임을 입력해주세요.' })
  }
  if (!body.password?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '비밀번호를 입력해주세요.' })
  }

  // 항목별 평점 최소 1개 이상 필요
  const ratings = {
    ratingAtmosphere: body.ratingAtmosphere ? Number(body.ratingAtmosphere) : null,
    ratingDealer:     body.ratingDealer     ? Number(body.ratingDealer)     : null,
    ratingWait:       body.ratingWait       ? Number(body.ratingWait)       : null,
    ratingValue:      body.ratingValue      ? Number(body.ratingValue)      : null,
  }
  const hasAnyRating = Object.values(ratings).some(v => v !== null && v >= 1 && v <= 5)
  if (!hasAnyRating) {
    throw createError({ statusCode: 400, statusMessage: '최소 한 항목 이상 평점을 선택해주세요.' })
  }
  // 범위 검증
  for (const [key, val] of Object.entries(ratings)) {
    if (val !== null && (val < 1 || val > 5)) {
      throw createError({ statusCode: 400, statusMessage: '평점은 1~5 사이여야 합니다.' })
    }
  }

  const pub = await prisma.pub.findUnique({ where: { slug }, select: { id: true } })
  if (!pub) throw createError({ statusCode: 404 })

  // 같은 닉네임으로 중복 작성 방지
  const existing = await prisma.pubReview.findFirst({
    where: { pubId: pub.id, nickname: body.nickname.trim() }
  })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '이미 같은 닉네임으로 리뷰를 작성했습니다.' })
  }

  const passwordHash = await bcrypt.hash(body.password, 10)

  return prisma.pubReview.create({
    data: {
      pubId:            pub.id,
      nickname:         body.nickname.trim(),
      passwordHash,
      ...ratings,
      title:            body.title?.trim() || null,
      body:             body.body?.trim()  || null
    }
  })
})
