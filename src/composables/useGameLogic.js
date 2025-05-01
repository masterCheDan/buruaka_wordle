import { ref, computed, watch } from 'vue';
import { useCharacterData } from './useCharacterData';

// --- Constants ---
const DEFAULT_MAX_GUESSES = 8;
const HINT_TURN_PERCENTAGE = 0.5; // Show hint after 50% of guesses
const SCORE_STORAGE_KEY_TOTAL = 'baGuessr_totalGames';
const SCORE_STORAGE_KEY_WON = 'baGuessr_gamesWon';
const MAX_GUESSES_STORAGE_KEY = 'baGuessr_maxGuesses';
const HINTS_ENABLED_STORAGE_KEY = 'baGuessr_hintsEnabled'; // Key for hint setting

// --- Fields Configuration ---
const fieldsToCompare = [
    { name: 'School', type: 'exact', label: '学校' },
    { name: 'StarGrade', type: 'numeric', threshold: 1, label: '初始星级' },
    { name: 'CharacterAge', type: 'numeric', threshold: 1, label: '年龄' },
    { name: 'TacticRole', type: 'exact', label: '定位' },
    { name: 'WeaponType', type: 'exact', label: '武器类型' },
    { name: 'BulletType', type: 'exact', label: '攻击属性' },
    { name: 'ArmorType', type: 'exact', label: '防御属性' },
    { name: 'CharHeightMetric', type: 'numeric', threshold: 5, label: '身高' },
    // Add more fields as needed from your JSON
];

const hintFields = ['Birthday', 'Hobby', 'CharacterVoice', 'Illustrator'];
const fieldNameMap = {
    'School': '学校', 'StarGrade': '初始星级', 'TacticRole': '定位',
    'BulletType': '攻击属性', 'ArmorType': '防御属性', 'CharacterAge': '年龄',
    'CharHeightMetric': '身高', 'Birthday': '生日', 'Hobby': '爱好', 'CharacterVoice': '声优',
    'Illustrator': '画师'
    // Add other field names...
};

export function useGameLogic() {
    const { availableCharacters, isLoading: dataIsLoading, error: dataError } = useCharacterData();

    // --- Core State ---
    const targetCharacter = ref(null);
    const guesses = ref([]); // Stores { guess: Character, feedback: FeedbackObject }
    const gameStatus = ref('loading'); // 'loading', 'playing', 'won', 'lost'
    const hint = ref(null);
    const maxGuesses = ref(DEFAULT_MAX_GUESSES); // Now a ref
    const customMaxGuessesInput = ref(maxGuesses.value); // Separate ref for the input field
    const hintsEnabled = ref(true); // New state for hint toggle, default true


    // --- Score State ---
    const totalGames = ref(0);
    const gamesWon = ref(0);

    // --- Computed Properties ---
    const remainingGuesses = computed(() => Math.max(0, maxGuesses.value - guesses.value.length)); // Ensure non-negative
    const isGameOver = computed(() => gameStatus.value === 'won' || gameStatus.value === 'lost');
    const comparisonHeaders = computed(() => fieldsToCompare.map(f => ({ key: f.name, label: f.label })));
    const hintTriggerTurn = computed(() => Math.ceil(maxGuesses.value * HINT_TURN_PERCENTAGE));

    // --- Methods ---

    function loadSettings() {
        totalGames.value = parseInt(localStorage.getItem(SCORE_STORAGE_KEY_TOTAL) || '0');
        gamesWon.value = parseInt(localStorage.getItem(SCORE_STORAGE_KEY_WON) || '0');
        const savedMax = localStorage.getItem(MAX_GUESSES_STORAGE_KEY);
        let initialMax = DEFAULT_MAX_GUESSES;
        if (savedMax) {
            const parsedMax = parseInt(savedMax);
            // Validate loaded value
            if (!isNaN(parsedMax) && parsedMax > 0 && parsedMax <= 20) {
                initialMax = parsedMax;
            } else {
                console.warn(`Invalid maxGuesses value found in localStorage (${savedMax}), using default.`);
                localStorage.removeItem(MAX_GUESSES_STORAGE_KEY); // Remove invalid value
            }
        }
        maxGuesses.value = initialMax;
        customMaxGuessesInput.value = initialMax; // Sync input ref
        const savedHintsEnabled = localStorage.getItem(HINTS_ENABLED_STORAGE_KEY);
        hintsEnabled.value = savedHintsEnabled !== null ? JSON.parse(savedHintsEnabled) : true;
        // --- DEBUG LOG ---
        console.log('[useGameLogic] loadSettings: maxGuesses=', maxGuesses.value, 'hintsEnabled=', hintsEnabled.value);
    }

    function setMaxGuesses(newValue) {
        const numVal = parseInt(newValue);
        // Validate the input (e.g., between 1 and 20)
        if (!isNaN(numVal) && numVal > 0 && numVal <= 20) {
            maxGuesses.value = numVal;
            customMaxGuessesInput.value = numVal; // Keep input synced
            localStorage.setItem(MAX_GUESSES_STORAGE_KEY, maxGuesses.value.toString());
            // Re-check lose condition immediately if game is in progress
            if (gameStatus.value === 'playing' && guesses.value.length >= maxGuesses.value) {
                gameStatus.value = 'lost';
            }
            // Re-calculate hint trigger turn? The computed property handles this automatically.
        } else {
            // Optionally provide feedback to user about invalid input
            // Reset input visually if invalid?
            customMaxGuessesInput.value = maxGuesses.value; // Revert input display
            console.warn("Invalid max guesses value:", newValue);
        }
    }

    // New function to toggle hints
    function toggleHints() {
        hintsEnabled.value = !hintsEnabled.value; // Flip the boolean
        localStorage.setItem(HINTS_ENABLED_STORAGE_KEY, JSON.stringify(hintsEnabled.value));
        console.log('[useGameLogic] toggleHints: hintsEnabled set to', hintsEnabled.value);
        // If hints are disabled, clear any existing hint for the current game
        if (!hintsEnabled.value) {
            hint.value = null;
        }
    }

    function incrementTotalGames() {
        totalGames.value++;
        localStorage.setItem(SCORE_STORAGE_KEY_TOTAL, totalGames.value.toString());
    }

    function incrementGamesWon() {
        gamesWon.value++;
        localStorage.setItem(SCORE_STORAGE_KEY_WON, gamesWon.value.toString());
    }

    function selectTargetCharacter() {
        // Ensure availableCharacters is populated and not empty
        if (availableCharacters.value && availableCharacters.value.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCharacters.value.length);
            targetCharacter.value = availableCharacters.value[randomIndex];
            console.log("[useGameLogic] Target selected:", targetCharacter.value?.Name, `(from ${availableCharacters.value.length} available)`);
        } else {
            console.error("[useGameLogic] Cannot select target character, available character list is empty or not ready.");
            targetCharacter.value = null;
            // Potentially set gameStatus to error or waiting state if data is expected but missing
            if (!dataIsLoading.value) { // If not loading but still no characters
                gameStatus.value = 'error_no_chars'; // A specific error state
            }
        }
    }

    function compareAttributes(guessedChar, targetChar) {
        const feedback = {};
        if (!targetChar) return feedback; // Safety check

        fieldsToCompare.forEach(fieldInfo => {
            const field = fieldInfo.name;
            const guessValue = guessedChar[field];
            const targetValue = targetChar[field];
            const fieldType = fieldInfo.type;
            const threshold = fieldInfo.threshold;

            // Basic check for undefined values - treat as incorrect if one is undefined
            if (guessValue === undefined || targetValue === undefined || guessValue === null || targetValue === null) {
                feedback[field] = 'incorrect';
                return;
            }
            if (guessValue === targetValue) {
                feedback[field] = 'correct';
            } else {
                if (fieldType === 'numeric') {
                    if (Math.abs(String(guessValue).match(/\d+/) - String(targetValue).match(/\d+/)) <= threshold) {
                        feedback[field] = 'close';
                    } else {
                        feedback[field] = 'incorrect';
                    }
                } else {
                    // Add handling for array comparison if needed (e.g., combatEnvironment)
                    // For now, non-exact non-numeric is incorrect
                    feedback[field] = 'incorrect';
                }
            }
        });
        feedback.isCorrectCharacter = (guessedChar.Id === targetChar.Id);
        return feedback;
    }

    function checkAndShowHint() {
        // Check if hints are enabled and if the game is in the right state to show a hint
        if (!hintsEnabled.value) {
            // console.log('[useGameLogic] Hints are disabled, skipping check.');
            return; // Do nothing if hints are disabled
        }
        if (guesses.value.length === hintTriggerTurn.value && gameStatus.value === 'playing' && !hint.value) {
            if (!targetCharacter.value) return;

            const comparedFields = fieldsToCompare.map(f => f.name);
            const availableHints = hintFields.filter(f =>
                targetCharacter.value[f] !== undefined &&
                targetCharacter.value[f] !== null &&
                targetCharacter.value[f] !== '' &&
                !comparedFields.includes(f) // Ensure it's not a field already compared in the table
            );

            if (availableHints.length > 0) {
                const randomHintField = availableHints[Math.floor(Math.random() * availableHints.length)];
                const hintValue = targetCharacter.value[randomHintField];
                const displayFieldName = fieldNameMap[randomHintField] || randomHintField;
                hint.value = `提示：这位学生的 ${displayFieldName} 是 ${hintValue}`;
            }
        }
    }

    function submitGuess(guessedCharacter) {
        if (isGameOver.value || !targetCharacter.value) return;
        if (guesses.value.some(item => item.guess.Id === guessedCharacter.Id)) {
            return; // Prevent duplicate guesses
        }
        const feedback = compareAttributes(guessedCharacter, targetCharacter.value);
        guesses.value.unshift({ guess: guessedCharacter, feedback: feedback });

        if (guessedCharacter.Id === targetCharacter.value.Id) {
            gameStatus.value = 'won';
            incrementGamesWon();
            return;
        }

        if (guesses.value.length >= maxGuesses.value) {
            gameStatus.value = 'lost';
            return;
        }

        checkAndShowHint();
    }

    function resetGame() {
        guesses.value = [];
        hint.value = null;
        selectTargetCharacter(); // Select new target from current available list
        // Set game status based on whether a target could be selected
        if (targetCharacter.value) {
            gameStatus.value = 'playing';
        } else if (dataIsLoading.value) {
            gameStatus.value = 'loading'; // Still loading data
        } else {
            // If no target could be selected and not loading, something is wrong
            gameStatus.value = 'error_no_chars';
        }
    }

    function startNewGame() {
        if (gameStatus.value !== 'loading' && gameStatus.value !== 'error' && gameStatus.value !== 'error_no_chars') {
            incrementTotalGames();
        }
        resetGame();
    }

    // --- Initialization and Watchers ---

    loadSettings();

    // Watch for the initial load/error state from useCharacterData
    watch([dataIsLoading, dataError], ([loading, err]) => {
        if (!loading && !err && gameStatus.value === 'loading') {
            // Data loaded successfully, start the first game
            console.log("[useGameLogic] Data loaded, starting initial game.");
            startNewGame();
        } else if (err) {
            gameStatus.value = 'error'; // Reflect data loading error
        }
    }, { immediate: true });

    // Watch for changes in the *available* character list AFTER the initial load.
    // This indicates a server switch occurred.
    let initialLoadComplete = false;
    watch(availableCharacters, (newChars, oldChars) => {
        if (dataIsLoading.value) return; // Ignore changes during load

        if (!initialLoadComplete && newChars.length > 0) {
            initialLoadComplete = true;
            console.log("[useGameLogic] Initial character list processed.");
            return; // Don't reset on the very first population
        }

        // If list changes *after* initial load, it implies a server switch filter update.
        // Check if the list content actually changed significantly (more robust than just length)
        // For simplicity, we reset if the list reference changes and it's not the initial load.
        if (initialLoadComplete && newChars !== oldChars) {
            console.log("[useGameLogic] Available characters changed (server switch?), resetting game.");
            startNewGame();
        }
    }, { deep: false }); // deep: false might be enough if the array reference changes


    return {
        // State
        targetCharacter,
        guesses,
        gameStatus,
        maxGuesses,
        customMaxGuessesInput, // For input binding
        hintsEnabled,  // Expose the state

        hint,          // Expose hint for display
        totalGames,
        gamesWon,
        comparisonHeaders, // Pass headers to table component

        // Computed
        remainingGuesses,
        isGameOver,

        // Methods
        submitGuess,
        startNewGame,
        setMaxGuesses,
        toggleHints   // Expose the toggle function
    };
}