<template>
  <div class="flex p-3">
    <img
      class="ring-2 rounded-full h-14 w-14 flex-shrink-0"
      referrerPolicy="no-referrer"
      :src="props.pic"
      alt="no pic"
    />
  </div>
  <div class="flex-grow text-left pl-3 font-sans text-xl font-extrabold">
    {{ props.displayName }}
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ pic: string; displayName: string }>();
</script>
