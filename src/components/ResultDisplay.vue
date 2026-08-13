<template>
    <div>
        <div v-if="gameStatus === 'win'" class="text-green-600 text-xl font-bold">恭喜你猜对了！</div>
        <div v-else-if="gameStatus === 'fail'" class="text-red-600 text-xl font-bold">很遗憾，次数已达上限，游戏结束！</div>

        <AlertDialog v-if="showAnswerPopup" @close="showAnswerPopup = false">
            <template #title>正确答案</template>
            <template #content>
                <div class="flex flex-col items-center space-y-4">
                    <img :src="correctAnswer.image" :alt="correctAnswer.name" class="w-48 h-auto rounded" />
                    <div class="text-lg font-semibold">{{ correctAnswer.name }}</div>
                    <div class="text-sm text-gray-600">关键词：{{ keywordSummary }}</div>
                </div>
            </template>
        </AlertDialog>
    </div>
</template>

<script>
import AlertDialog from './base/AlertDialog.vue'; // 假设你有一个弹窗组件

export default {
    name: 'ResultDisplay',
    components: {
        AlertDialog
    },
    props: {
        gameStatus: String,
        correctAnswer: Object
    },
    data() {
        return {
            showAnswerPopup: false
        };
    },
    computed: {
        keywordSummary() {
            if (!this.correctAnswer) return '';
            const fields = ['school', 'club', 'weapontype', 'position', 'age']; // 可根据需要调整
            return fields.map(f => `${this.fieldLabels[f] || f}：${this.correctAnswer[f]}`).join('，');
        },
        fieldLabels() {
            return {
                school: '学校',
                club: '社团',
                weapontype: '武器类型',
                position: '站位',
                age: '年龄'
            };
        }
    },
    watch: {
        gameStatus(newVal) {
            if (newVal === 'win' || newVal === 'fail') {
                this.showAnswerPopup = true;
            }
        }
    }
};
</script>

<style scoped></style>