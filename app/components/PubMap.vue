<template>
  <div class="relative">
    <div ref="mapEl" class="w-full rounded-xl overflow-hidden" style="height: 520px;" />
    <div v-if="!hasPins" class="absolute inset-0 flex items-center justify-center bg-zinc-50/80 rounded-xl">
      <p class="text-zinc-500 text-sm text-center px-6">
        좌표(lat/lng)가 등록된 포커룸이 없습니다.<br />
        <span class="text-xs text-zinc-400">관리자에서 위도·경도를 입력하면 지도에 표시됩니다.</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  pubs: { type: Array, default: () => [] }
})

const mapEl  = ref(null)
let map      = null
let markers  = []

const hasPins = computed(() =>
  props.pubs.some(p => p.lat && p.lng)
)

function clearMarkers() {
  markers.forEach(m => m.remove())
  markers = []
}

function addMarkers(L) {
  clearMarkers()
  const bounds = []
  for (const pub of props.pubs) {
    if (!pub.lat || !pub.lng) continue
    const lat = parseFloat(pub.lat)
    const lng = parseFloat(pub.lng)
    const marker = L.marker([lat, lng]).addTo(map)
    marker.bindPopup(`
      <div style="min-width:160px">
        <div style="font-weight:600;font-size:14px;margin-bottom:4px">${pub.name}</div>
        <div style="font-size:12px;color:#71717a;margin-bottom:8px">${pub.city}${pub.district ? ' · ' + pub.district : ''}</div>
        <a href="/pubs/${pub.slug}" style="font-size:12px;color:#4f46e5;text-decoration:underline">상세 보기 →</a>
      </div>
    `)
    markers.push(marker)
    bounds.push([lat, lng])
  }
  if (bounds.length === 1) {
    map.setView(bounds[0], 15)
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

onMounted(async () => {
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  // 기본 마커 아이콘 경로 수정 (Vite 번들링 이슈)
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })

  // 기본 중심: 도쿄
  map = L.map(mapEl.value).setView([35.6762, 139.6503], 12)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19
  }).addTo(map)

  addMarkers(L)

  watch(() => props.pubs, async () => {
    const LL = (await import('leaflet')).default
    addMarkers(LL)
  }, { deep: true })
})

onUnmounted(() => {
  clearMarkers()
  if (map) { map.remove(); map = null }
})
</script>
