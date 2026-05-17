<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// 로그인 상태면 앱 최초 로드 시 즐겨찾기 목록 미리 로드 → 각 카드 깜빡임 방지
const { loggedIn } = useUserSession()
const { ensureLoaded } = useFavorites()

if (import.meta.client && loggedIn.value) {
  ensureLoaded()
}

// 다크모드 초기화 (localStorage/시스템 설정 반영)
const { init } = useColorMode()
onMounted(init)
</script>
