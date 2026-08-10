<script setup>
import { ref } from 'vue';
import { createTask } from '../api/tasks.js';

// 追加に成功したことを親(App.vue)に通知するためのイベント
const emit = defineEmits(['task-created']);

const title = ref(''); // 入力欄の値。v-modelで双方向バインドする
const validationError = ref(''); // クライアント側の入力チェックのメッセージ
const apiError = ref(''); // サーバー側（API呼び出し）が失敗したときのメッセージ
const isSubmitting = ref(false);

// 送信前のクライアント側チェック。ここでは「未入力でないこと」だけを見る
function validate() {
  if (!title.value.trim()) {
    validationError.value = 'タスク名を入力してください';
    return false;
  }
  validationError.value = '';
  return true;
}

async function handleSubmit() {
  apiError.value = '';
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const newTask = await createTask(title.value.trim());
    emit('task-created', newTask); // 作成されたタスクを親へ渡す
    title.value = ''; // 成功したら入力欄をクリア
  } catch (err) {
    apiError.value = err.message; // 失敗時は入力値を残したままエラーを表示
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-form__row">
      <input
        v-model="title"
        type="text"
        placeholder="新しいタスクを入力"
        class="task-form__input"
        :disabled="isSubmitting"
      />
      <button type="submit" class="task-form__button" :disabled="isSubmitting">
        {{ isSubmitting ? '追加中...' : '追加' }}
      </button>
    </div>

    <p v-if="validationError" class="task-form__error">{{ validationError }}</p>
    <p v-else-if="apiError" class="task-form__error">{{ apiError }}</p>
  </form>
</template>

<style scoped>
.task-form {
  margin-bottom: 1.5rem;
}

.task-form__row {
  display: flex;
  gap: 0.5rem;
}

.task-form__input {
  flex: 1;
  min-width: 0; /* flexアイテムの初期最小幅は "auto" のため、これがないと縮まずに親からはみ出すことがある */
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.task-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.task-form__button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s;
}

.task-form__button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.task-form__button:focus-visible {
  outline: 2px solid var(--color-primary-dark);
  outline-offset: 2px;
}

.task-form__button:disabled,
.task-form__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-form__error {
  margin: 0.5rem 0 0;
  color: var(--color-danger);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

/* スマホ幅では入力欄とボタンを縦に並べ、ボタンは押しやすいよう全幅にする */
@media (max-width: 600px) {
  .task-form__row {
    flex-direction: column;
  }

  .task-form__button {
    width: 100%;
  }
}
</style>
