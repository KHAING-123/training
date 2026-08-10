<script setup>
import { ref } from 'vue';
import { updateTask, deleteTask } from '../api/tasks.js';

// props: 親コンポーネントから渡された値を受け取るための宣言。
// このコンポーネント自身は task を書き換えない（一方向のデータフロー）
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

// emit: 子から親へ「イベントが起きたこと」を通知するための宣言。
const emit = defineEmits(['select', 'task-updated', 'task-deleted']);

// 「このタスクが今、編集モードかどうか」はこのコンポーネント自身が持つローカルな状態。
// 他のタスクの編集状態には影響しない（TaskItemごとに独立している）
const isEditing = ref(false);
const editTitle = ref('');
const validationError = ref('');
const apiError = ref(''); // 更新・削除どちらのAPIエラーもここに入れて表示する
const isSubmitting = ref(false);
const isDeleting = ref(false);

function handleClick() {
  emit('select', props.task.id);
}

function startEdit() {
  editTitle.value = props.task.title; // 現在のタスク名を入力欄の初期値にする
  validationError.value = '';
  apiError.value = '';
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  validationError.value = '';
  apiError.value = '';
  // editTitle はリセットしなくても、次に startEdit() した時に上書きされるため問題ない
}

function validate() {
  if (!editTitle.value.trim()) {
    validationError.value = 'タスク名を入力してください';
    return false;
  }
  validationError.value = '';
  return true;
}

async function handleUpdate() {
  apiError.value = '';
  if (!validate()) return;

  isSubmitting.value = true;
  try {
    const updated = await updateTask(props.task.id, { title: editTitle.value.trim() });
    emit('task-updated', updated); // 更新後のタスクを親へ渡す
    isEditing.value = false;
  } catch (err) {
    apiError.value = err.message; // 失敗時は編集モードのまま、入力値も保持する
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  // 削除は取り消せない操作なので、実行前に必ずユーザーの意思を確認する
  const confirmed = window.confirm(`「${props.task.title}」を削除します。よろしいですか？`);
  if (!confirmed) return;

  apiError.value = '';
  isDeleting.value = true;
  try {
    await deleteTask(props.task.id);
    emit('task-deleted', props.task.id); // 削除したタスクのIDだけ親へ渡す
  } catch (err) {
    apiError.value = err.message; // 失敗時はタスクを残したままエラーを表示する
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <li class="task-item" @click="handleClick">
    <div class="task-item__row">
      <template v-if="!isEditing">
        <span class="task-item__title" :class="{ 'task-item__title--done': task.done }">
          {{ task.title }}
        </span>
        <div class="task-item__actions">
          <button type="button" class="task-item__edit-btn" @click.stop="startEdit">
            編集
          </button>
          <button
            type="button"
            class="task-item__delete-btn"
            :disabled="isDeleting"
            @click.stop="handleDelete"
          >
            {{ isDeleting ? '削除中...' : '削除' }}
          </button>
        </div>
      </template>

      <form v-else class="task-item__edit-form" @submit.prevent="handleUpdate" @click.stop>
        <input
          v-model="editTitle"
          type="text"
          class="task-item__edit-input"
          :disabled="isSubmitting"
        />
        <div class="task-item__edit-actions">
          <button type="submit" class="task-item__save-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '保存' }}
          </button>
          <button
            type="button"
            class="task-item__cancel-btn"
            :disabled="isSubmitting"
            @click="cancelEdit"
          >
            キャンセル
          </button>
        </div>

        <p v-if="validationError" class="task-item__error">{{ validationError }}</p>
      </form>
    </div>

    <!-- 更新・削除どちらのエラーも、編集モードかどうかに関わらずここに表示する -->
    <p v-if="apiError" class="task-item__error">{{ apiError }}</p>
  </li>
</template>

<style scoped>
.task-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-item:hover {
  background-color: #f5f5f5;
}

.task-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.task-item__title {
  flex: 1 1 auto;
  min-width: 0; /* これがないと長いタイトルが折り返さずボタンを押し出してしまう */
  overflow-wrap: anywhere; /* 長い英単語やURLなども途中で折り返してレイアウト崩れを防ぐ */
}

.task-item__title--done {
  text-decoration: line-through;
  color: #999;
}

.task-item__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.task-item__edit-btn,
.task-item__delete-btn {
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.task-item__edit-btn {
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

.task-item__edit-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: #fff;
}

.task-item__delete-btn {
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
}

.task-item__delete-btn:hover:not(:disabled) {
  background: var(--color-danger);
  color: #fff;
}

.task-item__edit-btn:focus-visible,
.task-item__delete-btn:focus-visible,
.task-item__save-btn:focus-visible,
.task-item__cancel-btn:focus-visible {
  outline: 2px solid var(--color-primary-dark);
  outline-offset: 2px;
}

.task-item__delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-item__edit-form {
  width: 100%;
  cursor: default;
}

.task-item__edit-input {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.task-item__edit-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.task-item__edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.task-item__save-btn,
.task-item__cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.15s;
}

.task-item__save-btn {
  background: var(--color-primary);
  color: #fff;
}

.task-item__save-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.task-item__cancel-btn {
  background: #eee;
  color: #333;
}

.task-item__cancel-btn:hover:not(:disabled) {
  background: #ddd;
}

.task-item__save-btn:disabled,
.task-item__cancel-btn:disabled,
.task-item__edit-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-item__error {
  margin: 0.25rem 0 0;
  color: var(--color-danger);
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

/* スマホ幅では、タイトルを上・編集/削除ボタンを下に縦積みにして
   タイトルが長くてもボタンが押し出されないようにする */
@media (max-width: 600px) {
  .task-item__row {
    flex-direction: column;
    align-items: stretch;
  }

  .task-item__actions {
    justify-content: flex-end;
  }

  .task-item__edit-actions {
    flex-direction: column;
  }
}
</style>
