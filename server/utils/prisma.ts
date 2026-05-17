import { PrismaClient } from '@prisma/client'

/**
 * Prisma client singleton.
 * Nitro의 server/utils 폴더는 자동 import 되므로 어디서든 `prisma`를 바로 쓸 수 있음.
 *
 * dev mode에서 HMR로 server 라우트가 재평가될 때 매번 새 PrismaClient를
 * 만들면 connection이 누수되니까 globalThis에 캐싱.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
