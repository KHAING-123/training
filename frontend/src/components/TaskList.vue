<script setup>
import TaskItem from './TaskItem.vue';

// App.vue から tasks 配列を props として受け取る
defineProps({
  tasks: {
    type: Array,
    required: true,
  },
});

// TaskItem から届いた 'select' / 'task-updated' / 'task-deleted' イベントを、そのまま App.vue へ中継する
// （TaskList自身はこのイベントに興味はなく、橋渡しだけを行う）
const emit = defineEmits(['select-task', 'task-updated', 'task-deleted']);

function handleSelect(taskId) {
  emit('select-task', taskId);
}

function handleTaskUpdated(updatedTask) {
  emit('task-updated', updatedTask);
}

function handleTaskDeleted(taskId) {
  emit('task-deleted', taskId);
}
</script>

<template>
  <ul class="task-list">
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @select="handleSelect"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />
  </ul>
</template>

<style scoped>
.task-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
