<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">

    <div v-if="pending" class="muted text-sm py-12">Loading...</div>

    <template v-else-if="tournament">
      <div class="mb-4">
        <NuxtLink to="/tournaments" class="text-sm text-zinc-500 hover:text-zinc-900">
          {{ ui.backToTournaments }}
        </NuxtLink>
      </div>

      <!-- Hero -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">

        <!-- 포스터 -->
        <div class="surface-card overflow-hidden">
          <div class="aspect-[3/4] bg-zinc-100 flex items-center justify-center">
            <img
              v-if="tournament.posterImageUrl"
              :src="tournament.posterImageUrl"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-5xl text-zinc-300">♠</span>
          </div>
        </div>

        <!-- 정보 -->
        <div class="lg:col-span-2 flex flex-col gap-4">

          <!-- 브랜드 -->
          <NuxtLink
            v-if="tournament.brand"
            :to="`/brands/${tournament.brand.slug}`"
            class="inline-flex items-center gap-2 w-fit"
          >
            <div v-if="tournament.brand.logoUrl" class="h-6 w-6 rounded overflow-hidden border border-zinc-200 bg-white shrink-0">
              <img :src="tournament.brand.logoUrl" class="h-full w-full object-contain" />
            </div>
            <span class="text-sm font-medium text-zinc-500 hover:text-zinc-900 uppercase tracking-wide">
              {{ tournament.brand.name }}
            </span>
          </NuxtLink>

          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span v-if="statusBadge" :class="statusBadge">{{ statusLabel }}</span>
            <ShareButton :title="tournament.titleShort" />
          </div>

          <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-tight">
            {{ tournament.titleFull || tournament.titleShort }}
          </h1>
          <!-- 로케일별 번역 부제목 -->
          <p v-if="localizedTitle" class="text-base text-zinc-400 font-normal -mt-2">
            {{ localizedTitle }}
          </p>

          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm pt-2">
            <div>
              <dt class="text-zinc-500">{{ ui.period }}</dt>
              <dd class="text-zinc-900 font-medium">
                {{ fmtDate(tournament.startDate) }} – {{ fmtDate(tournament.endDate) }}
              </dd>
            </div>
            <div>
              <dt class="text-zinc-500">{{ ui.location }}</dt>
              <dd class="text-zinc-900 font-medium">
                {{ tournament.city }}, {{ countryName(tournament.countryCode) }}
              </dd>
            </div>
            <div v-if="tournament.venueName">
              <dt class="text-zinc-500">{{ ui.venue }}</dt>
              <dd class="text-zinc-900 font-medium">{{ tournament.venueName }}</dd>
              <dd v-if="tournament.venueAddress" class="text-zinc-500 text-xs mt-0.5">
                {{ tournament.venueAddress }}
              </dd>
            </div>
            <div v-if="tournament.timezone">
              <dt class="text-zinc-500">Timezone</dt>
              <dd class="text-zinc-900 font-medium">{{ tournament.timezone }}</dd>
            </div>
          </dl>

          <p v-if="tournament.description || tournament.descriptionKo || tournament.descriptionJa" class="text-zinc-700 mt-2 leading-relaxed">
            {{ t(tournament.descriptionKo, tournament.descriptionJa, tournament.description) }}
          </p>

          <!-- Official Website + Player's Guide -->
          <div v-if="tournament.brand?.websiteUrl || playerGuideUrl" class="flex flex-wrap gap-3 mt-4">
            <a
              v-if="tournament.brand?.websiteUrl"
              :href="tournament.brand.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Official Website
            </a>
            <a
              v-if="playerGuideUrl"
              :href="playerGuideUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-lg px-3 py-1.5 hover:bg-emerald-50 transition"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Player's Guide
              <span class="text-xs opacity-60">{{ playerGuideLang }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 이벤트 목록 -->
      <section>
        <h2 class="section-title mb-4">{{ ui.eventSchedule }}</h2>

        <div v-if="!tournament.events?.length" class="surface-card p-8 text-center muted">
          {{ ui.noEvents }}
        </div>

        <template v-else>
          <!-- 데스크탑 테이블 -->
          <div class="surface-card overflow-hidden hidden sm:block">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th class="text-left font-medium px-3 py-3 whitespace-nowrap text-zinc-400 w-12">No.</th>
                    <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.date }}</th>
                    <th class="text-left font-medium px-4 py-3">{{ ui.eventCol }}</th>
                    <th class="text-left font-medium px-4 py-3 whitespace-nowrap">Buy-in</th>
                    <th class="text-left font-medium px-4 py-3 whitespace-nowrap">GTD</th>
                    <th class="text-left font-medium px-4 py-3 whitespace-nowrap">{{ ui.game }}</th>
                    <th class="w-8 px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <template v-for="ev in tournament.events" :key="ev.id">
                    <tr
                      :id="`event-row-${ev.id}`"
                      class="cursor-pointer hover:bg-zinc-50 transition"
                      @click="toggleEvent(ev.id)"
                    >
                      <td class="px-3 py-3 text-zinc-400 text-xs font-mono whitespace-nowrap">
                        {{ ev.eventNo != null ? `#${ev.eventNo}` : '' }}
                      </td>
                      <td class="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                        <div>{{ fmtDate(ev.date) }}</div>
                        <div v-if="ev.registrationStart" class="text-zinc-400 mt-0.5">{{ ev.registrationStart }}</div>
                      </td>
                      <td class="px-4 py-3 font-medium text-zinc-900">
                        <div class="flex items-center gap-1.5">
                          {{ ev.name }}
                          <span v-if="resultsByEventId.get(ev.id)?.length" class="text-amber-400 text-xs" title="결과 있음">🏆</span>
                        </div>
                        <span v-if="ev.nameKo" class="block text-xs text-zinc-400 font-normal">{{ ev.nameKo }}</span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap">{{ ev.buyInText || fmtYen(ev.buyInAmount) || '—' }}</td>
                      <td class="px-4 py-3 whitespace-nowrap">{{ ev.gtdText || fmtYen(ev.gtdAmount) || '—' }}</td>
                      <td class="px-4 py-3 text-zinc-600">{{ ev.gameType || '—' }}</td>
                      <td class="px-2 py-3 text-zinc-400 text-center text-xs">
                        {{ openedEvent === ev.id ? '▲' : '▼' }}
                      </td>
                    </tr>
                    <tr v-if="openedEvent === ev.id">
                      <td colspan="7" class="bg-indigo-50/50 px-4 py-4 border-l-2 border-indigo-300">
                        <!-- Days 테이블 -->
                        <div v-if="ev.days?.length" class="mb-4">
                          <div class="text-zinc-500 text-xs uppercase tracking-wide mb-2">Schedule</div>
                          <table class="text-sm border-collapse">
                            <tbody>
                              <tr v-for="day in ev.days" :key="day.label" class="border-b border-indigo-100 last:border-0">
                                <td class="pr-4 py-1.5 font-semibold text-indigo-700 whitespace-nowrap">{{ day.label }}</td>
                                <td class="pr-4 py-1.5 text-zinc-600 whitespace-nowrap">{{ day.date }}</td>
                                <td class="pr-4 py-1.5 text-zinc-900 whitespace-nowrap">{{ day.start }} start</td>
                                <td v-if="day.regClose" class="py-1.5 text-zinc-500 whitespace-nowrap">~ {{ day.regClose }} reg close</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                          <div v-if="ev.registrationClose">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-1">{{ ui.regClose }}</div>
                            <div class="text-zinc-900">
                              {{ ev.registrationClose }}
                              <span class="text-zinc-400 text-xs ml-1">({{ tournament.timezone || 'Asia/Tokyo' }})</span>
                            </div>
                          </div>
                          <div v-if="ev.startingStack">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-1">{{ ui.startingStack }}</div>
                            <div class="text-zinc-900">{{ ev.startingStack.toLocaleString() }}</div>
                          </div>
                          <div v-if="ev.inPrize">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-1">{{ ui.inPrize }}</div>
                            <div class="text-zinc-900">{{ ordinal(ev.inPrize) }}</div>
                          </div>
                          <div v-if="ev.nextDayPct">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-1">{{ ui.nextDayPct }}</div>
                            <div class="text-zinc-900">{{ Math.round(Number(ev.nextDayPct) * 100) }}%</div>
                          </div>
                          <div v-if="ev.description" class="col-span-2 sm:col-span-3">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-1">{{ ui.notes }}</div>
                            <div class="text-zinc-700">{{ ev.description }}</div>
                          </div>
                          <div v-if="ev.tags?.length" class="col-span-2 sm:col-span-3">
                            <div class="text-zinc-500 text-xs uppercase tracking-wide mb-2">{{ ui.tags }}</div>
                            <div class="flex flex-wrap gap-1.5">
                              <span v-for="t in ev.tags" :key="t.tag.slug" class="chip">
                                {{ t.tag.name }}
                              </span>
                            </div>
                          </div>
                        </div>

                        <!-- 구조표 -->
                        <template v-if="ev.structureLevels?.length">
                          <div class="mt-4 pt-4 border-t border-indigo-200">
                            <button
                              class="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 hover:text-zinc-800 transition"
                              @click="toggleStructure(ev.id)"
                            >
                              Structure
                              <span class="text-[10px]">{{ openedStructure === ev.id ? '▲' : '▼' }}</span>
                            </button>
                            <div v-if="openedStructure === ev.id" class="overflow-x-auto">
                              <table class="text-xs w-full max-w-md">
                                <thead class="text-zinc-400 uppercase tracking-wide">
                                  <tr>
                                    <th class="text-left font-medium py-1 pr-4 w-14">Level</th>
                                    <th class="text-left font-medium py-1 pr-4">Blinds</th>
                                    <th class="text-left font-medium py-1 pr-4">BB Ante</th>
                                    <th class="text-left font-medium py-1">Min</th>
                                  </tr>
                                </thead>
                                <tbody class="divide-y divide-indigo-100">
                                  <tr
                                    v-for="lv in ev.structureLevels"
                                    :key="lv.id"
                                    :class="lv.isBreak ? 'bg-amber-50/70 text-amber-700' : 'text-zinc-700'"
                                  >
                                    <template v-if="lv.isBreak">
                                      <td class="py-1 pr-4 text-zinc-300 font-mono">—</td>
                                      <td colspan="2" class="py-1 font-semibold text-xs uppercase tracking-wider">BREAK</td>
                                      <td class="py-1 font-mono">{{ lv.minutes }}</td>
                                    </template>
                                    <template v-else>
                                      <td class="py-1 pr-4 font-mono">{{ lv.level }}</td>
                                      <td class="py-1 pr-4 font-mono">{{ lv.smallBlind.toLocaleString() }} - {{ lv.bigBlind.toLocaleString() }}</td>
                                      <td class="py-1 pr-4 font-mono">{{ lv.bbAnte != null ? lv.bbAnte.toLocaleString() : '—' }}</td>
                                      <td class="py-1 font-mono">{{ lv.minutes }}</td>
                                    </template>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </template>

                        <!-- 이벤트 결과 -->
                        <template v-if="resultsByEventId.get(ev.id)?.length">
                          <div class="mt-4 pt-4 border-t border-indigo-200">
                            <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{{ ui.results }}</div>
                            <div class="space-y-1">
                              <div
                                v-for="r in resultsByEventId.get(ev.id)"
                                :key="r.id"
                                class="flex items-center gap-3 text-sm"
                              >
                                <span
                                  class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
                                  :class="{
                                    'bg-amber-400 text-white': r.place === 1,
                                    'bg-zinc-300 text-zinc-700': r.place === 2,
                                    'bg-orange-300 text-white': r.place === 3,
                                    'bg-zinc-100 text-zinc-500': r.place > 3
                                  }"
                                >{{ r.place }}</span>
                                <span class="font-medium text-zinc-900">{{ r.playerName }}</span>
                                <span v-if="r.playerNameKo" class="text-zinc-400 text-xs">{{ r.playerNameKo }}</span>
                                <span v-if="r.country" class="text-zinc-400 text-xs">{{ r.country }}</span>
                                <span v-if="r.prizeText || r.prize" class="ml-auto font-semibold text-zinc-700 shrink-0">
                                  {{ r.prizeText || '¥' + Number(r.prize).toLocaleString() }}
                                </span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 모바일 카드 -->
          <div class="sm:hidden space-y-2">
            <div
              v-for="ev in tournament.events"
              :key="ev.id"
              :id="`event-row-${ev.id}`"
              class="surface-card overflow-hidden"
            >
              <button
                class="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
                @click="toggleEvent(ev.id)"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 text-xs text-zinc-500 mb-0.5">
                    <span>{{ fmtDate(ev.date) }}{{ ev.registrationStart ? ' ' + ev.registrationStart : '' }}</span>
                    <span v-if="ev.eventNo != null" class="font-mono text-zinc-400">#{{ ev.eventNo }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 font-medium text-zinc-900 text-sm">
                    {{ ev.name }}
                    <span v-if="resultsByEventId.get(ev.id)?.length" class="text-xs">🏆</span>
                  </div>
                  <div class="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-zinc-500">
                    <span v-if="ev.buyInText || ev.buyInAmount">{{ ev.buyInText || fmtYen(ev.buyInAmount) }}</span>
                    <span v-if="ev.gtdText || ev.gtdAmount">GTD {{ ev.gtdText || fmtYen(ev.gtdAmount) }}</span>
                    <span v-if="ev.gameType">{{ ev.gameType }}</span>
                  </div>
                </div>
                <span class="text-zinc-400 text-xs mt-1 shrink-0">{{ openedEvent === ev.id ? '▲' : '▼' }}</span>
              </button>

              <div v-if="openedEvent === ev.id" class="border-t border-zinc-100 bg-indigo-50/50 px-4 py-3 border-l-2 border-l-indigo-300">
                <!-- Days -->
                <div v-if="ev.days?.length" class="mb-3">
                  <div class="text-zinc-500 text-[10px] uppercase tracking-wide mb-1.5">Schedule</div>
                  <div class="space-y-1">
                    <div v-for="day in ev.days" :key="day.label" class="flex flex-wrap gap-x-3 text-xs">
                      <span class="font-semibold text-indigo-700 w-16 shrink-0">{{ day.label }}</span>
                      <span class="text-zinc-600">{{ day.date }}</span>
                      <span class="text-zinc-900">{{ day.start }}</span>
                      <span v-if="day.regClose" class="text-zinc-400">~ {{ day.regClose }}</span>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div v-if="ev.registrationClose">
                    <div class="text-zinc-500">{{ ui.regClose }}</div>
                    <div class="text-zinc-900 font-medium">
                      {{ ev.registrationClose }}
                      <span class="text-zinc-400 font-normal text-[10px] ml-0.5">({{ tournament.timezone || 'Asia/Tokyo' }})</span>
                    </div>
                  </div>
                  <div v-if="ev.startingStack">
                    <div class="text-zinc-500">{{ ui.startingStack }}</div>
                    <div class="text-zinc-900 font-medium">{{ ev.startingStack.toLocaleString() }}</div>
                  </div>
                  <div v-if="ev.inPrize">
                    <div class="text-zinc-500">{{ ui.inPrize }}</div>
                    <div class="text-zinc-900 font-medium">{{ ordinal(ev.inPrize) }}</div>
                  </div>
                </div>
                <div v-if="ev.tags?.length" class="flex flex-wrap gap-1 mt-2">
                  <span v-for="t in ev.tags" :key="t.tag.slug" class="chip text-xs">{{ t.tag.name }}</span>
                </div>

                <!-- 구조표 (모바일) -->
                <template v-if="ev.structureLevels?.length">
                  <div class="mt-3 pt-3 border-t border-indigo-200">
                    <button
                      class="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2 hover:text-zinc-800"
                      @click="toggleStructure(ev.id)"
                    >
                      Structure
                      <span class="text-[10px]">{{ openedStructure === ev.id ? '▲' : '▼' }}</span>
                    </button>
                    <div v-if="openedStructure === ev.id" class="overflow-x-auto">
                      <table class="text-xs w-full max-w-xs">
                        <thead class="text-zinc-400 uppercase tracking-wide">
                          <tr>
                            <th class="text-left font-medium py-1 pr-3 w-10">Lv</th>
                            <th class="text-left font-medium py-1 pr-3">Blinds</th>
                            <th class="text-left font-medium py-1 pr-3">Ante</th>
                            <th class="text-left font-medium py-1">Min</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-indigo-100">
                          <tr
                            v-for="lv in ev.structureLevels"
                            :key="lv.id"
                            :class="lv.isBreak ? 'bg-amber-50/70 text-amber-700' : 'text-zinc-700'"
                          >
                            <template v-if="lv.isBreak">
                              <td class="py-1 pr-3 text-zinc-300 font-mono">—</td>
                              <td colspan="2" class="py-1 font-semibold text-[10px] uppercase tracking-wider">BREAK</td>
                              <td class="py-1 font-mono">{{ lv.minutes }}</td>
                            </template>
                            <template v-else>
                              <td class="py-1 pr-3 font-mono">{{ lv.level }}</td>
                              <td class="py-1 pr-3 font-mono">{{ lv.smallBlind.toLocaleString() }}-{{ lv.bigBlind.toLocaleString() }}</td>
                              <td class="py-1 pr-3 font-mono">{{ lv.bbAnte != null ? lv.bbAnte.toLocaleString() : '—' }}</td>
                              <td class="py-1 font-mono">{{ lv.minutes }}</td>
                            </template>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </template>

                <!-- 이벤트 결과 (모바일) -->
                <template v-if="resultsByEventId.get(ev.id)?.length">
                  <div class="mt-3 pt-3 border-t border-indigo-200">
                    <div class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{{ ui.results }}</div>
                    <div class="space-y-1.5">
                      <div
                        v-for="r in resultsByEventId.get(ev.id)"
                        :key="r.id"
                        class="flex items-center gap-2 text-xs"
                      >
                        <span
                          class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0"
                          :class="{
                            'bg-amber-400 text-white': r.place === 1,
                            'bg-zinc-300 text-zinc-700': r.place === 2,
                            'bg-orange-300 text-white': r.place === 3,
                            'bg-zinc-100 text-zinc-500': r.place > 3
                          }"
                        >{{ r.place }}</span>
                        <span class="font-medium text-zinc-900">{{ r.playerName }}</span>
                        <span v-if="r.country" class="text-zinc-400">{{ r.country }}</span>
                        <span v-if="r.prizeText || r.prize" class="ml-auto font-semibold text-zinc-700 shrink-0">
                          {{ r.prizeText || '¥' + Number(r.prize).toLocaleString() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <p class="text-xs text-zinc-500 mt-3">{{ ui.eventsTotal(tournament.events.length) }}</p>
        </template>
      </section>

      <!-- 이벤트 미지정 전체 결과 (eventId = null) -->
      <section v-if="globalResults.length" class="mt-10">
        <h2 class="section-title mb-4">{{ ui.overallResults }}</h2>
        <div class="surface-card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
              <tr>
                <th class="text-left font-medium px-4 py-3 w-16">{{ ui.place }}</th>
                <th class="text-left font-medium px-4 py-3">{{ ui.player }}</th>
                <th class="text-left font-medium px-4 py-3 hidden sm:table-cell">{{ ui.country }}</th>
                <th class="text-left font-medium px-4 py-3">{{ ui.prize }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr
                v-for="r in globalResults"
                :key="r.id"
                class="hover:bg-zinc-50"
                :class="r.place === 1 ? 'bg-amber-50/60' : ''"
              >
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                    :class="{
                      'bg-amber-400 text-white': r.place === 1,
                      'bg-zinc-300 text-zinc-700': r.place === 2,
                      'bg-orange-300 text-white': r.place === 3,
                      'bg-zinc-100 text-zinc-500': r.place > 3
                    }"
                  >{{ r.place }}</span>
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium text-zinc-900">{{ r.playerName }}</div>
                  <div v-if="r.playerNameKo" class="text-xs text-zinc-400">{{ r.playerNameKo }}</div>
                </td>
                <td class="px-4 py-3 text-zinc-500 hidden sm:table-cell">{{ r.country || '—' }}</td>
                <td class="px-4 py-3 font-semibold text-zinc-800">
                  {{ r.prizeText || (r.prize ? '¥' + Number(r.prize).toLocaleString() : '—') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <div v-else class="surface-card p-10 text-center muted">
      {{ ui.tournamentNotFound }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const { locale, t } = useLocale()
const { ui } = useUiT()
const { data: tournament, pending } = await useFetch(
  () => `/api/tournaments/${route.params.slug}`
)
const { data: results } = await useFetch(
  () => `/api/tournaments/${route.params.slug}/results`
)

useSeoMeta({
  title:         computed(() => tournament.value?.titleShort ?? 'Tournament'),
  description:   computed(() => tournament.value?.description ?? `${tournament.value?.titleShort} 대회 일정 및 이벤트 정보`),
  ogTitle:       computed(() => `${tournament.value?.titleShort ?? 'Tournament'} | poker1st`),
  ogDescription: computed(() => tournament.value?.description ?? `${tournament.value?.city} · ${tournament.value?.titleFull}`),
  ogImage:       computed(() => tournament.value?.posterImageUrl ?? undefined)
})

// 로케일 부제목 — 원제(titleFull)와 다를 때만 표시
const localizedTitle = computed(() => {
  const tv = tournament.value
  if (!tv) return null
  const original = tv.titleFull || tv.titleShort
  let candidate = null
  if (locale.value === 'ko') candidate = tv.titleFullKo
  else if (locale.value === 'ja') candidate = tv.titleFullJa
  // 원제와 같으면 부제목 불필요
  if (!candidate || candidate === original) return null
  return candidate
})

// Player's Guide — 로케일 우선, 없으면 ja → ko → en 순으로 fallback
const playerGuideUrl = computed(() => {
  const pg = tournament.value?.playerGuides
  if (!pg || typeof pg !== 'object') return null
  // locale 우선
  const loc = locale.value
  if (loc === 'ja' && pg.ja) return pg.ja
  if (loc === 'ko' && pg.ko) return pg.ko
  if (loc === 'en' && pg.en) return pg.en
  // fallback: ja → ko → en
  return pg.ja || pg.ko || pg.en || null
})

const playerGuideLang = computed(() => {
  const pg = tournament.value?.playerGuides
  if (!pg || typeof pg !== 'object') return ''
  const loc = locale.value
  if (loc === 'ja' && pg.ja) return 'JA'
  if (loc === 'ko' && pg.ko) return 'KO'
  if (loc === 'en' && pg.en) return 'EN'
  if (pg.ja) return 'JA'
  if (pg.ko) return 'KO'
  if (pg.en) return 'EN'
  return ''
})

// 이벤트별 결과 맵 (eventId → 결과 배열)
const resultsByEventId = computed(() => {
  const map = new Map()
  for (const r of results.value ?? []) {
    if (r.eventId == null) continue
    if (!map.has(r.eventId)) map.set(r.eventId, [])
    map.get(r.eventId).push(r)
  }
  return map
})

// eventId 없는 전체 결과
const globalResults = computed(() =>
  (results.value ?? []).filter(r => r.eventId == null)
)

// JSON-LD
useHead(computed(() => {
  const t = tournament.value
  if (!t) return {}
  return {
    script: [{
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name:        t.titleFull || t.titleShort,
        description: t.description || t.descriptionKo || undefined,
        startDate:   String(t.startDate).slice(0, 10),
        endDate:     String(t.endDate).slice(0, 10),
        eventStatus: t.status === 'CANCELLED'
          ? 'https://schema.org/EventCancelled'
          : t.status === 'FINISHED'
            ? 'https://schema.org/EventScheduled'
            : 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type':  'Place',
          name:      t.venueName || t.city,
          address:   t.venueAddress || t.city
        },
        organizer: t.brand ? {
          '@type': 'Organization',
          name:     t.brand.name
        } : undefined,
        image: t.posterImageUrl || undefined
      })
    }]
  }
}))

const openedEvent = ref(null)
function toggleEvent(id) {
  openedEvent.value     = openedEvent.value === id ? null : id
  openedStructure.value = null
}

const openedStructure = ref(null)
function toggleStructure(id) {
  openedStructure.value = openedStructure.value === id ? null : id
}

// ?event=ID 쿼리로 진입 시 해당 이벤트 자동 오픈 + 스크롤
onMounted(() => {
  const eventIdFromQuery = Number(route.query.event)
  if (!eventIdFromQuery) return
  openedEvent.value = eventIdFromQuery
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(`event-row-${eventIdFromQuery}`)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    })
  })
})

function fmtDate(d) {
  if (!d) return ''
  const date = new Date(String(d).slice(0, 10) + 'T00:00:00')
  const m = date.getMonth() + 1
  const day = date.getDate()
  const dow = ui.value.days[date.getDay()]
  return `${m}/${day}(${dow})`
}

function fmtYen(n) {
  if (!n) return ''
  return '¥' + Number(n).toLocaleString()
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function countryName(code) {
  const map = { JP: 'Japan', KR: 'Korea', TW: 'Taiwan', US: 'USA' }
  return map[code] ?? code
}

const statusLabel = computed(() => {
  const s = tournament.value?.status
  if (s === 'UPCOMING')  return 'Upcoming'
  if (s === 'ONGOING')   return 'Live'
  if (s === 'FINISHED')  return 'Finished'
  if (s === 'CANCELLED') return 'Cancelled'
  return ''
})

const statusBadge = computed(() => {
  const s = tournament.value?.status
  if (s === 'UPCOMING')  return 'badge-upcoming'
  if (s === 'ONGOING')   return 'badge-ongoing'
  if (s === 'FINISHED')  return 'badge-finished'
  if (s === 'CANCELLED') return 'badge-cancelled'
  return ''
})
</script>
