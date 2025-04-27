<script setup>
defineProps({
    hint: { type: String, default: null }
});
</script>

<template>
    <div v-if="hint" class="hint-area">
        {{ hint }}
    </div>
</template>