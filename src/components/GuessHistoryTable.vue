<script setup>
import { mapValue } from '@/utils/mappings';  

defineProps({
    guesses: { type: Array, required: true }, // Array of { guess: Character, feedback: FeedbackObject }
    headers: { type: Array, required: true } // Array of { key: String, label: String }
});

function getCellClass(status) {
    if (status === 'correct') return 'cell correct';
    if (status === 'close') return 'cell close';
    if (status === 'incorrect') return 'cell incorrect';
    return 'cell'; // Default if status is missing or unknown
}

// Helper to safely get nested properties and format
function getDisplayValue(guess, key) {
    const value = mapValue(key,guess[key]);
    // Add more specific formatting if needed
    return value !== undefined && value !== null ? value : '-';
}

</script>

<template>
    <div class="guess-history">
        <div v-if="headers && headers.length > 0" class="header-row">
            <div>姓名</div>
            <div v-for="header in headers" :key="header.key">{{ header.label }}</div>
        </div>
        <div v-if="guesses.length === 0 && headers.length > 0">
            <div style="text-align: center; padding: 20px; color: #6c757d;">
                输入学生姓名开始猜测...
            </div>
        </div>
        <div v-for="(item, index) in guesses" :key="index" class="guess-row">
            <div
                :class="getCellClass(item.feedback[headers.find(h => h.key === 'school')?.name] === 'correct' && guesses.length > 0 && item.guess.id === guesses[0].guess.id ? 'correct' : 'incorrect')">
                {{ item.guess.fullName }}
            </div>
            <div v-for="header in headers" :key="header.key" :class="getCellClass(item.feedback[header.key])">
                {{ getDisplayValue(item.guess, header.key) }}
            </div>
        </div>
    </div>
</template>