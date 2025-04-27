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
      <span>当前最大猜测数：{{ currentMaxGuesses }}</span>
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

<style scoped>
.score-counter {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #e9ecef;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9em;
}
.scores span {
  margin-right: 15px;
}
.settings {
  display: flex;
  align-items: center;
  gap: 10px; /* Spacing between setting elements */
  margin-top: 5px; /* Add some space when wrapping */
}
.settings label {
    font-size: 0.9em;
    margin-right: 5px;
}
.max-guesses-input {
  width: 60px; /* Adjust width */
  padding: 4px 8px;
  font-size: 0.9em;
  /* Pull from global styles or define here */
  border: 1px solid #ccc;
  border-radius: 4px;
}
.apply-button {
    padding: 4px 8px;
    font-size: 0.9em;
}
/* Adjust button styles from global if needed */
</style>