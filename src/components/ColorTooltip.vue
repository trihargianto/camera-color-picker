<template>
  <div class="absolute m-auto w-[120px] h-[90px] top-0 bottom-0 left-0 right-0">
    <div
      class="relative z-50 px-2 py-1 text-center text-white rounded-lg text-sm w-[120px] h-10 flex justify-center items-center flex-col"
      :style="`background-color: ${props.hexColor}`"
    >
      <div class="text-xs">
        <p>{{ props.hexColor }}</p>
        <p class="text-[10px]"><slot /></p>
      </div>

      <div
        class="absolute -bottom-[10px] w-1 h-1 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-solid"
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
