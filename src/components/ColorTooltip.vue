<template>
  <div class="absolute bottom-0 left-0 right-0 top-0 m-auto h-[90px] w-[120px]">
    <div
      class="relative z-50 flex h-10 w-[120px] flex-col items-center justify-center rounded-lg px-2 py-1 text-center text-sm text-white"
      :style="`background-color: ${props.hexColor}`"
    >
      <div class="text-xs">
        <p>{{ props.hexColor }}</p>
        <p class="text-[10px]"><slot /></p>
      </div>

      <div
        class="absolute -bottom-[10px] h-1 w-1 border-l-[12px] border-r-[12px] border-t-[12px] border-solid border-l-transparent border-r-transparent"
        :style="`border-top-color: ${props.hexColor}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "ColorTooltip",
});

const props = defineProps({
  hexColor: {
    type: String,
    required: true,
  },
});
</script>
