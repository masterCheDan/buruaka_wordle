import { ref, computed, watch } from 'vue';
import { useCharacterData } from './useCharacterData';

// --- Constants ---
const DEFAULT_MAX_GUESSES = 8;
const HINT_TURN_PERCENTAGE = 0.5; // Show hint after 50% of guesses
const SCORE_STORAGE_KEY_TOTAL = 'baGuessr_totalGames';
const SCORE_STORAGE_KEY_WON = 'baGuessr_gamesWon';
const MAX_GUESSES_STORAGE_KEY = 'baGuessr_maxGuesses';

// --- Fields Configuration ---
const fieldsToCompare = [
    { name: 'School', type: 'exact', label: '学校' },
    { name: 'StarGrade', type: 'numeric', threshold: 1, label: '初始星级' },
    { name: 'CharacterAge', type: 'numeric', threshold: 1, label: '年龄' },
    { name: 'TacticRole', type: 'exact', label: '定位' },
    { name: 'WeaponType', type: 'exact', label: '武器类型' },
    { name: 'BulletType', type: 'exact', label: '攻击属性' },
    { name: 'ArmorType', type: 'exact', label: '防御属性' },
    { name: 'CharHeightMetric', type: 'numeric', threshold: 5, label: '身高(cm)' },
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
    const { allCharacters, isLoading: dataIsLoading } = useCharacterData();

    // --- Core State ---
    const targetCharacter = ref(null);
    const guesses = ref([]); // Stores { guess: Character, feedback: FeedbackObject }
    const gameStatus = ref('loading'); // 'loading', 'playing', 'won', 'lost'
    const hint = ref(null);
    const maxGuesses = ref(DEFAULT_MAX_GUESSES); // Now a ref
    const customMaxGuessesInput = ref(maxGuesses.value); // Separate ref for the input field


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
        maxGuesses.value = savedMax ? parseInt(savedMax) : DEFAULT_MAX_GUESSES;
        // Ensure value is reasonable
        if (isNaN(maxGuesses.value) || maxGuesses.value < 1 || maxGuesses.value > 20) {
            maxGuesses.value = DEFAULT_MAX_GUESSES;
        }
        customMaxGuessesInput.value = maxGuesses.value; // Sync input ref
    }

    function setMaxGuesses(newValue) {
        const numVal = parseInt(newValue);
        // Validate the input (e.g., between 1 and 20)
        if (!isNaN(numVal) && numVal > 0 && numVal <= 20) {
            maxGuesses.value = numVal;
            customMaxGuessesInput.value = numVal; // Keep input synced
            localStorage.setItem(MAX_GUESSES_STORAGE_KEY, maxGuesses.value.toString());
            console.log("Max guesses set to:", maxGuesses.value);
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

    function incrementTotalGames() {
        totalGames.value++;
        localStorage.setItem(SCORE_STORAGE_KEY_TOTAL, totalGames.value.toString());
    }

    function incrementGamesWon() {
        gamesWon.value++;
        localStorage.setItem(SCORE_STORAGE_KEY_WON, gamesWon.value.toString());
    }

    function selectTargetCharacter() {
        if (allCharacters.value.length > 0) {
            const randomIndex = Math.floor(Math.random() * allCharacters.value.length);
            targetCharacter.value = allCharacters.value[randomIndex];
            console.log("Target selected:", targetCharacter.value.Name); // Debugging
        } else {
            console.error("Cannot select target character, data not loaded.");
            gameStatus.value = 'error'; // Or handle appropriately
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

            if (field === 'fullName') {
                feedback[field] = targetChar.Id === guessedChar.Id ? 'correct' : 'incorrect';
            }

            if (guessValue === targetValue) {
                feedback[field] = 'correct';
            } else {
                if (fieldType === 'numeric') {
                    console.log('guessValue:', guessValue, 'targetValue:', targetValue); // Debugging
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
        return feedback;
    }

    function checkAndShowHint() {
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
        selectTargetCharacter(); // Select new target
        if (targetCharacter.value) {
            gameStatus.value = 'playing';
        } else {
            // Handle case where character selection failed (data not ready?)
            gameStatus.value = 'error';
        }
    }

    function startNewGame() {
        if (gameStatus.value !== 'loading' && gameStatus.value !== 'error') {
            incrementTotalGames(); // Increment total only when starting from a playable state
        }
        resetGame();
    }

    // --- Initialization and Watchers ---

    loadSettings();

    // Watch for data loading to finish before starting the first game
    watch(dataIsLoading, (loading) => {
        if (!loading && allCharacters.value.length > 0) {
            // Only start if not already started or finished
            if (gameStatus.value === 'loading') {
                startNewGame(); // Start the very first game
            }
        } else if (!loading && allCharacters.value.length === 0) {
            // Handle data loading error
            gameStatus.value = 'error';
        }
    });

    // Initial check in case data is already loaded (e.g., hot reload)
    if (!dataIsLoading.value && allCharacters.value.length > 0 && gameStatus.value === 'loading') {
        startNewGame();
    };

    return {
        // State
        targetCharacter,
        guesses,
        gameStatus,
        maxGuesses,
        customMaxGuessesInput, // For input binding
        hint,
        totalGames,
        gamesWon,
        comparisonHeaders, // Pass headers to table component

        // Computed
        remainingGuesses,
        isGameOver,

        // Methods
        submitGuess,
        startNewGame,
        setMaxGuesses
    };
}