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
const {
    allCharacters,
    isLoading,
    error,
    selectedServer, // Get the readonly selected server state
    setServer       // Get the function to change server
} = useCharacterData();

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

const isChangingServer = ref(false); // Flag to indicate if the server is being changed
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

async function changeServer(serverAbbr) {
    if (selectedServer.value === serverAbbr || isChangingServer.value) {
        return; // Don't do anything if already selected or already changing
    }
    console.log(`Requesting server change to ${serverAbbr}`);
    isChangingServer.value = true;
    const success = await setServer(serverAbbr);
    if (success) {
        // Important: Reset the game state AFTER triggering the data load
        startNewGame();
        console.log("Game reset for new server.");
    } else {
        // Handle failure (e.g., show error message)
        console.error("Failed to set server.");
    }
    isChangingServer.value = false;
}

</script>

<template>
  <div>
    <img src="/images/logo/title.png" alt="Logo" class="title-logo" />
    
    <div class="server-selection">
      <span>选择服务器:</span>
      <button
        @click="changeServer('jp')"
        :disabled="selectedServer === 'jp' || isChangingServer"
        :class="{ active: selectedServer === 'jp' }"
      >
        日服
      </button>
      <button
        @click="changeServer('gl')"
        :disabled="selectedServer === 'gl' || isChangingServer"
        :class="{ active: selectedServer === 'gl' }"
      >
        国际服
      </button>
      <button
        @click="changeServer('cn')"
        :disabled="selectedServer === 'cn' || isChangingServer"
        :class="{ active: selectedServer === 'cn' }"
      >
        国服
      </button>
      <span v-if="isChangingServer || (isLoading && allCharacters.length === 0)" class="loading-indicator">
          (加载中...)
      </span>
    </div>

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

        <div v-if="isLoading && allCharacters.length === 0">
            正在加载角色数据...
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
  <footer class="simple-footer">
  <p>© 2025 masterCheDan. Licensed under the MIT License.</p>
  <p>
    请到
    <a href="https://github.com/masterCheDan/buruaka_wordle/issues" target="_blank" rel="noopener noreferrer">
      这里
    </a>
    反馈你遇到的 bug、提出你的建议或是告诉我们你想要的功能。
  </p>
</footer>
</template>

<style scoped> /* Add styles for server selection */
.server-selection {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}
.server-selection span {
    font-weight: bold;
    margin-right: 5px;
}
.server-selection button {
    padding: 5px 10px;
    font-size: 0.9em;
    background-color: #6c757d; /* Default inactive color */
}
.server-selection button.active {
    background-color: #007bff; /* Active color */
    font-weight: bold;
}
.server-selection button:disabled:not(.active) {
    background-color: #adb5bd; /* Disabled, non-active */
    cursor: not-allowed;
}
 .loading-indicator {
     font-style: italic;
     color: #6c757d;
 }
</style>