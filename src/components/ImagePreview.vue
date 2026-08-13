<template>
    <div v-if="imageUrl" class="image-preview p-4">
        <img :src="imageUrl" alt="角色预览图" class="max-w-xs mx-auto" />
    </div>
</template>

<script setup>
import { inject } from 'vue'
const imageUrl = inject('previewImageUrl')
</script>