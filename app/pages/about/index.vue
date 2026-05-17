<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <header class="mb-10">
      <div class="chip-accent mb-3">About PokerTripJP</div>
      <h1 class="page-title">일본 포커 정보, 한 곳에서.</h1>
      <p class="mt-4 text-lg text-zinc-600">
        일본 포커 대회에 관심 있는 한국 플레이어를 위해 만들었습니다.
      </p>
    </header>

    <div class="space-y-6">
      <div class="surface-card p-6">
        <h2 class="text-lg font-semibold text-zinc-900 mb-3">왜 만들었나요?</h2>
        <p class="text-zinc-700 leading-relaxed">
          JOPT, APL 등 일본의 포커 대회 정보는 각 주최 측 웹사이트에 흩어져 있고
          대부분 일본어로만 제공됩니다. 한국어로 정리된 통합 정보가 없어서
          직접 만들기로 했습니다.
        </p>
      </div>

      <div class="surface-card p-6">
        <h2 class="text-lg font-semibold text-zinc-900 mb-3">무엇을 제공하나요?</h2>
        <ul class="space-y-2 text-zinc-700">
          <li class="flex items-start gap-2">
            <span class="text-indigo-600 font-bold mt-0.5">·</span>
            <span><strong>대회 일정</strong> — JOPT, APL 등 주요 대회의 일정, 장소, 바이인 정보</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-indigo-600 font-bold mt-0.5">·</span>
            <span><strong>이벤트 스케줄</strong> — 대회 내 개별 이벤트 (NLH / PLO / Bounty 등) 통합 조회</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-indigo-600 font-bold mt-0.5">·</span>
            <span><strong>포커룸(펍) 정보</strong> — 대회 끝나고 들를 만한 현지 펍·바 소개</span>
          </li>
        </ul>
      </div>

      <div class="surface-card p-6">
        <h2 class="text-lg font-semibold text-zinc-900 mb-3">정확성에 대해</h2>
        <p class="text-zinc-700 leading-relaxed">
          정보는 주최 측 공식 발표를 기반으로 수기 입력됩니다.
          일정·바이인·장소 등은 변경될 수 있으니, 중요한 사항은 각 대회 공식 채널에서 확인해 주세요.
        </p>
      </div>

      <div class="surface-card p-6">
        <h2 class="text-lg font-semibold text-zinc-900 mb-3">문의</h2>
        <p class="text-zinc-700">
          오류 신고나 정보 추가 요청은 공지 게시판을 이용하거나
          운영자에게 직접 연락해 주세요.
        </p>
      </div>
    </div>

    <div class="mt-10 pt-6 border-t border-zinc-100 text-center">
      <NuxtLink to="/privacy" class="text-xs text-zinc-400 hover:text-zinc-600">
        개인정보처리방침
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About',
  description: 'PokerTripJP 소개 — 일본 포커 대회 정보를 한국어로 정리합니다.',
  ogTitle: 'About | PokerTripJP',
  ogDescription: 'PokerTripJP 소개 — 일본 포커 대회 정보를 한국어로 정리합니다.'
})
</script>
