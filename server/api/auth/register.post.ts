/**
 * POST /api/auth/register
 * 공개 가입 비활성화 — 관리자 계정은 시드 스크립트로만 생성.
 */
export default defineEventHandler(async () => {
  throw createError({ statusCode: 403, statusMessage: 'Registration is disabled.' })
})
