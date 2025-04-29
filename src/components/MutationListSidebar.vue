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

    <AddListModal
      v-if="isAddListModalOpen"
      @close="closeAddListModal"
      @add-list="addList"
    />

    <div
      v-else-if="
        !mutationStore.mutationLists || mutationStore.mutationLists.length === 0
      "
    >
      <p>Список пуст</p>
    </div>

    <ul v-else>
      <li
        v-for="(list, index) in safeListsArray"
        :key="index"
        @click="selectList(list.name)"
        :class="{ active: props.selectedListName === list.name }"
      >
        <div v-if="editingListId === list.name" class="edit-mode">
          <input
            type="text"
            v-model="editedListName"
            @keyup.enter="saveListName(list.name)"
            @keyup.esc="cancelEdit"
            ref="editInput"
            @click.stop
          />
          <button @click.stop="saveListName(list.name)" class="edit-btn save">
            ✓
          </button>
          <button @click.stop="cancelEdit" class="edit-btn cancel">✕</button>
        </div>
        <div v-else class="list-content">
          <span>{{ list.name || 'Unnamed List' }}</span>
          <div class="list-actions">
            <button @click.stop="startEdit(list.name)" class="edit-btn">
              ✎
            </button>
            <button
              @click.stop="removeMutationFromList(list.name)"
              class="delete-btn"
            >
              ✕
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useMutationStore } from '../stores/mutationStore';
import AddListModal from './AddListModal.vue';

const editInput = ref<HTMLInputElement | null>(null);

const mutationStore = useMutationStore();
const isAddListModalOpen = ref(false);
const isLoading = ref(false);

const editingListId = ref<string | null>(null);
const editedListName = ref('');

const safeListsArray = computed(() => {
  if (
    !mutationStore.mutationLists ||
    !Array.isArray(mutationStore.mutationLists)
  ) {
    return [];
  }
  return mutationStore.mutationLists.filter(
    (list) => list && typeof list === 'object'
  );
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
  try {
    await mutationStore.addMutationList(name);
    closeAddListModal();
  } catch (error) {
    console.error('Error adding list:', error);
  }
};

// const addList = async (name: string) => {
//   if (!name || typeof name !== 'string') {
//     console.error('Invalid list name');
//     return;
//   }

//   try {
//     isLoading.value = true;
//     // Добавляем список
//     await mutationStore.addMutationList(name);

//     // После успешного добавления перезагружаем списки из API
//     await mutationStore.loadMutationLists();

//     closeAddListModal();
//   } catch (error) {
//     console.error('Ошибка при добавлении списка:', error);
//   } finally {
//     isLoading.value = false;
//   }
// };

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

const closePanel = () => {
  emit('close');
};

const startEdit = (listName: string) => {
  editingListId.value = listName;
  editedListName.value = listName;
  // nextTick(() => {
  //   if (editInput.value) {
  //     editInput.value.focus();
  //   }
  // });
};

const saveListName = async (oldName: string) => {
  if (!editedListName.value.trim() || editedListName.value === oldName) {
    cancelEdit();
    return;
  }

  try {
    isLoading.value = true;

    await mutationStore.updateMutationList(oldName, editedListName.value);
    await mutationStore.loadMutationLists();
    editingListId.value = null;
  } catch (error) {
    console.error('Error updating list name:', error);
  } finally {
    isLoading.value = false;
  }
};

const cancelEdit = () => {
  editingListId.value = null;
  editedListName.value = '';
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
  background-color: #4caf50;
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

.list-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.edit-mode {
  display: flex;
  gap: 8px;
  width: 100%;
}

.edit-mode input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-btn {
  padding: 4px 8px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn.save {
  background: #4caf50;
}

.edit-btn.cancel {
  background: #dc3545;
}

.delete-btn {
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
