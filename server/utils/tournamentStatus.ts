import type { TournamentStatus } from '@prisma/client'

/**
 * DB에 저장된 status 대신, 날짜 기준으로 실시간 계산.
 * CANCELLED는 관리자가 명시적으로 설정한 상태이므로 그대로 유지.
 */
export function resolveStatus(
  stored: TournamentStatus,
  startDate: Date,
  endDate: Date
): TournamentStatus {
  if (stored === 'CANCELLED') return 'CANCELLED'
  const now   = new Date()
  const start = new Date(startDate)
  const end   = new Date(endDate)
  end.setHours(23, 59, 59, 999)
  if (now < start) return 'UPCOMING'
  if (now > end)   return 'FINISHED'
  return 'ONGOING'
}

export function applyStatus<T extends { status: TournamentStatus; startDate: Date; endDate: Date }>(
  tournament: T
): T {
  return { ...tournament, status: resolveStatus(tournament.status, tournament.startDate, tournament.endDate) }
}
