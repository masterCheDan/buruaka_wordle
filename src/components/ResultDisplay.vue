<script setup>
defineProps({
    status: { type: String, required: true }, // 'playing', 'won', 'lost', 'loading', 'error'
    target: { type: Object, default: null } // The target character object
});

function handleImageError(event) {
    console.warn("Failed to load target image:", event.target.src);
}
</script>

<template>
    <div>
        <div v-if="status === 'won'" class="result-area success">
            <p>恭喜你猜对了！答案是：{{ target?.fullName }}！</p>
            <img v-if="target && target.imageUrl" :src="target.imageUrl" :alt="target.fullName"
                @error="handleImageError" />
        </div>
        <div v-if="status === 'lost'" class="result-area failure">
            <p>很遗憾，猜测次数已用完。答案是：{{ target?.fullName }}。</p>
            <img v-if="target && target.imageUrl" :src="target.imageUrl" :alt="target.fullName"
                @error="handleImageError" />
        </div>
        <div v-if="status === 'error'" class="result-area failure">
            <p>加载角色数据时出错，请刷新页面重试。</p>
        </div>
    </div>
</template>