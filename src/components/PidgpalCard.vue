<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  friend: string;
  pic: string;
  elapsedTimePercentage: number;
  isIncoming: boolean;
}>();
const emits = defineEmits<{ (e: "goToSpotlight"): void }>();

const transparentBlocks = ref("");
const borderColor = ref("");
const ringColor = ref("");
const ringWidth = ref("");
const colours = {
  home: "border-green-500",
  ringHome: "ring-green-200",
  away: "border-orange-500",
  ringAway: "ring-orange-200",
  notStarted: "border-gray-200",
};

determineColourAndProgress();
function determineColourAndProgress() {
  if (props.isIncoming) {
    borderColor.value = colours.home;
    ringColor.value = colours.ringHome;
  } else {
    borderColor.value = colours.away;
    ringColor.value = colours.ringAway;
  }
  if (props.elapsedTimePercentage <= 0) {
    borderColor.value = colours.notStarted;
  } else if (props.elapsedTimePercentage > 0 && props.elapsedTimePercentage < 33.4) {
    transparentBlocks.value =
      "border-r-transparent border-b-transparent border-l-transparent";
  } else if (props.elapsedTimePercentage > 33.4 && props.elapsedTimePercentage < 66.7) {
    transparentBlocks.value = "border-b-transparent border-l-transparent";
  } else if (props.elapsedTimePercentage > 66.7 && props.elapsedTimePercentage < 100) {
    transparentBlocks.value = "border-l-transparent";
  } else if (props.elapsedTimePercentage > 100) {
    ringWidth.value = "ring-2 drop-shadow-lg";
  }
}

watch(
  () => [props.elapsedTimePercentage, props.isIncoming],
  () => {
    determineColourAndProgress();
  }
);
</script>
<template>
  <div class="flex flex-col items-center overflow-x-clip" @click="emits('goToSpotlight')">
    <div>
      <div
        class="absolute h-20 w-20 lg:w-32 lg:h-32 rounded-2xl border-solid border-4"
        :class="[borderColor, transparentBlocks, ringColor, ringWidth]"
      />
      <img
        class="ml-2 mt-2 absolute h-16 w-16 lg:w-32 lg:h-32 rounded-lg"
        referrerPolicy="no-referrer"
        :src="props.pic"
        alt="no pic"
      />
      <div
        class="h-20 w-20 lg:w-32 lg:h-32 rounded-2xl border-4 border-dashed"
        :class="borderColor"
      ></div>
    </div>
    <p class="text-xs lg:text-lg text-gray-600 font-extrabold z-50 pt-1">
      {{ props.friend }}
    </p>
  </div>
</template>
