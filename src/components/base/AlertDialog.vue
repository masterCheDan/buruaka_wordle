<template>
    <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-80 max-w-full shadow-xl">
            <div class="text-lg font-bold mb-4">
                <slot name="title">提示</slot>
            </div>
            <div class="mb-4">
                <slot name="content">内容区域</slot>
            </div>
            <div class="flex justify-end">
                <button @click="$emit('close')"
                    class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">关闭</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AlertDialog'
};
</script>

<style scoped></style>