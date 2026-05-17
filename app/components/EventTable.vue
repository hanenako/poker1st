<template>
  <div class="surface-card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-zinc-50 text-zinc-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left font-medium px-4 py-3">Date</th>
            <th class="text-left font-medium px-4 py-3">Event</th>
            <th class="text-left font-medium px-4 py-3">Buy-in</th>
            <th class="text-left font-medium px-4 py-3">GTD</th>
            <th class="text-left font-medium px-4 py-3">Game</th>
            <th class="text-left font-medium px-4 py-3">Format</th>
            <th class="text-left font-medium px-4 py-3">Stack</th>
            <th class="text-left font-medium px-4 py-3">Re-entry</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr
            v-for="event in events"
            :key="event.id"
            class="hover:bg-zinc-50"
          >
            <td class="px-4 py-3 text-zinc-600">{{ event.date }}</td>
            <td class="px-4 py-3 font-medium text-zinc-900">{{ event.name }}</td>
            <td class="px-4 py-3">{{ event.buy_in }}</td>
            <td class="px-4 py-3">{{ event.gtd }}</td>
            <td class="px-4 py-3">{{ event.game_type }}</td>
            <td class="px-4 py-3">{{ event.format_type }}</td>
            <td class="px-4 py-3">{{ event.starting_stack }}</td>
            <td class="px-4 py-3 text-zinc-600">{{ event.re_entry }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  events: Array
})
</script>
