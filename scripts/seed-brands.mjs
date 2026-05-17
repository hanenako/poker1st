/**
 * 엑셀 japan_brands 데이터를 DB에 반영
 * - 신규: create
 * - 기존 slug 일치: null 필드만 update (비어있는 칸만 채움)
 *
 * 실행: node scripts/seed-brands.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// URL 정규화 헬퍼
function toUrl(val) {
  if (!val) return null
  if (val.startsWith('http')) return val
  return 'https://' + val
}
function toTwitter(val) {
  if (!val) return null
  const handle = val.replace(/^@/, '')
  return 'https://x.com/' + handle
}
function toInstagram(val) {
  if (!val) return null
  const handle = val.replace(/^@/, '')
  return 'https://www.instagram.com/' + handle
}
function toYoutube(val) {
  if (!val) return null
  if (val.startsWith('http')) return val
  return 'https://' + val
}

const BRANDS = [
  {
    slug: 'jopt',
    name: 'JOPT',
    nameKo: '제이오피티',
    nameJa: 'JOPT',
    websiteUrl:   toUrl('japanopenpoker.com'),
    twitterUrl:   toTwitter('@japanopenpoker'),
    instagramUrl: toInstagram('@jopt_korean'),
    youtubeUrl:   toYoutube('youtube.com/@japanopenpoker'),
    description:  '2011년부터 운영되는 일본 최대 규모의 포커 토너먼트 투어. 도쿄·삿포로·오사카 등 전국 시리즈와 그랜드 파이널(바이인 12만엔, 보증 상금 1억엔)로 구성된 일본 포커 씬의 대표 브랜드.',
  },
  {
    slug: 'shibuya-poker-fes',
    name: 'Shibuya Poker Fes',
    nameKo: '시부야 포커 페스',
    nameJa: '渋谷ポーカーフェス',
    websiteUrl:   toUrl('pokerjapan.jp/pokerfes/shibuya/'),
    twitterUrl:   toTwitter('@shibuyapokerfes'),
    description:  '도쿄 시부야의 여러 포커룸이 협력해 개최하는 지역 밀착형 포커 축제. 연 1~2회 개최되며 50개 이상의 토너먼트와 4,000명 이상이 참가하는 대규모 이벤트.',
  },
  {
    slug: 'top-of-poker',
    name: 'Top Of Poker',
    nameKo: '탑 오브 포커',
    nameJa: 'トップ・オブ・ポーカー',
    websiteUrl:   toUrl('topofpoker.com'),
    twitterUrl:   toTwitter('@TopofPoker'),
    instagramUrl: toInstagram('@topofpoker'),
    description:  '나고야 등 서일본을 중심으로 개최되는 포커 챔피언십. 연간 총 상금 5,000만엔 이상 규모로 운영되며 메인 이벤트 보증 상금 1,500만엔.',
  },
  {
    slug: 'spadie',
    name: 'SPADIE Poker League',
    nameKo: '스파디 포커 리그',
    nameJa: 'SPADIE POKER LEAGUE',
    websiteUrl:   toUrl('pokerguild.jp/spadie/'),
    twitterUrl:   toTwitter('@SPADIE_POKER'),
    instagramUrl: toInstagram('@spadie_final'),
    description:  '도쿄 중심의 포커 리그로 40회 이상 개최. 게임 세계관을 접목한 독특한 연출로 포커 입문자도 즐길 수 있는 이벤트.',
  },
  {
    slug: 'sengoku',
    name: '戦国ポーカーツアー',
    nameKo: '전국 포커 투어',
    nameJa: '戦国ポーカーツアー',
    websiteUrl:   toUrl('japanopenpoker.com'),
    twitterUrl:   toTwitter('@sengokupoker'),
    instagramUrl: toInstagram('@sengoku_poker'),
    description:  '전국시대 테마의 포커 투어. JOPT 주최로 음악 공연 등 엔터테인먼트 요소를 결합, 일본 제2위 규모의 포커 시리즈.',
  },
  {
    slug: 'student-poker-u30',
    name: '学生ポーカー選手権 U-30',
    nameKo: '학생 포커 선수권 U-30',
    nameJa: '学生ポーカー選手権 U-30',
    websiteUrl:   toUrl('pokerjapan.jp/what_is_u30/'),
    twitterUrl:   toTwitter('@U30__poker'),
    instagramUrl: toInstagram('@u30_poker'),
    description:  '30세 이하 젊은 플레이어·딜러·스태프가 참가하는 포커 이벤트. 연 2회(SUMMER·WINTER) 개최되며 2025년 SUMMER 메인 이벤트는 694 엔트리 기록.',
  },
  {
    slug: 'masters',
    name: 'MASTERS',
    nameKo: '마스터스',
    nameJa: 'MASTERS',
    websiteUrl:   toUrl('pokerjapan.jp/masters/'),
    description:  '일본 포커 연맹 산하의 프리미엄 토너먼트 시리즈. 2009년부터 운영되어 온 역사 있는 브랜드.',
  },
  {
    slug: 'agpt',
    name: 'AGPT',
    nameKo: '에이지피티',
    nameJa: 'AGPT',
    websiteUrl:   toUrl('agpt-tournament.waitinglist-poker.com/'),
    twitterUrl:   toTwitter('@agpt_poker'),
    description:  '일본에서 개최되는 포커 투어 브랜드.',
  },
  {
    slug: 'apl',
    name: 'APL',
    nameKo: '에이스 포커 리그',
    nameJa: 'エースポーカーリーグ',
    websiteUrl:   toUrl('acepokerleague.com'),
    instagramUrl: toInstagram('@acepokerleague'),
    description:  '한국 기반의 포커 투어로 2025년 일본에 진출. 오사카 도지마 리버 포럼에서 개최, 바이인 6만엔·보증 상금 3,000만엔 규모.',
  },
  {
    slug: 'wpt-japan',
    name: 'WPT',
    nameKo: '월드 포커 투어 재팬',
    nameJa: 'WPTジャパン',
    websiteUrl:   toUrl('wptevent.jp'),
    twitterUrl:   toTwitter('@WPT_JPN'),
    instagramUrl: toInstagram('@wpt_japan'),
    youtubeUrl:   toYoutube('youtube.com/WorldPokerTour'),
    description:  '세계 3대 포커 투어 WPT의 일본 시리즈. WPT Tokyo는 상금 1억엔으로 일본 최대 규모 토너먼트이며 Sammy와 협력해 도쿄 국제포럼에서 개최.',
  },
  {
    slug: 'japan-gold-dragon',
    name: 'Japan Gold Dragon',
    nameKo: '재팬 골드 드래곤',
    nameJa: 'JAPAN GOLD DRAGON',
    twitterUrl:   toTwitter('@JAPANGOLDDRAGON'),
    instagramUrl: toInstagram('@japangolddragon'),
    youtubeUrl:   toYoutube('youtube.com/@JAPANGOLDDRAGON'),
    flickrUrl:    'https://www.flickr.com/photos/197151411@N05/',
    description:  '오사카 우메다 스카이 빌딩에서 개최되는 대규모 포커 토너먼트. USOP과 협력해 2억엔 이상 보증 상금을 자랑하며 GACKT 등 유명인 참가 이벤트도 특징.',
  },
  {
    slug: 'usop',
    name: 'USOP',
    nameKo: '유 시리즈 오브 포커',
    nameJa: 'ユーシリーズオブポーカー',
    websiteUrl:   toUrl('userieschampionship.com'),
    twitterUrl:   toTwitter('@USOPJAPAN'),
    description:  '2023년 설립된 신생 포커 투어로 동남아시아·일본에서 개최. 2025년 오사카 대회는 GACKT 참가 이벤트와 2억엔 이상 보증 상금으로 주목받음.',
  },
  {
    slug: 'jpf',
    name: 'Japan Poker Festival',
    nameKo: '일본 포커 페스티벌',
    nameJa: 'JAPAN POKER FESTIVAL',
    websiteUrl:   toUrl('pokerfestival.jp'),
    twitterUrl:   toTwitter('@jpf_tw'),
    instagramUrl: toInstagram('@pokerfestival.jp'),
    youtubeUrl:   toYoutube('youtube.com/@japanpokerfestivaljpf9860'),
    description:  'From Japan to the World를 슬로건으로 하는 일본 최대급 포커 페스티벌. 시부야 히카리에에서 개최되며 여성 전용 JPF 신데렐라컵이 특징. 제6회(2024년) 약 5,000명 참가.',
  },
  {
    slug: 'ajpc',
    name: 'AJPC Samurai Circuit',
    nameKo: '전일본 포커 선수권 사무라이 서킷',
    nameJa: '全日本ポーカー選手権 AJPC SAMURAI CIRCUIT',
    websiteUrl:   toUrl('samurai.ajpc.jp'),
    twitterUrl:   toTwitter('@ajpc_ac'),
    description:  '일본 포커 선수의 국제 대회 진출을 지원하는 조직이 주관. 한국(인천 파라다이스시티), 대만, 필리핀 등 아시아 각국에서 시리즈 토너먼트 개최.',
  },
  {
    slug: 'hyakka-ryouran',
    name: '百花繚乱',
    nameKo: '백화요란',
    nameJa: '百花繚乱',
    websiteUrl:   toUrl('linktr.ee/hyakkaryouran1'),
    twitterUrl:   toTwitter('@tohoku_jrp'),
  },
  {
    slug: 'nippon-series',
    name: 'NIPPON SERIES',
    nameKo: '니폰 시리즈',
    nameJa: 'NIPPON SERIES',
  },
]

async function main() {
  let created = 0, updated = 0, skipped = 0

  for (const brand of BRANDS) {
    const existing = await prisma.brand.findUnique({ where: { slug: brand.slug } })

    if (!existing) {
      await prisma.brand.create({
        data: {
          slug:        brand.slug,
          name:        brand.name,
          nameKo:      brand.nameKo      ?? null,
          nameJa:      brand.nameJa      ?? null,
          websiteUrl:   brand.websiteUrl   ?? null,
          twitterUrl:   brand.twitterUrl   ?? null,
          instagramUrl: brand.instagramUrl ?? null,
          youtubeUrl:    brand.youtubeUrl    ?? null,
          flickrUrl:     brand.flickrUrl     ?? null,
          description:  brand.description  ?? null,
          countryCode:  'JP',
        }
      })
      console.log(`✅ 생성: ${brand.slug}`)
      created++
    } else {
      // 비어있는 필드만 채움
      const patch = {}
      if (!existing.nameKo      && brand.nameKo)      patch.nameKo      = brand.nameKo
      if (!existing.nameJa      && brand.nameJa)      patch.nameJa      = brand.nameJa
      if (!existing.websiteUrl   && brand.websiteUrl)   patch.websiteUrl   = brand.websiteUrl
      if (!existing.twitterUrl   && brand.twitterUrl)   patch.twitterUrl   = brand.twitterUrl
      if (!existing.instagramUrl && brand.instagramUrl) patch.instagramUrl = brand.instagramUrl
      if (!existing.youtubeUrl    && brand.youtubeUrl)    patch.youtubeUrl    = brand.youtubeUrl
      if (!existing.flickrUrl     && brand.flickrUrl)     patch.flickrUrl     = brand.flickrUrl
      if (!existing.description  && brand.description)  patch.description  = brand.description

      if (Object.keys(patch).length > 0) {
        await prisma.brand.update({ where: { id: existing.id }, data: patch })
        console.log(`🔄 업데이트: ${brand.slug} → ${Object.keys(patch).join(', ')}`)
        updated++
      } else {
        console.log(`⏭️  스킵: ${brand.slug} (빈 칸 없음)`)
        skipped++
      }
    }
  }

  console.log(`\n완료 — 생성: ${created}, 업데이트: ${updated}, 스킵: ${skipped}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
