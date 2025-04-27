import { ref } from 'vue';

// State should be outside the function to be shared across components
const allCharacters = ref([]);
const isLoading = ref(false);
const error = ref(null);

export function useCharacterData() {

    async function loadCharacters() {
        // Prevent reloading if already loaded or loading
        if (allCharacters.value.length > 0 || isLoading.value) {
            return;
        }

        isLoading.value = true;
        error.value = null;
        try {
            // Assuming characters.json is in /public/data/
            const response = await fetch('data/students.json');
            console.log('Fetching character data from:', response.url);
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allCharacters.value = Object.values(data); // Convert object to array
            console.log('Characters loaded:', allCharacters.value);
        } catch (e) {
            console.error("Failed to load character data:", e);
            error.value = 'Failed to load character data. Please try again later.';
            allCharacters.value = []; // Clear any partial data
        } finally {
            isLoading.value = false;
        }
    }

    function getCharacterById(id) {
        return allCharacters.value.find(char => char.id === id);
    }

    // Load characters when the composable is first used
    // Note: This might trigger multiple loads if used in multiple places before
    // the first load completes. A more robust solution might use a promise
    // or ensure loadCharacters is only called once.
    // For simplicity here, we rely on the check inside loadCharacters.
    if (allCharacters.value.length === 0 && !isLoading.value) {
        loadCharacters();
    }


    return {
        allCharacters,
        isLoading,
        error,
        loadCharacters, // Expose if manual reload is needed
        getCharacterById
    };
}