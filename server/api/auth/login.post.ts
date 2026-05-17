/**
 * POST /api/auth/login
 * body: { email, password }
 *
 * Rate limit: IP당 15분 내 5회 실패 시 15분 잠금.
 */
import bcrypt from 'bcryptjs'

// 인메모리 실패 기록 { ip → { count, lockedUntil } }
// 단일 프로세스 소규모 서버 기준으로 충분. 멀티 인스턴스 배포 시 Redis로 교체.
const failMap = new Map<string, { count: number; lockedUntil: number }>()

const MAX_ATTEMPTS  = 5
const WINDOW_MS     = 15 * 60 * 1000  // 15분
const LOCKOUT_MS    = 15 * 60 * 1000  // 15분

function getClientIp(event: any): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return event.node.req.socket?.remoteAddress ?? 'unknown'
}

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)
  const now = Date.now()

  // 잠금 확인
  const record = failMap.get(ip)
  if (record && record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 60000)
    throw createError({
      statusCode: 429,
      statusMessage: `Too many failed attempts. Try again in ${remaining} minute(s).`
    })
  }

  const { email, password } = await readBody<{ email?: string; password?: string }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // 유저 없음 or 비밀번호 불일치 → 실패 카운트 증가
  const valid = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false

  if (!user || !user.passwordHash || !valid) {
    const cur = failMap.get(ip) ?? { count: 0, lockedUntil: 0 }
    cur.count += 1
    if (cur.count >= MAX_ATTEMPTS) {
      cur.lockedUntil = now + LOCKOUT_MS
      cur.count = 0  // 잠금 후 카운트 초기화
    }
    failMap.set(ip, cur)

    // 타이밍 공격 방지: 유저 없어도 동일한 응답 시간 유지
    if (!valid && user?.passwordHash) {
      // bcrypt.compare는 이미 실행됨
    } else {
      await bcrypt.compare(password, '$2a$12$placeholderHashToPreventTimingAttack000000000000000000')
    }

    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  // 로그인 성공 → 실패 기록 초기화
  failMap.delete(ip)

  // 오래된 기록 정리 (메모리 누수 방지)
  if (failMap.size > 5000) {
    for (const [k, v] of failMap) {
      if (v.lockedUntil < now && v.count === 0) failMap.delete(k)
    }
  }

  await setUserSession(event, {
    user: {
      id:    user.id,
      email: user.email,
      name:  user.name,
      role:  user.role
    }
  })

  return { ok: true }
})
