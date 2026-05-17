<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

    <!-- 헤더 -->
    <div class="mb-10">
      <div class="chip-accent mb-4">{{ ui.guide }}</div>
      <h1 class="page-title">{{ content.title }}</h1>
      <p class="mt-3 text-zinc-600 text-base leading-relaxed">{{ content.subtitle }}</p>
    </div>

    <!-- 섹션 루프 -->
    <div class="space-y-10">
      <section
        v-for="(section, i) in content.sections"
        :key="i"
        class="surface-card p-6 sm:p-8"
      >
        <h2 class="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span class="text-2xl">{{ section.icon }}</span>
          {{ section.heading }}
        </h2>
        <ul class="space-y-3">
          <li
            v-for="(item, j) in section.items"
            :key="j"
            class="flex gap-3 text-sm text-zinc-700 leading-relaxed"
          >
            <span class="text-zinc-300 select-none mt-0.5">•</span>
            <span v-html="item" />
          </li>
        </ul>
      </section>
    </div>

    <!-- CTA -->
    <div class="mt-10 flex flex-wrap gap-3">
      <NuxtLink to="/tournaments" class="btn-primary">{{ ui.browseTournaments }}</NuxtLink>
      <NuxtLink to="/pubs" class="btn-secondary">Explore PokerRooms</NuxtLink>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const { ui } = useUiT()
const { locale } = useLocale()

useSeoMeta({
  title: '참가 가이드 · PokerTripJP',
  description: '일본 포커 대회 참가 방법, 준비물, 주의사항을 한국어로 정리한 가이드'
})

const content = computed(() => {
  if (locale.value === 'ja') return ja
  if (locale.value === 'en') return en
  return ko
})

const ko = {
  title: '일본 포커 대회 참가 가이드',
  subtitle: '처음 일본 포커 대회에 참가하는 분들을 위한 기본 안내입니다.',
  sections: [
    {
      icon: '🪪',
      heading: '신분증 · 입장 조건',
      items: [
        '일본 포커 대회는 대부분 <strong>만 18세 이상</strong>이면 참가 가능합니다.',
        '입장 시 <strong>여권 또는 외국인등록증</strong>을 제시해야 할 수 있습니다.',
        '일부 대회는 사전 온라인 등록이 필요합니다. 각 대회 공식 사이트를 확인하세요.',
        'JOPT·WPT 등 대형 대회는 현장 등록도 가능하나, 인기 이벤트는 조기 마감될 수 있습니다.',
      ]
    },
    {
      icon: '💴',
      heading: '바이인 · 결제',
      items: [
        '일본 포커 대회 바이인은 <strong>현금(엔화) 결제</strong>가 일반적입니다.',
        '카드 결제를 허용하는 행사도 일부 있으나, 현금을 충분히 준비하는 것을 권장합니다.',
        '주요 대회 메인 이벤트 바이인은 ¥30,000 ~ ¥120,000 수준입니다.',
        '환율은 PokerTripJP 메인 페이지에서 실시간으로 확인할 수 있습니다.',
      ]
    },
    {
      icon: '🃏',
      heading: '게임 규칙 · 진행',
      items: [
        '대부분의 대회는 <strong>노리밋 홀덤(NLH)</strong> 기준으로 진행됩니다.',
        '칩 컬러업·어나운스먼트는 일본어로 진행되나, 딜러가 영어로 보조 안내합니다.',
        '핸드 히스토리 요청은 현장 플로어에게 문의하세요.',
        '타임뱅크·앤티·리엔트리 규정은 행사별로 다르므로 사전에 이벤트 스케줄을 확인하세요.',
      ]
    },
    {
      icon: '🗣️',
      heading: '언어 · 소통',
      items: [
        '대형 대회(JOPT·WPT·APL)는 <strong>영어 안내</strong>가 병행되는 경우가 많습니다.',
        '딜러·플로어에게 영어로 질문해도 대부분 기본 의사소통이 가능합니다.',
        '한국어 통역이 가능한 스태프가 있는 행사도 있습니다(APL 등 한국계 브랜드).',
        '스마트폰 번역 앱(구글 번역 카메라 기능)을 활용하면 편리합니다.',
      ]
    },
    {
      icon: '🏨',
      heading: '숙박 · 이동',
      items: [
        '도쿄 대회는 대부분 신주쿠·시부야·시오도메 인근 개최 — 해당 지역 호텔을 권장합니다.',
        '오사카 대회는 도지마·신사이바시 인근이 편리합니다.',
        '삿포로 LAZOR GARDEN은 삿포로역에서 도보권입니다.',
        '교통은 IC카드(Suica·ICOCA)를 미리 발급받으면 편리합니다.',
      ]
    },
    {
      icon: '⚠️',
      heading: '주의사항',
      items: [
        '일본의 포커 대회는 <strong>상금 대신 상품권·해외 대회 패키지</strong>로 지급하는 경우가 있습니다.',
        '현금 상금을 직접 지급하는 대회(WPT·JOPT 등)는 사전에 확인하세요.',
        '대회 일정·바이인은 주최측 사정에 따라 변경될 수 있으므로 공식 사이트를 최종 확인하세요.',
        '당일 컨디션이나 여행 일정에 여유를 두고 참가 계획을 세우시길 권장합니다.',
      ]
    },
  ]
}

const ja = {
  title: '日本ポーカートーナメント参加ガイド',
  subtitle: '初めてのトーナメント参加に向けた基本情報をまとめました。',
  sections: [
    {
      icon: '🪪',
      heading: 'ID・入場条件',
      items: [
        '多くの日本のポーカートーナメントは<strong>18歳以上</strong>が対象です。',
        '入場時に<strong>パスポートまたは在留カード</strong>の提示を求められる場合があります。',
        '一部の大会は事前オンライン登録が必要です。各大会の公式サイトを確認してください。',
        'JOPT・WPTなどの大型大会は現地登録も可能ですが、人気イベントは早期終了することがあります。',
      ]
    },
    {
      icon: '💴',
      heading: 'バイイン・支払い',
      items: [
        '日本のポーカートーナメントのバイインは<strong>現金（円）払い</strong>が一般的です。',
        'カード払いに対応している大会もありますが、現金を十分に用意することをお勧めします。',
        'メインイベントのバイインは¥30,000〜¥120,000程度が多いです。',
        '為替レートはPokerTripJPのトップページでリアルタイム確認できます。',
      ]
    },
    {
      icon: '🃏',
      heading: 'ゲームルール・進行',
      items: [
        'ほとんどのトーナメントは<strong>ノーリミットホールデム（NLH）</strong>で行われます。',
        'チップカラーアップ・アナウンスは日本語ですが、ディーラーが英語でサポートします。',
        'ハンドヒストリーのリクエストはフロアスタッフへお問い合わせください。',
        'タイムバンク・アンティ・リエントリーのルールは大会ごとに異なります。',
      ]
    },
    {
      icon: '🗣️',
      heading: '言語・コミュニケーション',
      items: [
        '大型大会（JOPT・WPT・APL）では<strong>英語案内</strong>が併用されることが多いです。',
        'ディーラー・フロアへ英語で質問しても、基本的なコミュニケーションは可能です。',
        '韓国語対応スタッフがいる大会もあります（APLなどの韓国系ブランド）。',
        'スマートフォンの翻訳アプリが便利です。',
      ]
    },
    {
      icon: '🏨',
      heading: '宿泊・移動',
      items: [
        '東京大会のほとんどは新宿・渋谷・汐留周辺での開催 — その周辺のホテルがおすすめです。',
        '大阪大会は堂島・心斎橋周辺が便利です。',
        '札幌のLAZOR GARDENは札幌駅から徒歩圏内です。',
        '交通はICカード（Suica・ICOCA）を事前に用意すると便利です。',
      ]
    },
    {
      icon: '⚠️',
      heading: '注意事項',
      items: [
        '日本のポーカー大会では、<strong>賞金の代わりに商品券・海外大会パッケージ</strong>で支払われる場合があります。',
        '現金賞金を直接支払う大会（WPT・JOPTなど）は事前に確認してください。',
        '大会日程やバイインは主催者の都合により変更される場合があるため、公式サイトで最終確認してください。',
        '旅行スケジュールに余裕を持って参加計画を立てることをお勧めします。',
      ]
    },
  ]
}

const en = {
  title: 'Japan Poker Tournament Guide',
  subtitle: 'Everything you need to know before joining a poker tournament in Japan.',
  sections: [
    {
      icon: '🪪',
      heading: 'ID & Entry Requirements',
      items: [
        'Most Japanese poker tournaments are open to players <strong>18 years or older</strong>.',
        'You may be asked to show your <strong>passport or residence card</strong> at the door.',
        'Some events require advance online registration. Check each tournament\'s official site.',
        'Major events (JOPT, WPT) allow on-site registration, but popular events can fill up early.',
      ]
    },
    {
      icon: '💴',
      heading: 'Buy-ins & Payments',
      items: [
        'Buy-ins are typically paid in <strong>cash (Japanese yen)</strong>.',
        'Some events accept card payments, but it\'s safer to bring enough cash.',
        'Main event buy-ins typically range from ¥30,000 to ¥120,000.',
        'Check the current JPY↔KRW exchange rate on the PokerTripJP home page.',
      ]
    },
    {
      icon: '🃏',
      heading: 'Game Rules & Format',
      items: [
        'Most tournaments run <strong>No-Limit Hold\'em (NLH)</strong>.',
        'Chip color-ups and announcements are in Japanese, but dealers usually assist in English.',
        'For hand history requests, ask a floor supervisor.',
        'Time banks, antes, and re-entry rules vary by event — check the event schedule in advance.',
      ]
    },
    {
      icon: '🗣️',
      heading: 'Language & Communication',
      items: [
        'Large events (JOPT, WPT, APL) often have <strong>English announcements</strong>.',
        'Dealers and floor staff can handle basic English communication.',
        'Some events (APL and other Korean-originated brands) may have Korean-speaking staff.',
        'Google Translate\'s camera mode is very helpful for reading Japanese text.',
      ]
    },
    {
      icon: '🏨',
      heading: 'Accommodation & Access',
      items: [
        'Tokyo events are mostly held in Shinjuku, Shibuya, or Shiodome — stay nearby for convenience.',
        'Osaka events are often near Dojima or Shinsaibashi.',
        'Sapporo\'s LAZOR GARDEN is within walking distance of Sapporo Station.',
        'Pick up a Suica or ICOCA IC card at the airport for easy transit.',
      ]
    },
    {
      icon: '⚠️',
      heading: 'Important Notes',
      items: [
        'Some Japanese poker events pay prizes in <strong>gift cards or overseas tournament packages</strong> instead of cash.',
        'Events that pay cash prizes directly (WPT, JOPT) should be confirmed in advance.',
        'Schedules and buy-ins are subject to change — always verify on the official site before traveling.',
        'Build flexibility into your travel schedule in case of day-2 runs.',
      ]
    },
  ]
}
</script>
