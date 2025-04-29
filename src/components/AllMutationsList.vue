<template>
  <div class="all-mutations-list panel">
    <div class="toast-container">
      <div v-if="showToast" class="toast" :class="toastType">
        {{ toastMessage }}
      </div>
    </div>
    <h2 class="panel-title">Все мутации</h2>

    <!-- Поиск -->
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Поиск мутаций..."
        class="search-input"
      />
    </div>

    <!-- Фильтры по типу -->
    <div class="filter-container">
      <button
        @click="setTypeFilter('ALL')"
        :class="['filter-btn', typeFilter === 'ALL' ? 'active' : '']"
      >
        Все
      </button>
      <button
        @click="setTypeFilter('SNP')"
        :class="['filter-btn', typeFilter === 'SNP' ? 'active' : '']"
      >
        SNP
      </button>
      <button
        @click="setTypeFilter('CNV')"
        :class="['filter-btn', typeFilter === 'CNV' ? 'active' : '']"
      >
        CNV
      </button>
      <button
        @click="setTypeFilter('FUSION')"
        :class="['filter-btn', typeFilter === 'FUSION' ? 'active' : '']"
      >
        FUSION
      </button>
    </div>

    <!-- Состояния загрузки и ошибки -->
    <div v-if="loading && !hasInitialData" class="loading-state">
      <p>Загрузка мутаций...</p>
    </div>
    <div v-else-if="error && !hasInitialData" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Список мутаций -->
    <div
      v-else
      class="mutations-container"
      ref="mutationsContainer"
      @scroll="handleScroll"
    >
      <ul class="mutations-list">
        <li
          v-for="mutation in filteredMutations"
          :key="mutation.mutationId"
          v-memo="[mutation.mutationId]"
          class="mutation-item"
          :class="getMutationType(mutation)"
        >
          <!-- Информация о мутации в зависимости от типа -->
          <div class="mutation-info">
            <!-- Основная информация -->
            <div class="mutation-main-info">
              <span class="mutation-type-badge">{{
                getMutationType(mutation)
              }}</span>

              <!-- SNP показываем hgvsGdna -->
              <span
                v-if="getMutationType(mutation) === 'SNP'"
                class="mutation-name"
              >
                {{ mutation.maybeHgvsGdna || mutation.mutationId }}
              </span>

              <!-- CNV и FUSION показываем mutationId -->
              <span v-else class="mutation-name">
                {{ mutation.mutationId }}
              </span>
            </div>

            <!-- Дополнительная информация -->
            <div class="mutation-details">
              <!-- Chromosome -->
              <div v-if="mutation.maybeChrNumber" class="chromosome">
                <span class="detail-label">Хромосома:</span>
                <span class="detail-value">{{ mutation.maybeChrNumber }}</span>
              </div>

              <!-- evidenceLevel -->
              <div v-if="mutation.evidenceLevel" class="evidence-level">
                <span class="detail-label">Evidence:</span>
                <span class="detail-value">{{ mutation.evidenceLevel }}</span>
              </div>

              <!-- acmgSignificances -->
              <div
                v-if="
                  mutation.acmgSignificances &&
                  mutation.acmgSignificances.length > 0
                "
                class="acmg-significances"
              >
                <span class="detail-label">ACMG:</span>
                <span class="detail-value">{{
                  mutation.acmgSignificances.join(', ')
                }}</span>
              </div>

              <!-- ACMG Annotation Status -->
              <div
                v-if="mutation.isAnnotatedByAcmg !== undefined"
                class="acmg-status"
              >
                <span class="detail-label">ACMG Annotation:</span>
                <span class="detail-value">{{
                  mutation.isAnnotatedByAcmg ? 'Yes' : 'No'
                }}</span>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="mutation-actions">
            <button
              @click.prevent="addMutationToList(mutation.mutationId)"
              class="action-btn add-btn"
              title="Добавить мутацию в список"
            >
              ＋
            </button>
            <!-- <button 
              @click.prevent="removeMutationFromList(mutation.mutationId)"
              class="action-btn remove-btn"
              title="Удалить мутацию из списка"
            >
              −
            </button> -->
          </div>
        </li>
      </ul>

      <!-- Индикатор загрузки при подгрузке следующей страницы -->
      <div v-if="loading && hasInitialData" class="loading-more">
        <p>Загрузка дополнительных мутаций...</p>
      </div>

      <!-- Сообщение о конце списка -->
      <div
        v-if="!loading && !hasMoreMutations && hasInitialData"
        class="end-of-list"
      >
        <p>Больше мутаций нет</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, onMounted, onUpdated } from 'vue';
import type { Mutation } from '../types/mutation';
import { useMutationStore } from '../stores/mutationStore';

const mutationStore = useMutationStore();
const mutationsContainer = ref<HTMLElement | null>(null);
const hasInitialData = ref(false);
const isLoadingMore = ref(false);

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('');

const loading: boolean = false;
const error: string | null = null;

const props = defineProps<{
  mutations: Mutation[];
  // loading: boolean;
  // error: string | null;
}>();

// Поиск
const searchQuery = ref('');

// Фильтр по типу
const typeFilter = ref('ALL');

// Определение типа мутации
const getMutationType = (mutation: Mutation): string => {
  if (mutation.mutationType === 'SNP' || mutation.maybeHgvsGdna) {
    return 'SNP';
  } else if (
    mutation.mutationType === 'CNV' ||
    mutation.mutationId.includes('LOSS') ||
    mutation.mutationId.includes('GAIN')
  ) {
    return 'CNV';
  } else if (
    mutation.mutationType === 'FUSION' ||
    mutation.mutationId.includes('FUSION')
  ) {
    return 'FUSION';
  }
  return 'OTHER';
};

// Установка фильтра по типу
const setTypeFilter = (type: string) => {
  typeFilter.value = type;
};

// Фильтрация мутаций
const filteredMutations = computed(() => {
  let result = props.mutations;

  // Фильтрация по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (mutation) =>
        mutation.mutationId.toLowerCase().includes(query) ||
        (mutation.maybeHgvsGdna &&
          mutation.maybeHgvsGdna.toLowerCase().includes(query))
    );
  }

  // Фильтрация по типу
  if (typeFilter.value !== 'ALL') {
    result = result.filter(
      (mutation) => getMutationType(mutation) === typeFilter.value
    );
  }

  return result;
});

// Проверка, есть ли еще мутации для загрузки
const hasMoreMutations = computed(() => {
  return mutationStore.hasMoreMutations;
});

// Обработчик скролла
const handleScroll = () => {
  if (
    !mutationsContainer.value ||
    isLoadingMore.value ||
    !hasMoreMutations.value
  )
    return;

  const container = mutationsContainer.value;
  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;

  // Если доскролили до конца (с небольшим запасом в 50px)
  if (scrollHeight - scrollPosition < 50) {
    loadMoreMutations();
  }
};

// Загрузка следующей страницы мутаций
const loadMoreMutations = async () => {
  if (isLoadingMore.value || !hasMoreMutations.value) return;

  try {
    isLoadingMore.value = true;
    const nextPage = mutationStore.currentPage + 1;
    await mutationStore.loadMutations(nextPage);
  } catch (error) {
    console.error('Ошибка при загрузке дополнительных мутаций:', error);
  } finally {
    isLoadingMore.value = false;
  }
};

const addMutationToList = (mutationId: string) => {
  const selectedListName = mutationStore.selectedListName;

  if (!selectedListName) {
    toastMessage.value = 'Пожалуйста, выберите список';
    toastType.value = 'warning';
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 3000);
    return;
  }

  const currentList = mutationStore.mutationLists.find(
    (list) => list.name === selectedListName
  );
  if (!currentList) {
    toastMessage.value = 'Список не найден';
    toastType.value = 'error';
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 3000);
    return;
  }

  if (currentList.mutations && currentList.mutations.includes(mutationId)) {
    toastMessage.value = 'Эта мутация уже есть в выбранном списке';
    toastType.value = 'error';
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 3000);
    return;
  }

  mutationStore.addMutationToList(selectedListName, mutationId);
  toastMessage.value = 'Мутация успешно добавлена';
  toastType.value = 'success';
  showToast.value = true;
  setTimeout(() => (showToast.value = false), 3000);
};

// const removeMutationFromList = (mutationId: string) => {
//   const selectedListId = mutationStore.selectedListName;

//   if (selectedListId) {
//     mutationStore.removeMutationFromList(selectedListId, mutationId);
//   } else {
//     alert('Пожалуйста, выберите список для удаления мутации');
//   }
// };

onMounted(() => {
  hasInitialData.value = props.mutations.length > 0;
});
</script>

<style scoped>
.panel {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-title {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #4caf50;
}

.search-container {
  margin-bottom: 15px;
  padding: 0;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  max-width: 100%;
}

.search-input:focus {
  border-color: #4caf50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.filter-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  background-color: #e9ecef;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.filter-btn:hover {
  background-color: #dee2e6;
}

.filter-btn.active {
  background-color: #4caf50;
  color: white;
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
  border-left: 4px solid #4caf50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.mutation-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.mutation-item.SNP {
  border-left-color: #007bff;
}

.mutation-item.CNV {
  border-left-color: #fd7e14;
}

.mutation-item.FUSION {
  border-left-color: #6f42c1;
}

.mutation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mutation-main-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mutation-type-badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  color: white;
  background-color: #6c757d;
}

.mutation-item.SNP .mutation-type-badge {
  background-color: #007bff;
}

.mutation-item.CNV .mutation-type-badge {
  background-color: #fd7e14;
}

.mutation-item.FUSION .mutation-type-badge {
  background-color: #6f42c1;
}

.mutation-name {
  font-family: monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.mutation-details {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
  font-size: 12px;
}

.detail-label {
  color: #6c757d;
  font-weight: bold;
  margin-right: 5px;
}

.detail-value {
  color: #495057;
}

.evidence-level {
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 3px;
}

.acmg-significances {
  padding: 2px 6px;
  background-color: #e9ecef;
  border-radius: 3px;
}

.mutation-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.2s, transform 0.1s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.add-btn {
  background-color: #28a745;
  color: white;
}

.add-btn:hover {
  background-color: #218838;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
}

.remove-btn:hover {
  background-color: #c82333;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f1f1f1;
  border-radius: 8px;
  color: #6c757d;
  text-align: center;
  padding: 20px;
  margin-top: 20px;
}

.error-state {
  color: #dc3545;
}

.loading-more {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 10px;
  color: #6c757d;
}

.end-of-list {
  text-align: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 10px;
  color: #6c757d;
  font-style: italic;
}

.mutations-container {
  flex: 1;
  overflow-y: auto;
  height: 600px;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.toast {
  padding: 12px 20px;
  border-radius: 4px;
  margin-bottom: 10px;
  color: white;
  animation: slideIn 0.3s ease-out;
}

.success {
  background-color: #28a745;
}

.warning {
  background-color: #ffc107;
  color: #000;
}

.error {
  background-color: #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
