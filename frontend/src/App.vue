<script setup>
import { ref, onMounted } from 'vue';
import { fetchTasks } from './api/tasks.js';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';

// Composition API: リアクティブな状態は ref() で宣言する
const tasks = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');
const selectedTaskId = ref(null); // クリックで選択中のタスクID（Props/Emitの確認用に導入。削除時にも参照する）

async function loadTasks() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    tasks.value = await fetchTasks();
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

// TaskList から中継されてきた 'select-task' イベントを受け取る
function handleSelectTask(taskId) {
  selectedTaskId.value = taskId;
}

// TaskForm から届いた 'task-created' イベントを受け取り、
// 再取得はせずレスポンスで返ってきた新しいタスクをそのまま配列に追加する（即時反映）
function handleTaskCreated(newTask) {
  tasks.value.push(newTask);
}

// TaskList から中継されてきた 'task-updated' イベントを受け取り、
// 該当するタスクだけを更新後のデータで差し替える（即時反映）
function handleTaskUpdated(updatedTask) {
  const index = tasks.value.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    tasks.value[index] = updatedTask;
  }
}

// TaskList から中継されてきた 'task-deleted' イベントを受け取り、
// 該当するタスクだけを配列から取り除く（即時反映）
function handleTaskDeleted(taskId) {
  tasks.value = tasks.value.filter((t) => t.id !== taskId);
  if (selectedTaskId.value === taskId) {
    selectedTaskId.value = null; // 削除されたタスクを選択中のままにしない
  }
}

// マウント時に一覧を取得する（API疎通確認）
onMounted(loadTasks);
</script>

<template>
  <main class="app">
    <h1>タスク管理アプリ</h1>

    <TaskForm @task-created="handleTaskCreated" />

    <p v-if="isLoading" class="status">読み込み中...</p>
    <p v-else-if="errorMessage" class="status status--error">{{ errorMessage }}</p>

    <template v-else>
      <TaskList
        :tasks="tasks"
        @select-task="handleSelectTask"
        @task-updated="handleTaskUpdated"
        @task-deleted="handleTaskDeleted"
      />

      <p v-if="selectedTaskId" class="selected-info">選択中のタスクID: {{ selectedTaskId }}</p>
    </template>
  </main>
</template>

<style scoped>
/* max-width で読みやすい幅に制限しつつ margin: 0 auto で中央寄せ。
   PC/タブレットでは横幅いっぱいに広がらず「カード」のように見え、
   スマホでは max-width より画面幅の方が狭いので自然に全幅表示になる */
.app {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 1.25rem;
}

.status {
  color: var(--color-text-muted);
}

.status--error {
  color: var(--color-danger);
  font-weight: 500;
}

.selected-info {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #eef6ff;
  border-radius: var(--radius);
  color: #2c3e50;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .app {
    padding: 1rem 0.75rem;
  }

  h1 {
    font-size: 1.3rem;
  }
}
</style>
