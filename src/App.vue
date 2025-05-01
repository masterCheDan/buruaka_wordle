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
    isLoading: dataIsLoading, // Rename to avoid clash if needed
    error: dataError,
    selectedServer,
    setServer,
    availableCharacters // Use the filtered list
} = useCharacterData();

const {
    gameStatus,
    startNewGame, // Need this
    isGameOver,
    guesses,
    comparisonHeaders,
    hintsEnabled,
    hint,
    targetCharacter, // For modal
    // Score/Settings refs & methods
    totalGames,
    gamesWon,
    maxGuesses,
    customMaxGuessesInput,
    setMaxGuesses,
    toggleHints,
    submitGuess // Need submitGuess here if called directly
} = useGameLogic();

const isModalOpen = ref(false);

// Function called by UI buttons
function changeServer(serverAbbr) {
    if (selectedServer.value === serverAbbr) return;

    // Update the server filter state
    setServer(serverAbbr);
    // Immediately reset the game logic for the new filter
    startNewGame();
}

watch(gameStatus, (newStatus) => {
    if (newStatus === 'won' || newStatus === 'lost') {
        isModalOpen.value = true;
    }
    // Handle new error state
    if (newStatus === 'error_no_chars') {
         console.error("Game entered error state: No available characters for target selection.");
         // Optionally show a user-friendly message instead of the main game UI
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
    
    <div class="server-selection">
       <span>选择服务器:</span>
       <button @click="changeServer('jp')" :disabled="selectedServer === 'jp'" :class="{ active: selectedServer === 'jp' }">日服</button>
       <button @click="changeServer('gl')" :disabled="selectedServer === 'gl'" :class="{ active: selectedServer === 'gl' }">国际服</button>
       <button @click="changeServer('cn')" :disabled="selectedServer === 'cn'" :class="{ active: selectedServer === 'cn' }">国服</button>
       <span v-if="dataIsLoading" class="loading-indicator">(加载中...)</span>
     </div>

     <div v-if="dataError" class="result-area failure">
        {{ dataError }}
    </div>
     <div v-else-if="gameStatus === 'error_no_chars'" class="result-area failure">
         当前选择的服务器似乎没有可用的角色数据来开始游戏。
     </div>

    <div v-else>
        <ScoreCounter
            v-if="gameStatus !== 'loading'"
            :total="totalGames" 
            :won="gamesWon" 
            :current-max-guesses="maxGuesses"
            :max-guesses-model="customMaxGuessesInput"
            :hints-enabled="hintsEnabled"
            @update:maxGuessesModel="customMaxGuessesInput = $event"
            @apply-max-guesses="setMaxGuesses"
            @toggle-hints="toggleHints"
            @new-game="startNewGame"
        />

        <div v-if="dataIsLoading && availableCharacters.length === 0">
            正在加载学生数据...
        </div>

        <div v-if="gameStatus === 'playing' || isGameOver">
             <SearchInput
                v-if="!isGameOver"
                :characters="availableCharacters" :disabled="isGameOver"
                @guess="handleGuess"
             />
             <div class="guess-history-wrapper">
                 <GuessHistoryTable :guesses="guesses" :headers="comparisonHeaders" />
             </div>
             <HintArea :hint="hint" />
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