import { readonly, ref } from 'vue';

// State should be outside the function to be shared across components
const allCharacters = ref([]);
const isLoading = ref(false);
const error = ref(null);
const SERVER_STORAGE_KEY = 'baGuessr_selectedServer';
const DEFAULT_SERVER = 'jp'; // Default server

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
        // Construct file path based on selected server
        const dataPath = `data/students_${selectedServer.value}.json`;
        console.log(`Loading data from: ${dataPath}`);

        isLoading.value = true;
        error.value = null;
        try {
            const response = await fetch(dataPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${dataPath}`);
            }
            // Ensure previous data is cleared before assigning new data
            const temp = await response.json();
            allCharacters.value = Object.values(temp);
            console.log(`Characters loaded for server ${selectedServer.value}:`, allCharacters.value.length);
        } catch (e) {
            console.error("Failed to load character data:", e);
            error.value = `未能加载 <span class="math-inline">\{selectedServer\.value\.toUpperCase\(\)\} 服务器数据 \(</span>{dataPath})。请检查文件是否存在或稍后再试。`;
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
        selectedServer: readonly(selectedServer), // Expose as readonly
        setServer,// Expose function to set server
        loadCharacters, // Expose if manual reload is needed
        getCharacterById
    };
}