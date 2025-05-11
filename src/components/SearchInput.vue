<script setup>
import { ref, computed, watch } from 'vue';
import Fuse from 'fuse.js';
import { pinyin } from 'pinyin-pro'; // Import the pinyin library
const props = defineProps({
    characters: { type: Array, required: true },
    disabled: { type: Boolean, default: false }
});

const emit = defineEmits(['guess', 'preview']);

const searchTerm = ref('');
const searchResults = ref([]); // Will store original character objects
const showDropdown = ref(false);
const fuseInstance = ref(null);
const augmentedCharacters = ref([]); // Store characters with added search fields

// --- Pinyin Generation Helper ---
function generateSearchableStrings(char) {
    // Ensure FamilyName and Name exist
    const familyName = char.FamilyName || '';
    const Name = char.Name || '';
    // Concatenate full name
    const fullName = getFullName(char); // Assuming this function is imported or defined elsewhere

    let searchablePinyin = '';
    if (fullName) {
        // Generate Pinyin without tone marks, as an array
        const pinyinArray = pinyin(fullName, { toneType: 'none', type: 'array' });

        // Format 1: Concatenated Pinyin (e.g., "yinjingyizhi")
        const pinyinNoSpace = pinyinArray.join('');

        // Format 2: Pinyin with spaces (e.g., "yin jing yi zhi")
        const pinyinWithSpace = pinyinArray.join(' ');

        // Format 3: First letter of each syllable (e.g., "yjy z")
        const firstLetters = pinyinArray.map(p => p[0]).join('');

        // Combine into a single searchable string
        // Adding fullName again ensures Hanzi input also matches this field if needed, though Fuse handles multiple keys.
        searchablePinyin = `${pinyinNoSpace} ${pinyinWithSpace} ${firstLetters}`;
    }

    // Return the augmented character object
    return {
        ...char, // Spread the original character data
        fullName: fullName, // Add the fullName property
        searchablePinyin: searchablePinyin // Add the combined pinyin string
    };
}
0

// --- Initialize/Update Fuse.js ---
// Watch the original characters prop
watch(() => props.characters, (newChars) => {
    if (newChars && newChars.length > 0) {
        // Augment characters with fullName and searchablePinyin
        augmentedCharacters.value = newChars.map(generateSearchableStrings);

        // Initialize Fuse with the augmented data
        fuseInstance.value = new Fuse(augmentedCharacters.value, {
            keys: [
                // Define keys to search within the augmented data
                'fullName',         // Search the original Hanzi full name
                'searchablePinyin', // Search the generated Pinyin string
                'FamilyName',       // Allow searching just family name (Hanzi)
                'Name'      // Allow searching just personal name (Hanzi)
            ],
            includeScore: true,
            threshold: 0.3, // Adjust threshold - might need tuning for Pinyin vs Hanzi
            ignoreLocation: true, // Useful for matching parts of the searchablePinyin string
        });
        // console.log("Fuse instance created with augmented data.");

    } else {
        fuseInstance.value = null;
        augmentedCharacters.value = [];
    }
}, { immediate: true, deep: true }); // Deep watch might be needed if characters array is modified in place elsewhere, though usually not recommended


// --- Perform Search ---
// Watch the user's search term
watch(searchTerm, (newTerm) => {
    if (newTerm && fuseInstance.value) {
        const results = fuseInstance.value.search(newTerm);
        // IMPORTANT: Map results back to the *original* character objects structure if needed by parent
        // Here, `result.item` contains the augmented object, which is fine internally
        // We just need to display `result.item.fullName` in the template
        searchResults.value = results.map(result => result.item).slice(0, 10);
        showDropdown.value = searchResults.value.length > 0;
    } else {
        searchResults.value = [];
        showDropdown.value = false;
    }
});

// --- Event Handlers ---
function selectCharacterForGuess(character) {
    // Emit the original character object structure if the parent expects it
    emit('guess', character); // Emitting the augmented object for now
    searchTerm.value = ''; // Clear search after guessing
    searchResults.value = [];
    showDropdown.value = false;
}

// --- Dropdown Visibility Handling ---
function handleClickOutside(event) {
    // Ensure .search-container exists before checking closest
    const searchContainer = document.querySelector('.search-container');
    if (showDropdown.value && searchContainer && !searchContainer.contains(event.target)) {
        showDropdown.value = false;
    }
}

watch(showDropdown, (isOpen) => {
    if (isOpen) {
        // Use nextTick to ensure dropdown is rendered before adding listener? Maybe not needed.
        document.addEventListener('click', handleClickOutside, true);
    } else {
        document.removeEventListener('click', handleClickOutside, true);
    }
});

import { onUnmounted } from 'vue';
import { getFullName } from '../composables/useCharacterData';
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true);
});

function handleImageError(event) {
    // Optional: Hide broken image or show placeholder
    event.target.style.display = 'none';
    // Or set src to a placeholder: event.target.src = '/path/to/placeholder.png';
}

</script>

<template>
    <div class="search-container">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="输入学生姓名 (中文或拼音)..."
        :disabled="disabled"
        @focus="showDropdown = searchTerm && searchResults.length > 0"
        autocomplete="off"
      />
      <div v-if="showDropdown && searchResults.length > 0" class="dropdown-list">
        <ul>
          <li v-for="char in searchResults" :key="char.Id">
            <img
                v-if="char.Id"
                :src="`images/students/${char.Id}.webp`"
                :alt="char.fullName"
                class="dropdown-char-icon"
                @error="handleImageError"
            />
            <div v-else class="dropdown-char-icon-placeholder"></div>
            <span class="char-name" @click.stop="emit('preview', char)"> {{ char.fullName }}
                <small v-if="char.school"> ({{ char.school }})</small>
            </span>
            <button @click.stop="selectCharacterForGuess(char)" :disabled="disabled">猜！</button>
          </li>
        </ul>
      </div>
      <div v-else-if="searchTerm && !showDropdown" style="padding: 10px; font-size: 0.9em; color: #6c757d;">
          没有找到匹配的学生。
      </div>
    </div>
  </template>