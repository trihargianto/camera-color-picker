<template>
  <div class="absolute m-auto w-[90px] h-[90px] top-0 bottom-0 left-0 right-0">
    <div
      class="relative z-50 px-2 py-1 text-center text-white rounded-lg text-sm w-[90px] h-8 flex justify-center items-center"
      :style="`background-color: ${props.hexColor}`"
    >
      <span>{{ props.hexColor }}</span>
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
