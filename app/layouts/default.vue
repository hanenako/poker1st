<template>
  <div>
    <Header />
    <main class="pb-16 sm:pb-0">
      <slot />
    </main>
    <BottomNav />
    <CompareBar />
  </div>
</template>

<script setup>
const { initCompare } = usePubCompare()
onMounted(initCompare)
</script>
