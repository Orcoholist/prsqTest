<template>
  <div class="panel">
    <div v-if="selectedList" class="panel-content">
      <h2 class="panel-title">{{ selectedList.name }}</h2>
      <p class="panel-description">{{ selectedList.description }}</p>
      
      <h3 class="section-title">Мутации в списке</h3>
      <div v-if="selectedList.mutations && selectedList.mutations.length > 0" class="mutations-container">
        <ul class="mutations-list">
          <li v-for="mutationId in selectedList.mutations" :key="mutationId" class="mutation-item">
            <span class="mutation-name">{{ mutationId }}</span>
            <button @click="removeMutationFromList(mutationId)" class="remove-btn">
              Удалить
            </button>
          </li>
        </ul>
      </div>
      <div v-else class="empty-state">
        <p>В этом списке пока нет мутаций</p>
        <p class="hint">Добавьте мутации из раздела "Все мутации"</p>
      </div>
    </div>
    <div v-else class="empty-panel">
      <p>Выберите список для просмотра деталей</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMutationStore } from '../stores/mutationStore';

const mutationStore = useMutationStore();

const props = defineProps<{
  selectedListName: string | null;
}>();

const selectedList = computed(() => {
  if (props.selectedListName) {      
    const list = mutationStore.mutationLists.find((list) => list.name === props.selectedListName);
    return list || null;
  }
  return null;
});

const removeMutationFromList = (mutationName: string) => {
  if (selectedList.value) {
    mutationStore.removeMutationFromList(selectedList.value.name, mutationName);
  }
};
</script>

<style scoped>
.panel {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-title {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4CAF50;
}

.panel-description {
  color: #6c757d;
  margin-bottom: 20px;
  font-style: italic;
}

.section-title {
  color: #2c3e50;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 15px;
}

.mutations-container {
  flex: 1;
  overflow-y: auto;
}

.mutations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mutation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  background-color: white;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.mutation-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.mutation-name {
  font-family: monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: #c82333;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f1f1f1;
  border-radius: 8px;
  color: #6c757d;
  text-align: center;
  padding: 20px;
}

.hint {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
}

.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
  text-align: center;
  background-color: #f1f1f1;
  border-radius: 8px;
  padding: 20px;
}
</style>
