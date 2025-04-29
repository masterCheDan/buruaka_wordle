<script setup>
import { ref,watch } from 'vue';

const props = defineProps({
  total: { type: Number, required: true },
  won: { type: Number, required: true },
  // Use different names to avoid confusion with internal refs if needed
  currentMaxGuesses: { type: Number, required: true },
  maxGuessesModel: { type: [Number, String], required: true } // v-model for the input
});

const emit = defineEmits(['new-game', 'update:maxGuessesModel', 'apply-max-guesses']);

// Local ref for input to handle v-model update emission
const localMaxGuessesInput = ref(props.maxGuessesModel);
watch(() => props.maxGuessesModel, (newVal) => {
    localMaxGuessesInput.value = newVal; // Sync from parent
});
function updateModel(event) {
    emit('update:maxGuessesModel', event.target.value);
}

function applySetting() {
    // Tell the parent to apply the value from the model
    emit('apply-max-guesses', localMaxGuessesInput.value);
}
</script>

<template>
  <div class="score-counter">
    <div class="scores">
      <span>轮数：{{ total }}</span>
      <span>胜利：{{ won }}</span>
      <span>当前每轮最高可猜测次数：{{ currentMaxGuesses }}</span>
    </div>
    <div class="settings">
      <label for="max-guesses-input">设置最大猜测数 (1-20):</label>
      <input
        id="max-guesses-input"
        type="number"
        :value="localMaxGuessesInput"
        @input="updateModel"
        min="1"
        max="20"
        class="max-guesses-input"
      />
      <button @click="applySetting" class="apply-button">应用</button>
      <button @click="emit('new-game')">新游戏</button>
    </div>
  </div>
</template>