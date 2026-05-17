import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const id   = Number(getRouterParam(event, 'id'))
  const body = await readBody(event).catch(() => ({}))

  const review = await prisma.pubReview.findUnique({ where: { id } })
  if (!review) throw createError({ statusCode: 404 })

  // 어드민 세션이면 비밀번호 없이 삭제 가능
  const session = await getUserSession(event)
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  if (!isAdmin) {
    if (!body.password) {
      throw createError({ statusCode: 400, statusMessage: '비밀번호를 입력해주세요.' })
    }
    if (!review.passwordHash) {
      throw createError({ statusCode: 403, statusMessage: '삭제 권한이 없습니다.' })
    }
    const ok = await bcrypt.compare(String(body.password), review.passwordHash)
    if (!ok) {
      throw createError({ statusCode: 403, statusMessage: '비밀번호가 틀렸습니다.' })
    }
  }

  await prisma.pubReview.delete({ where: { id } })
  return { ok: true }
})
