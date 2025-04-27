<script setup>
import { computed } from 'vue';
// Assuming you created this utility or import maps directly
import { mapValue } from '@/utils/mappings'; // Adjust path as needed

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

function fullName(char) {
  const specialNames = ['初音未来', '佐天泪子', '御坂美琴', '食蜂操祈'];
    // Concatenate full name
  return specialNames.includes(char.Name) ? char.Name : `${char.FamilyName}${char.Name}`;
}

</script>

<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="requestClose">
      <div class="modal-content">
        <button class="modal-close-button" @click="requestClose">&times;</button>
        <h2>{{ title }}</h2>

        <div v-if="targetCharacter" class="modal-details">
          <h3>正确答案：{{ fullName(targetCharacter) }}</h3>
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

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  width: 90%;
  max-width: 500px; /* Adjust max width */
  max-height: 90vh; /* Limit height */
  overflow-y: auto; /* Allow scrolling for content */
  text-align: center;
}

.modal-close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
   padding: 0; /* Reset button padding */
}
 .modal-close-button:hover {
     color: #333;
 }


h2 {
  margin-top: 0;
  color: #007bff; /* Or style based on win/loss */
  margin-bottom: 20px;
}
 h3 {
     margin-bottom: 15px;
 }

.modal-details {
    margin-bottom: 25px;
}

.modal-char-image {
    max-width: 120px;
    max-height: 120px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: block; /* Center image easily */
    margin-left: auto;
    margin-right: auto;
}

.attributes-list {
    list-style: none;
    padding: 0;
    text-align: left;
    max-width: 300px; /* Limit width for better reading */
    margin: 0 auto; /* Center the list block */
    font-size: 0.95em;
}
.attributes-list li {
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}
 .attributes-list li strong {
     color: #555;
     margin-right: 5px;
 }

.modal-new-game-button {
  /* Use global button styles or define specific ones */
  padding: 10px 20px;
  font-size: 1.1em;
}
</style>