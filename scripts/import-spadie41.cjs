'use strict'
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const TEXT_FILE = path.resolve(
  'C:/Users/ggoma/.claude/projects/D--development-workspace-poker1st--claude-worktrees-musing-chaum-ee4dc5/57939a6e-2857-41f1-83de-72749d36598d/tool-results/bsr2v2lc8.txt'
)

const TOURNAMENT = {
  titleFull: 'SPADIE 41st',
  titleShort: 'SPADIE41',
  slug: 'spadie-41st',
  city: 'Tokyo',
  countryCode: 'JP',
  venueName: 'ベルサール新宿グランド',
  startDate: new Date('2026-05-21'),
  endDate: new Date('2026-05-24'),
  status: 'UPCOMING',
}

const BRAND = {
  slug: 'spadie',
  name: 'SPADIE',
  websiteUrl: 'https://pokerguild.jp/spadie/',
}

// ─── 有効な minutes ────────────────────────────────────────────────────────────
const VALID_MINS = [10, 15, 20, 25, 30, 40]

// ─── ユーティリティ ────────────────────────────────────────────────────────────
function parseNum(s) {
  return parseInt(String(s).replace(/,/g, ''), 10)
}

// ─── レベル左辺: レベル番号 + SB 分離 ─────────────────────────────────────────
// 例: '1100'→{lv:1,sb:100}, '81,000'→{lv:8,sb:1000}, '101,500'→{lv:10,sb:1500}
function splitLevelSB(leftRaw) {
  const hasCmma = leftRaw.includes(',')
  const s = leftRaw.replace(/,/g, '')

  if (!hasCmma) {
    // 쉼표 없음: 마지막 2~3자리가 SB (100단위)
    for (let sbLen = 3; sbLen >= 2; sbLen--) {
      if (s.length <= sbLen) continue
      const lv = parseInt(s.slice(0, s.length - sbLen), 10)
      const sb = parseInt(s.slice(-sbLen), 10)
      if (lv >= 1 && lv <= 99 && sb > 0 && sb % 100 === 0) {
        return { level: lv, sb }
      }
    }
    return null
  }

  // 쉼표 있음: 쉼표 앞 부분 마지막 1~2자리가 SB 천자리
  const commaPos = leftRaw.indexOf(',')
  const beforeComma = leftRaw.slice(0, commaPos).replace(/,/g, '')
  const afterComma = leftRaw.slice(commaPos + 1)
  const afterNum = parseInt(afterComma, 10)

  // 큰 level 먼저 시도 (내림차순)
  for (let lvLen = beforeComma.length - 1; lvLen >= 1; lvLen--) {
    const lv = parseInt(beforeComma.slice(0, lvLen), 10)
    if (lv < 1 || lv > 99) continue
    const sbThStr = beforeComma.slice(lvLen) // SB 천자리 이상
    const sb = parseInt(sbThStr, 10) * 1000 + afterNum
    if (sb > 0 && sb % 100 === 0) {
      return { level: lv, sb }
    }
  }
  return null
}

// ─── レベル右辺: BB + ante + minutes 分離 ─────────────────────────────────────
// 例: '20020025'→{bb:200,ante:200,min:25}, '1,0001,00025'→{bb:1000,ante:1000,min:25}
// FL例: '40020'→{bb:400,ante:null,min:20}
function splitBBAnteMin(rightRaw, isFL) {
  const s = rightRaw.replace(/,/g, '')

  for (const min of VALID_MINS) {
    const ms = String(min)
    if (!s.endsWith(ms)) continue
    const core = s.slice(0, -ms.length)
    if (!core) continue

    const coreNum = parseInt(core, 10)

    if (isFL) {
      if (coreNum > 0 && coreNum % 100 === 0) return { bb: coreNum, bbAnte: null, minutes: min }
      continue
    }

    // NLH: core = BB + ante (両方100単位)
    const coreLen = core.length
    // BB と ante が近い桁数になるよう中央から試す
    for (let bbLen = Math.ceil(coreLen / 2); bbLen >= 1; bbLen--) {
      const bb = parseInt(core.slice(0, bbLen), 10)
      const ante = parseInt(core.slice(bbLen), 10)
      if (bb > 0 && ante > 0 && bb % 100 === 0 && ante % 100 === 0) {
        if (bb <= ante * 3 && ante <= bb * 3) {
          return { bb, bbAnte: ante, minutes: min }
        }
      }
    }
    // 比率制限なしで再試行
    for (let bbLen = 1; bbLen < coreLen; bbLen++) {
      const bb = parseInt(core.slice(0, bbLen), 10)
      const ante = parseInt(core.slice(bbLen), 10)
      if (bb > 0 && ante > 0 && bb % 100 === 0 && ante % 100 === 0) {
        return { bb, bbAnte: ante, minutes: min }
      }
    }
  }
  return null
}

// ─── gameType 判定 ─────────────────────────────────────────────────────────────
function detectGameType(name) {
  if (/\bPLO\b/.test(name)) return 'PLO'
  if (/\bFL\b/.test(name)) return 'FL'
  if (/\bNL\b/.test(name)) return 'NL'
  return 'NLH'
}

// ─── スケジュールテーブル解析 ──────────────────────────────────────────────────
// 行パターン例: "19:0022:3002NLH Emotional Heart¥5,00030,000♡"
// 日付行: "05/21 Thu."
function parseScheduleTable(lines) {
  const map = new Map() // paddedNo(string '01'~'50') → {date, registrationStart, registrationClose}
  let currentDate = null

  const dateLineRe = /^(\d{2})\/(\d{2})\s+\w+\.\s*$/
  // gameType あり: "19:0022:3002NLH..."
  const scheduleRe = /^(\d{2}:\d{2})(\d{2}:\d{2})(\d{2})(NLH|PLO|FL|NL)/
  // gameType なし (e.g. #17 "19:0023:1017¥..."、#32 "18:0022:1032¥...")
  const scheduleReNoType = /^(\d{2}:\d{2})(\d{2}:\d{2})(\d{2})¥/

  for (const line of lines) {
    const dm = dateLineRe.exec(line.trim())
    if (dm) {
      currentDate = `2026-${dm[1]}-${dm[2]}`
      continue
    }
    if (!currentDate) continue

    const sm = scheduleRe.exec(line.trim()) || scheduleReNoType.exec(line.trim())
    if (sm) {
      const no = sm[3] // '02', '01' など
      if (!map.has(no)) {
        map.set(no, {
          date: currentDate,
          registrationStart: sm[1],
          registrationClose: sm[2],
        })
      }
    }
  }
  return map
}

// ─── イベントセクション内: buyIn ──────────────────────────────────────────────
function parseBuyIn(sectionLines) {
  const re = /¥([\d,]+)\s*\(including/
  for (const line of sectionLines) {
    const m = re.exec(line)
    if (m) {
      return {
        buyInAmount: parseNum(m[1]),
        buyInText: `¥${m[1]}`,
        buyInCurrency: 'JPY',
      }
    }
  }
  return { buyInAmount: null, buyInText: null, buyInCurrency: 'JPY' }
}

// ─── イベントセクション内: startingStack ─────────────────────────────────────
function parseStartingStack(sectionLines) {
  // "Chips30,000 Chips" or "50,000 Chips" のある行
  const re = /Chips([\d,]+)\s+Chips/
  for (const line of sectionLines) {
    const m = re.exec(line)
    if (m) {
      const n = parseNum(m[1])
      if (n >= 1000) return n
    }
  }
  // "¥... チップ数 Chips" 形式: "Chips50,000 Chips"
  const re2 = /([\d,]+)\s+Chips/
  for (const line of sectionLines) {
    const m = re2.exec(line)
    if (m) {
      const n = parseNum(m[1])
      if (n >= 1000) return n
    }
  }
  return null
}

// ─── イベントセクション内: inPrize ────────────────────────────────────────────
// "数字+st/nd/rd/th" を行のどこかで探す (行頭にある場合が多い)
// "31st91,000-2,0002,00020" のように他のデータと連結している場合も処理
function parseInPrize(sectionLines) {
  // 独立行優先
  const reExact = /^(\d+)(st|nd|rd|th)$/i
  for (const line of sectionLines) {
    const m = reExact.exec(line.trim())
    if (m) return parseInt(m[1], 10)
  }
  // 行頭にある場合 ("31st91,000-..." のような連結)
  const rePrefix = /^(\d+)(st|nd|rd|th)(?![a-zA-Z])/i
  for (const line of sectionLines) {
    const m = rePrefix.exec(line.trim())
    if (m) {
      const n = parseInt(m[1], 10)
      // 妥当な範囲 (1~500位)
      if (n >= 1 && n <= 500) return n
    }
  }
  return null
}

// ─── イベントセクション内: registrationClose ──────────────────────────────────
// "HH:MM Reg. Close Lv.X" または単純な "HH:MM Reg. Close" 行
function parseRegClose(sectionLines) {
  const re = /(\d{2}:\d{2})\s+Reg\.\s+Close/
  for (const line of sectionLines) {
    const m = re.exec(line)
    if (m) return m[1]
  }
  return null
}

// ─── レベル解析 ────────────────────────────────────────────────────────────────
// ライン例:
//   NLH: "1100-20020025" or "Chips30,000 Chips5400-80080025*"
//   FL:  "1200-40020" or "1FL-200-40030"
//   PLO: NLHと同形 だが "LevelBlindsMinutes" の場合はante列なし
function parseLevels(sectionLines, gameType) {
  const isFL = gameType === 'FL'
  // PLO Starter/Turbo/Prime/Championship は ante列なし ("LevelBlindsMinutes")
  const isPLOnoAnte = gameType === 'PLO' && sectionLines.some(l => l.trim() === 'LevelBlindsMinutes')

  const levels = []

  for (let i = 0; i < sectionLines.length; i++) {
    const raw = sectionLines[i]
    const line = raw.trim()

    // "*Break" 行: 直前レベルに isBreak フラグ
    if (line === '*Break') {
      if (levels.length > 0) levels[levels.length - 1].isBreak = true
      continue
    }

    // FL 固有: "1FL-200-40030" 形式
    if (isFL && /^\d+FL-[\d,]+-[\d,]+\d+(\*?)$/.test(line)) {
      const flRe = /^(\d+)FL-([\d,]+)-([\d,]+)(\d+)(\*?)$/
      const fm = flRe.exec(line)
      if (fm) {
        const lv = parseInt(fm[1], 10)
        const sb = parseNum(fm[2])
        const bb = parseNum(fm[3])
        const min = parseInt(fm[4], 10)
        const isB = !!fm[5]
        if (lv >= 1 && lv <= 99 && VALID_MINS.includes(min)) {
          levels.push({ level: lv, isBreak: isB, smallBlind: sb, bigBlind: bb, bbAnte: null, minutes: min })
        }
      }
      continue
    }

    // STUD行スキップ (FL H.E.R.O.S.)
    if (/^STUD/.test(line)) continue

    // 汎用レベル行: ライン内に "数字-数字" が含まれるか
    if (!/\d-\d/.test(line)) continue

    // ライン内の最後の "数字,-数字" パターンを見つける
    const segMatch = /([\d,]+)-([\d,]+\d)(\*?)$/.exec(line)
    if (!segMatch) continue

    const rightFull = segMatch[2]
    const star = segMatch[3] === '*'

    let leftFull = segMatch[1]

    // "Lv.N" 接頭語が leftFull に混入している場合を除去
    // 例: "81100" (= Lv.8 + level1SB100) → level+SB 部分だけ取り出す
    // 方針: splitLevelSB の結果で level が大きすぎる場合 (>20) かつ
    //       左から1~2桁を Lv 番号として除いた残りが有効なら採用
    let lsb = splitLevelSB(leftFull)
    // Lv.N 接頭語混入の可能性チェック: level が大きすぎる or null の場合
    if (!lsb || lsb.level > 20) {
      const s = leftFull.replace(/,/g, '')
      let found = false
      for (let skip = 1; skip <= 3 && !found; skip++) {
        const candidate = s.slice(skip)
        if (!candidate) continue
        const lsb2 = splitLevelSB(candidate)
        if (lsb2 && lsb2.level <= 20) {
          lsb = lsb2
          found = true
        }
      }
      if (!found && !lsb) continue
    }
    if (!lsb) continue

    const { level, sb } = lsb

    // 右辺から BB/ante/min を取り出す
    const useFL = isFL || isPLOnoAnte
    const bam = splitBBAnteMin(rightFull, useFL)
    if (!bam) continue

    const { bb, bbAnte, minutes } = bam

    // 次行が "*Break" なら isBreak
    const isB = star || (i + 1 < sectionLines.length && sectionLines[i + 1].trim() === '*Break')

    levels.push({
      level,
      isBreak: isB,
      smallBlind: sb,
      bigBlind: bb,
      bbAnte: useFL ? null : bbAnte,
      minutes,
    })
  }

  // ─── レベル番号の正規化 ──────────────────────────────────────────────────────
  // 1. 重複除去 (同じレベルが複数回パースされた場合)
  // 2. 連続性チェック: レベル番号は単調増加であるべき
  //    "Lv.81100-..." のような接頭語混入で level=81 が出ることがあるため除去
  const seen = new Set()
  const raw = levels.filter(lv => {
    if (seen.has(lv.level)) return false
    seen.add(lv.level)
    return true
  })

  if (raw.length === 0) return raw

  // 連続性フィルタ: level は前の level+1 か +2 以内であるべき (break後も継続)
  // 最初のレベルは 1~5 の範囲
  const filtered = []
  let prevLevel = 0
  for (const lv of raw) {
    if (prevLevel === 0) {
      // 最初のレベル: 1~10 の範囲ならOK
      if (lv.level >= 1 && lv.level <= 10) {
        filtered.push(lv)
        prevLevel = lv.level
      }
      // 範囲外はスキップ (接頭語混入と判断)
    } else {
      // 以降: prev より大きく prev+5 以内 (通常は+1、稀にスキップあり)
      if (lv.level > prevLevel && lv.level <= prevLevel + 5) {
        filtered.push(lv)
        prevLevel = lv.level
      }
      // 範囲外はスキップ
    }
  }
  return filtered
}

// ─── メインパーサー ─────────────────────────────────────────────────────────────
function parseTextFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  const lines = text.split('\n').map(l => l.trimEnd())

  // 1. スケジュールテーブル解析 (ファイル冒頭部分)
  const scheduleMap = parseScheduleTable(lines)

  // 2. "#XX Name" 形式のイベントセクションを抽出
  const eventSections = []
  let currentSection = null

  for (const line of lines) {
    const hm = /^#(\d{2})\s+(.+)$/.exec(line.trim())
    if (hm) {
      if (currentSection) eventSections.push(currentSection)
      currentSection = { no: hm[1], name: hm[2].trim(), lines: [] }
    } else if (currentSection) {
      currentSection.lines.push(line)
    }
  }
  if (currentSection) eventSections.push(currentSection)

  // 3. 各セクション解析
  const events = []

  for (const sec of eventSections) {
    const no = parseInt(sec.no, 10)
    const name = sec.name
    const schedInfo = scheduleMap.get(sec.no) || {}
    const gameType = detectGameType(name)

    const { buyInAmount, buyInText, buyInCurrency } = parseBuyIn(sec.lines)
    const startingStack = parseStartingStack(sec.lines)
    const inPrize = parseInPrize(sec.lines)
    const regCloseFromSection = parseRegClose(sec.lines)

    const date = schedInfo.date ? new Date(schedInfo.date) : null
    const registrationStart = schedInfo.registrationStart || null
    const registrationClose = regCloseFromSection || schedInfo.registrationClose || null

    const levels = parseLevels(sec.lines, gameType)

    events.push({
      eventNo: no,
      name,
      gameType,
      date,
      registrationStart,
      registrationClose,
      buyInAmount,
      buyInText,
      buyInCurrency,
      startingStack,
      inPrize,
      orderNo: no,
      levels,
    })
  }

  return { events, scheduleMap }
}

// ─── DB書き込み / dry-run ──────────────────────────────────────────────────────
async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  console.log(`\n===== SPADIE 41st インポート ${isDryRun ? '[DRY-RUN]' : '[LIVE]'} =====\n`)

  const { events, scheduleMap } = parseTextFile(TEXT_FILE)

  if (isDryRun) {
    console.log('--- Brand ---')
    console.log(JSON.stringify(BRAND, null, 2))

    console.log('\n--- Tournament ---')
    const t = { ...TOURNAMENT, startDate: TOURNAMENT.startDate.toISOString().slice(0, 10), endDate: TOURNAMENT.endDate.toISOString().slice(0, 10) }
    console.log(JSON.stringify(t, null, 2))

    console.log(`\n--- Schedule Map (${scheduleMap.size}件) ---`)
    for (const [no, info] of scheduleMap) {
      console.log(`  #${no}: ${info.date} start=${info.registrationStart} close=${info.registrationClose}`)
    }

    console.log(`\n--- Events (${events.length}件) ---`)
    for (const ev of events) {
      const dateStr = ev.date ? ev.date.toISOString().slice(0, 10) : 'N/A'
      const lvOk = ev.levels.length > 0 ? `${ev.levels.length}件` : '0件 ⚠'
      const inPrStr = ev.inPrize ? `${ev.inPrize}位` : 'N/A'
      console.log(`\n  #${String(ev.eventNo).padStart(2, '0')} ${ev.name}`)
      console.log(`    gameType: ${ev.gameType}  date: ${dateStr}`)
      console.log(`    start: ${ev.registrationStart || 'N/A'}  close: ${ev.registrationClose || 'N/A'}`)
      console.log(`    buyIn: ${ev.buyInText || 'N/A'}  stack: ${ev.startingStack ? ev.startingStack.toLocaleString() : 'N/A'}`)
      console.log(`    inPrize: ${inPrStr}  levels: ${lvOk}`)
      if (ev.levels.length > 0) {
        const show = ev.levels.slice(0, 4)
        for (const lv of show) {
          const ante = lv.bbAnte != null ? ` ante=${lv.bbAnte.toLocaleString()}` : ''
          const brk = lv.isBreak ? ' [BREAK]' : ''
          console.log(`      Lv${lv.level}: ${lv.smallBlind.toLocaleString()}-${lv.bigBlind.toLocaleString()}${ante}  ${lv.minutes}min${brk}`)
        }
        if (ev.levels.length > 4) console.log(`      ... (他${ev.levels.length - 4}件)`)
      }
    }

    const totalLevels = events.reduce((s, e) => s + e.levels.length, 0)
    const noDate = events.filter(e => !e.date).length
    const noLevels = events.filter(e => e.levels.length === 0).length
    console.log(`\n--- サマリー ---`)
    console.log(`  イベント数: ${events.length}`)
    console.log(`  総レベル数: ${totalLevels}`)
    console.log(`  date未確認: ${noDate}件`)
    console.log(`  levels 0件: ${noLevels}件`)
    console.log('\n===== DRY-RUN 完了 =====\n')
    return
  }

  // ─── LIVE モード ────────────────────────────────────────────────────────────
  const prisma = new PrismaClient()
  try {
    // 1. Brand upsert
    const brand = await prisma.brand.upsert({
      where: { slug: BRAND.slug },
      create: BRAND,
      update: { name: BRAND.name, websiteUrl: BRAND.websiteUrl },
    })
    console.log(`Brand upserted: id=${brand.id} slug=${brand.slug}`)

    // 2. Tournament upsert
    const tournament = await prisma.tournament.upsert({
      where: { slug: TOURNAMENT.slug },
      create: { ...TOURNAMENT, brandId: brand.id },
      update: {
        titleFull: TOURNAMENT.titleFull,
        titleShort: TOURNAMENT.titleShort,
        city: TOURNAMENT.city,
        countryCode: TOURNAMENT.countryCode,
        venueName: TOURNAMENT.venueName,
        startDate: TOURNAMENT.startDate,
        endDate: TOURNAMENT.endDate,
        status: TOURNAMENT.status,
      },
    })
    console.log(`Tournament upserted: id=${tournament.id} slug=${tournament.slug}`)

    // 3. Events
    let evCreated = 0
    let lvCreated = 0

    for (const ev of events) {
      if (!ev.date) {
        console.warn(`  SKIP #${ev.eventNo} "${ev.name}": date 不明`)
        continue
      }

      const created = await prisma.event.create({
        data: {
          tournamentId: tournament.id,
          eventNo: ev.eventNo,
          name: ev.name,
          gameType: ev.gameType,
          date: ev.date,
          registrationStart: ev.registrationStart,
          registrationClose: ev.registrationClose,
          buyInAmount: ev.buyInAmount,
          buyInText: ev.buyInText,
          buyInCurrency: ev.buyInCurrency,
          startingStack: ev.startingStack,
          inPrize: ev.inPrize,
          orderNo: ev.orderNo,
          structureLevels: {
            create: ev.levels.map(lv => ({
              level: lv.level,
              isBreak: lv.isBreak,
              smallBlind: lv.smallBlind,
              bigBlind: lv.bigBlind,
              bbAnte: lv.bbAnte,
              minutes: lv.minutes,
            })),
          },
        },
      })
      evCreated++
      lvCreated += ev.levels.length
      console.log(`  Event #${String(ev.eventNo).padStart(2,'0')} "${ev.name}" → id=${created.id} (${ev.levels.length} levels)`)
    }

    console.log(`\n===== 完了: events=${evCreated}, levels=${lvCreated} =====\n`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
