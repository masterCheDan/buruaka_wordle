<script setup>
import { ref, watch, onMounted } from 'vue';
import { useCharacterData } from './composables/useCharacterData';
import { useGameLogic } from './composables/useGameLogic';

// Import Components
import ScoreCounter from './components/ScoreCounter.vue';
import SearchInput from './components/SearchInput.vue';
import GuessHistoryTable from './components/GuessHistoryTable.vue';
import HintArea from './components/HintArea.vue';
import ResultModal from './components/ResultModal.vue';
import { mapValue } from '@/utils/mappings.js';

// Setup Composables
const { allCharacters, isLoading, error } = useCharacterData();
const {
  guesses,
  gameStatus, // 'loading', 'playing', 'won', 'lost', 'error'
  hint,
  totalGames,
  gamesWon,
  isGameOver,
  submitGuess,
  startNewGame,
  targetCharacter, // Needed for final result display
  comparisonHeaders, // Get headers for the table
  maxGuesses,
  customMaxGuessesInput,
  setMaxGuesses
} = useGameLogic();

const isModalOpen = ref(false);

watch(maxGuesses,(newVal)=>{
  console.log('maxGuesses changed:', newVal);
})

watch (gameStatus, (newStatus) => {
  if (newStatus === 'won' || newStatus === 'lost') {
    isModalOpen.value = true; // Open modal when game ends
  }
});

function closeModal(){
  isModalOpen.value = false; // Close modal
}

function startNewGameAndCloseModal(){
  startNewGame();
  closeModal();
}

// Handle events from components
function handleGuess(character) {
  submitGuess(character);
}

</script>

<template>
  <div>
    <img src="/images/logo/title.png" alt="Logo" class="title-logo" />

    <div v-if="error" class="result-area failure">
      {{ error }}
    </div>

    <div v-if="!error">
      <div v-if="!error">
        <ScoreCounter
            :total="totalGames"
            :won="gamesWon"
            :currentMaxGuesses="maxGuesses"
            :maxGuessesModel="customMaxGuessesInput"
            @update:maxGuessesModel="customMaxGuessesInput = $event"
            @apply-max-guesses="setMaxGuesses" 
            @new-game="startNewGame"
        />
        </div>

      <div v-if="isLoading && gameStatus === 'loading'">
        正在加载...
      </div>

      <div v-if="gameStatus !== 'loading' && gameStatus !== 'error'">
        <ImagePreview :character="previewCharacter" :altText="isGameOver ? '答案角色' : '预览角色'" />

        <SearchInput v-if="!isGameOver" :characters="allCharacters" :disabled="isGameOver" @guess="handleGuess"
          @preview="handlePreview" />

        <GuessHistoryTable :guesses="guesses" :headers="comparisonHeaders" />

        <HintArea :hint="hint" />

        
      </div>
      <div v-if="gameStatus === 'error' && !isLoading" class="result-area failure">
        游戏初始化失败，请检查数据文件或刷新页面。
      </div>
    </div>

    <ResultModal
        :is-open="isModalOpen"
        :status="gameStatus"
        :target-character="targetCharacter"
        :comparison-headers="comparisonHeaders"
        @close="closeModal"
        @new-game="startNewGameAndCloseModal"
    />
  </div>
</template>