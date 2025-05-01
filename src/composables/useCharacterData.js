import { readonly, ref, computed } from 'vue';

// State should be outside the function to be shared across components
const allCharacters = ref([]);
const isLoading = ref(false);
const error = ref(null);
const SERVER_STORAGE_KEY = 'baGuessr_selectedServer';
const DEFAULT_SERVER = 'jp'; // Default server

const serverIndexMap = {
    jp: 0,
    gl: 1,
    cn: 2
};

// Add state for the selected server
const selectedServer = ref(localStorage.getItem(SERVER_STORAGE_KEY) || DEFAULT_SERVER);

export function getFullName(char) {
    const specialNames
        = [
            '初音未来',
            '佐天泪子',
            '御坂美琴',
            '食蜂操祈'
        ];
    // Concatenate full name
    return specialNames.includes(char.Name) ? char.Name : `${char.FamilyName}${char.Name}`;
}

export function useCharacterData() {
    // Function to set server and trigger reload
    async function setServer(serverAbbr) {
        if (!['jp', 'gl', 'cn'].includes(serverAbbr)) {
            console.error("Invalid server selected:", serverAbbr);
            return false; // Indicate failure
        }
        if (selectedServer.value === serverAbbr && allCharacters.value.length > 0) {
            return true; // Already loaded this server's data
        }

        console.log(`Setting server to: ${serverAbbr}`);
        selectedServer.value = serverAbbr;
        localStorage.setItem(SERVER_STORAGE_KEY, serverAbbr);
        // Clear existing data to force reload effect
        allCharacters.value = [];
        // Trigger loading for the new server
        await loadCharacters(); // loadCharacters now implicitly uses selectedServer
        return true; // Indicate success
    }

    async function loadCharacters() {
        if (allCharacters.value.length > 0 || isLoading.value) {
            return; // Prevent multiple loads
        }
        error.value = null; // Clear previous error
        // Construct file path based on selected server
        const dataPath = `data/students.json`;
        console.log(`Loading data from: ${dataPath}`);

        isLoading.value = true;
        try {
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${dataPath}`);
            }
            // Ensure previous data is cleared before assigning new data
            const rawData = await response.json();

            // --- Data Transformation (If original JSON is Object, not Array) ---
            // Check if rawData is an object (like {"10001": {...}, "10002": {...}})
            // If so, convert it to an array. Assumes internal ID is not needed as 'id' property later.
            // If your JSON is already an array, you can skip this transformation.
            if (typeof rawData === 'object' && !Array.isArray(rawData) && rawData !== null) {
                allCharacters.value = Object.entries(rawData).map(([id, charData]) => ({
                    id: parseInt(id), // Convert string key to number ID
                    ...charData // Spread the rest of the character data
                }));
            } else if (Array.isArray(rawData)) {
                allCharacters.value = rawData; // Assume it's already the correct array format
            } else {
                throw new Error("Loaded data is not in a recognized format (Array or Object of characters).");
            }
            // --- End Transformation ---

            console.log(`Master character list loaded:`, allCharacters.value.length);

            // Validate data structure (optional but recommended)
            if (allCharacters.value.length > 0) {
                const firstChar = allCharacters.value[0];
                if (!firstChar.IsReleased || !Array.isArray(firstChar.IsReleased) || firstChar.IsReleased.length !== 3) {
                    console.error("Character data validation failed: 'IsReleased' field is missing or invalid.", firstChar);
                    throw new Error("Invalid character data structure: 'IsReleased' field incorrect.");
                }
                if (!firstChar.FamilyName || !firstChar.PersonalName) {
                    console.warn("Character data warning: Missing FamilyName or PersonalName on first character. Ensure these exist for search.", firstChar);
                }
            }
        } catch (e) {
            console.error("Failed to load or process character data:", e);
            error.value = `未能加载或处理角色数据 (${dataPath})。请检查文件格式或稍后再试。`;
            allCharacters.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    function setServer(serverAbbr) {
        if (!serverIndexMap.hasOwnProperty(serverAbbr)) {
            console.error("Invalid server selected:", serverAbbr);
            return; // Don't update if invalid
        }
        if (selectedServer.value !== serverAbbr) {
            console.log(`Setting server filter to: ${serverAbbr}`);
            selectedServer.value = serverAbbr;
            localStorage.setItem(SERVER_STORAGE_KEY, serverAbbr);
            // No data reload needed here, computed property will update
        }
    }

    const availableCharacters = computed(() => {
        if (isLoading.value || !allCharacters.value.length) {
            return []; // Return empty while loading or if error
        }
        const serverIndex = serverIndexMap[selectedServer.value];
        if (serverIndex === undefined) {
            console.error("Invalid server index for filtering");
            return []; // Should not happen if setServer validates
        }

        const filtered = allCharacters.value.filter(char =>
            char.IsReleased && // Check if IsReleased exists
            Array.isArray(char.IsReleased) && // Check if it's an array
            char.IsReleased.length > serverIndex && // Check if index is valid
            char.IsReleased[serverIndex] === true // Check the boolean value at the index
        );
        console.log(`Filtered characters for server ${selectedServer.value}: ${filtered.length}`);
        return filtered;
    });

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
        // allCharacters,
        isLoading,
        error,
        selectedServer: readonly(selectedServer), // Expose as readonly
        setServer,// Expose function to set server
        availableCharacters, // Expose if manual reload is needed
        getCharacterById
    };
}