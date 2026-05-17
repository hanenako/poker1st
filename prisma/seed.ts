/**
 * Seed script — idempotent (upsert 기반).
 * 재실행해도 안전합니다.
 *
 * 실행: npm run db:seed   (또는 npx prisma db seed)
 */
import { PrismaClient, TagCategory, TournamentStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ---------- Admin user ----------
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@local'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash,
      provider: 'local',
      role: UserRole.ADMIN
    }
  })

  // ---------- Brands ----------
  const jopt = await prisma.brand.upsert({
    where: { slug: 'jopt' },
    update: {},
    create: {
      slug: 'jopt',
      name: 'JOPT',
      nameKo: '제이오피티',
      nameJa: 'JOPT',
      logoUrl: '/images/JOPT_logo.jpg',
      countryCode: 'JP',
      description: 'Japan Open Poker Tour'
    }
  })

  const apl = await prisma.brand.upsert({
    where: { slug: 'apl' },
    update: {},
    create: {
      slug: 'apl',
      name: 'APL',
      nameKo: '에이피엘',
      nameJa: 'APL',
      logoUrl: '/images/APL_logo.jpg',
      countryCode: 'JP',
      description: 'Ace Poker League'
    }
  })

  // ---------- Tags ----------
  const tagDefs: Array<{ slug: string; name: string; nameKo: string; category: TagCategory }> = [
    { slug: 'nlh',        name: 'NLH',        nameKo: '노리밋 홀덤',  category: TagCategory.GAME },
    { slug: 'plo',        name: 'PLO',        nameKo: '팟리밋 오마하', category: TagCategory.GAME },
    { slug: 'plo-5',      name: 'PLO-5',      nameKo: 'PLO-5',       category: TagCategory.GAME },
    { slug: 'normal',     name: 'Normal',     nameKo: '일반',         category: TagCategory.STRUCTURE },
    { slug: 'hyper',      name: 'Hyper',      nameKo: '하이퍼',       category: TagCategory.STRUCTURE },
    { slug: 'deep-stack', name: 'Deep Stack', nameKo: '딥스택',       category: TagCategory.STRUCTURE },
    { slug: 'bounty',     name: 'Bounty',     nameKo: '바운티',       category: TagCategory.FEATURE },
    { slug: 're-entry',   name: 'Re-entry',   nameKo: '재참가',       category: TagCategory.FEATURE },
    { slug: 'freezeout',  name: 'Freezeout',  nameKo: '프리즈아웃',   category: TagCategory.FEATURE }
  ]

  const tags: Record<string, number> = {}
  for (const t of tagDefs) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name, nameKo: t.nameKo, category: t.category },
      create: t
    })
    tags[t.slug] = tag.id
  }

  // ---------- Tournament: JOPT Tokyo #02 ----------
  const joptTokyo02 = await prisma.tournament.upsert({
    where: { slug: 'jopt-tokyo-02' },
    update: {},
    create: {
      brandId: jopt.id,
      slug: 'jopt-tokyo-02',
      titleFull: 'Japan Open Poker Tour Tokyo #02',
      titleShort: 'JOPT Tokyo #02',
      titleFullKo: '재팬 오픈 포커 투어 도쿄 #02',
      countryCode: 'JP',
      city: 'Tokyo',
      venueName: 'ベルサール高田馬場',
      venueAddress: '東京都新宿区大久保3-8-2 BIZMARKS高田馬場',
      startDate: new Date('2026-07-16'),
      endDate: new Date('2026-07-20'),
      timezone: 'Asia/Tokyo',
      posterImageUrl:
        'https://light-three.com/wp-content/uploads/2026/03/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88-2026-03-17-10.44.14-1-637x720.png',
      status: TournamentStatus.UPCOMING,
      description: 'JOPT Tokyo #02 — Tokyo Takadanobaba',
      descriptionKo: 'JOPT 도쿄 #02 — 다카다노바바',
      publishedAt: new Date()
    }
  })

  // ---------- Events for JOPT Tokyo #02 ----------
  type EventSeed = {
    name: string
    nameKo?: string
    date: string
    regStart?: string
    regClose?: string
    buyInAmount: number
    buyInText: string
    startingStack: number
    gtdAmount: number
    gtdText: string
    gameType: string
    structure: string
    reEntry: string
    nextDayPct?: number
    levelDuration: string
    tags: string[]
    orderNo: number
  }

  const events: EventSeed[] = [
    {
      orderNo: 1,
      name: 'Main Event Day1A',
      nameKo: '메인 이벤트 Day1A',
      date: '2026-07-16',
      regStart: '10:00',
      regClose: '14:00',
      buyInAmount: 30000,
      buyInText: '¥30,000',
      startingStack: 50000,
      gtdAmount: 10000000,
      gtdText: '¥10M',
      gameType: 'NLH',
      structure: 'Normal',
      reEntry: '가능',
      nextDayPct: 0.15,
      levelDuration: '50',
      tags: ['nlh', 'normal', 're-entry']
    },
    {
      orderNo: 2,
      name: 'Mystery Bounty',
      nameKo: '미스터리 바운티',
      date: '2026-07-17',
      regStart: '11:00',
      regClose: '15:00',
      buyInAmount: 20000,
      buyInText: '¥20,000',
      startingStack: 30000,
      gtdAmount: 5000000,
      gtdText: '¥5M',
      gameType: 'NLH',
      structure: 'Bounty',
      reEntry: 'Freeze-out',
      levelDuration: '40/30',
      tags: ['nlh', 'bounty', 'freezeout']
    },
    {
      orderNo: 3,
      name: 'Hyper PLO',
      nameKo: '하이퍼 PLO',
      date: '2026-07-18',
      regStart: '11:00',
      regClose: '15:00',
      buyInAmount: 20000,
      buyInText: '¥20,000',
      startingStack: 30000,
      gtdAmount: 5000000,
      gtdText: '¥5M',
      gameType: 'PLO',
      structure: 'Hyper',
      reEntry: '가능',
      levelDuration: '30/25/20/15/10',
      tags: ['plo', 'hyper', 're-entry']
    },
    {
      orderNo: 4,
      name: 'Deep Stack PLO-5',
      nameKo: '딥스택 PLO-5',
      date: '2026-07-18',
      regStart: '11:00',
      regClose: '15:00',
      buyInAmount: 20000,
      buyInText: '¥20,000',
      startingStack: 30000,
      gtdAmount: 5000000,
      gtdText: '¥5M',
      gameType: 'PLO-5',
      structure: 'Deep Stack',
      reEntry: '가능',
      levelDuration: '30',
      tags: ['plo-5', 'deep-stack', 're-entry']
    }
  ]

  // events upsert — (tournamentId, orderNo) 조합으로 식별
  for (const e of events) {
    // 기존 같은 tournament + 같은 orderNo 이벤트가 있으면 업데이트, 없으면 생성
    const existing = await prisma.event.findFirst({
      where: { tournamentId: joptTokyo02.id, orderNo: e.orderNo }
    })

    const data = {
      tournamentId: joptTokyo02.id,
      orderNo: e.orderNo,
      name: e.name,
      nameKo: e.nameKo,
      date: new Date(e.date),
      registrationStart: e.regStart,
      registrationClose: e.regClose,
      buyInAmount: e.buyInAmount,
      buyInCurrency: 'JPY',
      buyInText: e.buyInText,
      startingStack: e.startingStack,
      gtdAmount: e.gtdAmount,
      gtdText: e.gtdText,
      gameType: e.gameType,
      structure: e.structure,
      reEntry: e.reEntry,
      nextDayPct: e.nextDayPct,
      levelDuration: e.levelDuration
    }

    const event = existing
      ? await prisma.event.update({ where: { id: existing.id }, data })
      : await prisma.event.create({ data })

    // 태그 재설정 (delete + insert)
    await prisma.eventTag.deleteMany({ where: { eventId: event.id } })
    await prisma.eventTag.createMany({
      data: e.tags.map((slug) => ({ eventId: event.id, tagId: tags[slug] })),
      skipDuplicates: true
    })
  }

  // ---------- Tournament: APL Osaka 202608 (이벤트는 추후 추가) ----------
  await prisma.tournament.upsert({
    where: { slug: 'apl-osaka-202608' },
    update: {},
    create: {
      brandId: apl.id,
      slug: 'apl-osaka-202608',
      titleFull: 'APL Osaka 202608',
      titleShort: 'APL Osaka 202608',
      titleFullKo: 'APL 오사카 202608',
      countryCode: 'JP',
      city: 'Osaka',
      startDate: new Date('2026-08-16'),
      endDate: new Date('2026-08-20'),
      timezone: 'Asia/Tokyo',
      posterImageUrl:
        'https://acepokerleague.com/wp-content/uploads/2025/04/photo_2025-04-02_16-42-23.jpg',
      status: TournamentStatus.UPCOMING,
      publishedAt: new Date()
    }
  })

  // ---------- Pubs ----------
  // ⚠️ 샘플 데이터 — 실제 펍 정보는 관리자 페이지에서 입력하세요.
  type PubSeed = {
    slug: string
    name: string
    nameKo?: string
    nameJa?: string
    city: string
    district?: string
    address?: string
    addressKo?: string
    lat?: number
    lng?: number
    phone?: string
    websiteUrl?: string
    instagramUrl?: string
    hours?: Record<string, string[]>
    features?: Record<string, unknown>
    coverImageUrl?: string
    description?: string
    descriptionKo?: string
  }

  const pubs: PubSeed[] = [
    {
      slug: 'sample-takadanobaba-craft',
      name: 'Takadanobaba Craft Beer',
      nameKo: '다카다노바바 크래프트 비어',
      nameJa: '高田馬場クラフトビール',
      city: 'Tokyo',
      district: 'Shinjuku',
      address: '3-1-1 Takadanobaba, Shinjuku-ku, Tokyo',
      addressKo: '도쿄도 신주쿠구 다카다노바바 3-1-1',
      lat: 35.7126,
      lng: 139.7038,
      phone: '+81-3-1234-5678',
      hours: {
        mon: ['17:00-24:00'],
        tue: ['17:00-24:00'],
        wed: ['17:00-24:00'],
        thu: ['17:00-24:00'],
        fri: ['17:00-02:00'],
        sat: ['15:00-02:00'],
        sun: ['15:00-23:00']
      },
      features: {
        smoking: false,
        englishOk: true,
        englishMenu: true,
        cardPayment: true,
        priceRange: '¥¥',
        nearStation: 'Takadanobaba (3 min)'
      },
      coverImageUrl:
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
      description: 'Craft beer pub close to the JOPT Tokyo venue. 30+ taps rotating.',
      descriptionKo:
        'JOPT 도쿄 회장에서 도보 5분 거리의 크래프트 비어 펍. 탭 30종 이상 로테이션.'
    },
    {
      slug: 'sample-roppongi-whisky',
      name: 'Roppongi Whisky Library',
      nameKo: '롯폰기 위스키 라이브러리',
      nameJa: '六本木ウイスキーライブラリー',
      city: 'Tokyo',
      district: 'Roppongi',
      address: '6-1-1 Roppongi, Minato-ku, Tokyo',
      addressKo: '도쿄도 미나토구 롯폰기 6-1-1',
      lat: 35.6627,
      lng: 139.7311,
      websiteUrl: 'https://example.com/roppongi-whisky',
      hours: {
        mon: ['19:00-04:00'],
        tue: ['19:00-04:00'],
        wed: ['19:00-04:00'],
        thu: ['19:00-04:00'],
        fri: ['19:00-05:00'],
        sat: ['19:00-05:00'],
        sun: ['closed']
      },
      features: {
        smoking: true,
        englishOk: true,
        englishMenu: false,
        cardPayment: true,
        priceRange: '¥¥¥',
        nearStation: 'Roppongi (2 min)',
        cover: '¥1,000'
      },
      coverImageUrl:
        'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80',
      description:
        'Late-night whisky bar with 500+ bottles. Quiet, jacket recommended.',
      descriptionKo:
        '심야 영업 위스키 바. 500병 이상 보유. 조용한 분위기, 자켓 권장.'
    },
    {
      slug: 'sample-shibuya-izakaya',
      name: 'Shibuya Izakaya Sankaku',
      nameKo: '시부야 이자카야 산카쿠',
      nameJa: '渋谷居酒屋三角',
      city: 'Tokyo',
      district: 'Shibuya',
      address: '1-2-3 Dogenzaka, Shibuya-ku, Tokyo',
      addressKo: '도쿄도 시부야구 도겐자카 1-2-3',
      lat: 35.6580,
      lng: 139.6994,
      hours: {
        mon: ['17:00-24:00'],
        tue: ['17:00-24:00'],
        wed: ['17:00-24:00'],
        thu: ['17:00-24:00'],
        fri: ['17:00-03:00'],
        sat: ['17:00-03:00'],
        sun: ['17:00-23:00']
      },
      features: {
        smoking: false,
        englishOk: false,
        englishMenu: true,
        cardPayment: false,
        priceRange: '¥¥',
        nearStation: 'Shibuya (5 min)'
      },
      coverImageUrl:
        'https://images.unsplash.com/photo-1554306297-0c86e837d24b?w=800&q=80',
      description: 'Cozy local izakaya. Cash only. Try the yakitori set.',
      descriptionKo: '아담한 현지 이자카야. 현금만 가능. 야키토리 세트 추천.'
    },
    {
      slug: 'sample-osaka-namba-bar',
      name: 'Namba Standing Bar',
      nameKo: '난바 스탠딩 바',
      nameJa: '難波スタンディングバー',
      city: 'Osaka',
      district: 'Namba',
      address: '1-1-1 Namba, Chuo-ku, Osaka',
      addressKo: '오사카부 오사카시 주오구 난바 1-1-1',
      lat: 34.6660,
      lng: 135.5001,
      hours: {
        mon: ['18:00-01:00'],
        tue: ['18:00-01:00'],
        wed: ['18:00-01:00'],
        thu: ['18:00-01:00'],
        fri: ['18:00-03:00'],
        sat: ['18:00-03:00'],
        sun: ['18:00-24:00']
      },
      features: {
        smoking: true,
        englishOk: false,
        englishMenu: false,
        cardPayment: false,
        priceRange: '¥',
        nearStation: 'Namba (1 min)'
      },
      coverImageUrl:
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
      description:
        'Stand-up only counter bar. Cheap highballs. Great after APL Osaka.',
      descriptionKo:
        '서서 마시는 카운터 바. 저렴한 하이볼. APL 오사카 끝나고 들르기 좋음.'
    }
  ]

  for (const p of pubs) {
    await prisma.pub.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        nameKo: p.nameKo,
        nameJa: p.nameJa,
        city: p.city,
        district: p.district,
        address: p.address,
        addressKo: p.addressKo,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        websiteUrl: p.websiteUrl,
        instagramUrl: p.instagramUrl,
        hours: p.hours,
        features: p.features,
        coverImageUrl: p.coverImageUrl,
        description: p.description,
        descriptionKo: p.descriptionKo
      },
      create: {
        slug: p.slug,
        name: p.name,
        nameKo: p.nameKo,
        nameJa: p.nameJa,
        countryCode: 'JP',
        city: p.city,
        district: p.district,
        address: p.address,
        addressKo: p.addressKo,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        websiteUrl: p.websiteUrl,
        instagramUrl: p.instagramUrl,
        hours: p.hours,
        features: p.features,
        coverImageUrl: p.coverImageUrl,
        description: p.description,
        descriptionKo: p.descriptionKo,
        publishedAt: new Date()
      }
    })
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
