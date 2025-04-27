<script setup>
defineProps({
    character: { type: Object, default: null }, // Character object or null
    altText: { type: String, default: '角色预览' }
});

const defaultPlaceholderImage = 'images/students/'; // Optional: Set a placeholder path

function handleImageError(event) {
    // Optional: Replace broken image with a placeholder
    // event.target.src = defaultPlaceholderImage;
    console.warn("Failed to load image:", event.target.src);
}

</script>

<template>
    <div class="preview-area">
        <img v-if="character && character.Id" :src="`/images/students/${character.Id}.webp`"
            :alt="character.Name || altText" @error="handleImageError" />
        <div v-else class="placeholder">
            点击搜索结果中的学生姓名进行预览
        </div>
    </div>
</template>