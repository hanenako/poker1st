/**
 * 어드민 계정 비밀번호 리셋 스크립트
 * 실행: node scripts/reset-admin.cjs
 *
 * .env의 ADMIN_EMAIL / ADMIN_PASSWORD 를 읽어서 DB를 직접 업데이트합니다.
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@local'
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('❌ .env에 ADMIN_PASSWORD가 없습니다.')
    process.exit(1)
  }

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email },
    update: { passwordHash: hash, role: 'ADMIN' },
    create: { email, passwordHash: hash, role: 'ADMIN', provider: 'local', name: 'Admin' }
  })

  console.log(`✅ 어드민 계정 업데이트 완료: ${user.email} (id: ${user.id})`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
