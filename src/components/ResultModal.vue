<script setup>
import { computed } from 'vue';
// Assuming you created this utility or import maps directly
import { mapValue } from '@/utils/mappings'; // Adjust path as needed
import { getFullName } from '../composables/useCharacterData';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  status: { type: String, required: true }, // 'won' or 'lost'
  targetCharacter: { type: Object, default: null },
  // Pass the headers structure used for comparison
  comparisonHeaders: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'new-game']);

const title = computed(() => {
  return props.status === 'won' ? '恭喜你，猜对了！' : '很遗憾，猜测次数已达上限！';
});

// Filter headers to show relevant attributes (or define a specific list)
const attributesToShow = computed(() => {
    if (!props.targetCharacter) return [];
    // Use comparisonHeaders passed from parent
    return props.comparisonHeaders.map(header => ({
        label: header.label,
        value: mapValue(header.key, props.targetCharacter[header.key]) // Use mapping
    })).filter(attr => attr.value !== '-'); // Filter out empty values if desired
    // OR Define a static list:
    // const fields = ['school', 'club', 'rarity', ...];
    // return fields.map(key => ({ label: fieldNameMap[key] || key, value: mapValue(key, props.targetCharacter[key]) }));
});

function handleImageError(event) {
    event.target.style.display = 'none';
}

function requestClose() {
    emit('close');
}

function requestNewGame() {
    emit('new-game'); // Parent will handle closing + starting new game
}

</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="requestClose">
      <div class="modal-content">
        <button class="modal-close-button" @click="requestClose">&times;</button>
        <h2>{{ title }}</h2>

        <div v-if="targetCharacter" class="modal-details">
          <h3>正确答案：{{ getFullName(targetCharacter) }}</h3>
          <img
            v-if="targetCharacter.Id"
            :src="`images/students/${targetCharacter.Id}.webp`"
            :alt="targetCharacter.fullName"
            class="modal-char-image"
            @error="handleImageError"
          />
          <ul class="attributes-list">
             <li v-for="attr in attributesToShow" :key="attr.label">
                <strong>{{ attr.label }}:</strong> {{ attr.value }}
             </li>
          </ul>
        </div>

        <button class="modal-new-game-button" @click="requestNewGame">
          开始新游戏
        </button>
      </div>
    </div>
  </transition>
</template>