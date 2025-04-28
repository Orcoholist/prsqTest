<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Ваши списки</h2>
      <button class="close-btn" @click="closePanel" title="close">X</button>
    </div>
    
    <button @click="openAddListModal">Добавить список</button>

    <div v-if="isLoading">
      <p>Загрузка списков...</p>
    </div>

    <div v-else-if="!mutationStore.mutationLists || mutationStore.mutationLists.length === 0">
      <p>Список пуст</p>
    </div>

    <ul v-else>
      <li
        v-for="(list, index) in safeListsArray"
        :key="index"          
        @click="selectList(list.name)"
        :class="{ active: props.selectedListName === list.name }"
      >
        {{ list.name || 'Unnamed List' }}
        <button @click.stop="removeMutationFromList(list.name)">Удалить</button> 
      </li>
    </ul>

    <AddListModal v-if="isAddListModalOpen" @close="closeAddListModal" @add-list="addList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useMutationStore } from '../stores/mutationStore';
import AddListModal from './AddListModal.vue';

const mutationStore = useMutationStore();
const isAddListModalOpen = ref(false);
const isLoading = ref(false);


const safeListsArray = computed(() => {
  if (!mutationStore.mutationLists || !Array.isArray(mutationStore.mutationLists)) {
    return [];
  }
  return mutationStore.mutationLists.filter(list => list && typeof list === 'object');
});


const props = defineProps<{
  selectedListName: string | null;
}>();

const emit = defineEmits(['list-selected', 'close']);

onMounted(async () => {
  try {
    isLoading.value = true;
    await mutationStore.loadMutationLists();
  } catch (error) {
    console.error('Ошибка при загрузке списков мутаций:', error);
  } finally {
    isLoading.value = false;
  }
});

const selectList = (listName: string) => {
  if (!listName) return;
  
  try {
    mutationStore.setSelectedList(listName);
    emit('list-selected', listName);
  } catch (error) {
    console.error('Ошибка при выборе списка:', error);
  }
};

const openAddListModal = () => {
  isAddListModalOpen.value = true;
};

const closeAddListModal = () => {
  isAddListModalOpen.value = false;
};

const addList = async (name: string) => {
  if (!name || typeof name !== 'string') {
    console.error('Invalid list name');
    return;
  }
  
  try {
    isLoading.value = true;
    // Добавляем список
    await mutationStore.addMutationList(name);
    
    // После успешного добавления перезагружаем списки из API
    await mutationStore.loadMutationLists();
    
    closeAddListModal();
  } catch (error) {
    console.error('Ошибка при добавлении списка:', error);
  } finally {
    isLoading.value = false;
  }
};

const removeMutationFromList = async (listName: string) => {
  if (!listName || typeof listName !== 'string') {
    console.error('Invalid list name');
    return;
  }
  
  try {
    isLoading.value = true;
    // Удаляем список
    await mutationStore.deleteMutationList(listName);
    
    // После успешного удаления перезагружаем списки из API
    await mutationStore.loadMutationLists();
  } catch (error) {
    console.error('Ошибка при удалении списка:', error);
  } finally {
    isLoading.value = false;
  }
};

// Функция для закрытия панели
const closePanel = () => {
  emit('close');
};
</script>

<style scoped>
.sidebar {
  position: absolute;
  left: 9rem;
  top: 7rem;
  width: 25rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  color: #666;
  margin: 0;
}

.close-btn:hover {
  color: #dc3545;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem;
  margin-bottom: 0.3rem;
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: pointer;
}

li.active {
  background-color: #ddd;
}

button {
  margin-bottom: 0.6rem;
  padding: 0.5rem 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

li button {
  margin-bottom: 0;
  padding: 0.3rem 0.5rem;
  background-color: #dc3545;
}

li button:hover {
  background-color: #c82333;
}
</style>
