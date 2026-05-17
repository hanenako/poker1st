import type { H3Event } from 'h3'

/**
 * Server route에서 호출. 로그인 안 됐거나 ADMIN이 아니면 401/403 throw.
 * 통과하면 세션 정보를 반환.
 */
export async function requireAdmin(event: H3Event) {
  const session = await requireUserSession(event)
  const role = (session.user as { role?: string } | undefined)?.role
  if (role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }
  return session
}
