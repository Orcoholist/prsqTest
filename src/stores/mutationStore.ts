import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Mutation } from '../types/mutation';
import type { MutationList } from '../types/mutationList';
import * as apiService from '../services/apiService';

export const useMutationStore = defineStore('mutation', () => {
  const mutations = ref<Mutation[]>([]);
  const mutationLists = ref<MutationList[]>([]);
  const selectedListName = ref<string | null>(null);
  const filterText = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalMutations = ref(0);
  const currentPage = ref(0);
  const pageSize = ref(20);

  const hasMorePages = computed(
    () => mutations.value.length < totalMutations.value
  );

  const filteredMutations = computed(() => {
    if (!filterText.value) {
      return mutations.value;
    }
    return mutations.value.filter((mutation) => {
      const searchTerm = filterText.value.toLowerCase();
      return mutation.mutationId.toLowerCase().includes(searchTerm);
    });
  });

  const selectedList = computed(() => {
    console.log('selectedListName.value', mutationLists.value);

    if (!selectedListName.value) return null;
    return (
      mutationLists.value.find(
        (list) => list.name === selectedListName.value
      ) || null
    );
  });

  const mutationsInSelectedList = computed(() => {
    if (!selectedList.value) return [];
    return mutations.value.filter((mutation) =>
      selectedList.value?.description.includes(mutation.mutationId)
    );
  });

  const mutationsNotInSelectedList = computed(() => {
    if (!selectedList.value) return [];
    return mutations.value.filter(
      (mutation) => !selectedList.value?.description.includes(mutation.mutationId)
    );
  });

  // const loadMoreMutations = async () => {
  //   if (hasMorePages.value) {
  //     await loadMutations(currentPage.value + 1);
  //   }
  // };

  const hasMoreMutations = computed(() => {
    return mutations.value.length < totalMutations.value;
  });

  // Список мутаций
  const loadMutations = async (page?: number) => {
    loading.value = true;
    error.value = null;
    try {
      const pageToLoad = page !== undefined ? page : currentPage.value;
      const result = await apiService.fetchMutations(
        pageToLoad,
        pageSize.value
      );

      if (page === 0 || (page === undefined && currentPage.value === 0)) {
        mutations.value = result.mutations;
      } else {
        const newMutations = result.mutations.filter(
          (newMutation) =>
            !mutations.value.some(
              (existingMutation) =>
                existingMutation.mutationId === newMutation.mutationId
            )
        );
        mutations.value = [...mutations.value, ...newMutations];
      }

      totalMutations.value = result.totalCount;
      currentPage.value = pageToLoad;
    } catch (e: any) {
      error.value = e.message || 'Failed to load mutations';
    } finally {
      loading.value = false;
    }
  };

  const loadMutationLists = async () => {
    loading.value = true;
    error.value = null;
    try {
      mutationLists.value = await apiService.fetchMutationLists();
    } catch (e: any) {
      error.value = e.message || 'Failed to load mutation lists';
    } finally {
      loading.value = false;
    }
  };

  const addMutationList = async (name: string) => {
    loading.value = true;
    error.value = null;
    try {
      const newList = await apiService.createMutationList(name);
      mutationLists.value.push(newList);
      loadMutationLists();
      return newList;
    } catch (e: any) {
      error.value = e.message || 'Failed to create mutation list';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateMutationList = async (
    id: string,
    name: string,
    description: string
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedList = await apiService.updateMutationList(
        id,
        name,
        description
      );
      const index = mutationLists.value.findIndex((list) => list.name === id);
      if (index !== -1) {
        mutationLists.value[index] = updatedList;
      }
      return updatedList;
    } catch (e: any) {
      error.value = e.message || 'Failed to update mutation list';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteMutationList = async (name: string) => {
    loading.value = true;
    error.value = null;
    try {
      await apiService.deleteMutationList(name);
      mutationLists.value = mutationLists.value.filter(
        (list) => list.name !== name
      );
      if (selectedListName.value === name) {
        selectedListName.value = null;
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to delete mutation list';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const addMutationToList = async (listName: string, mutationName: string) => {
    loading.value = true;
    error.value = null;

    try {
      // Находим список по имени
      const list = mutationLists.value.find((list) => list.name === listName);
      if (!list) {
        throw new Error('List not found');
      }

      // Получаем текущие мутации из списка
      const currentMutations = [...list.mutations];

      // Добавляем новую мутацию, если её ещё нет в списке
      if (!currentMutations.includes(mutationName)) {
        currentMutations.push(mutationName);
      }

      // Вызываем API с правильными аргументами: именем списка и массивом мутаций
      await apiService.addMutationToList(listName, currentMutations);

      // Обновляем список мутаций в store
      const listIndex = mutationLists.value.findIndex(
        (list) => list.name === listName
      );
      if (listIndex !== -1) {
        if (!mutationLists.value[listIndex].mutations.includes(mutationName)) {
          mutationLists.value[listIndex].mutations.push(mutationName);
        }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to add mutation to list';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const removeMutationFromList = async (
    listName: string,
    mutationName: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const list = mutationLists.value.find((list) => list.name === listName);
      if (!list) {
        throw new Error('List not found');
      }

      await apiService.removeMutationFromList(list.name, [mutationName]);

      const listIndex = mutationLists.value.findIndex(
        (list) => list.name === listName
      );
      if (listIndex !== -1) {
        mutationLists.value[listIndex].mutations = mutationLists.value[
          listIndex
        ].mutations.filter((id) => id !== mutationName);
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to remove mutation from list';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const setSelectedList = (name: string | null) => {
    selectedListName.value = name;
  };

  const setFilterText = (text: string) => {
    filterText.value = text;
  };

  return {
    mutations,
    mutationLists,
    selectedListName,
    selectedList,
    filterText,
    filteredMutations,
    mutationsInSelectedList,
    mutationsNotInSelectedList,
    loading,
    error,
    totalMutations,
    currentPage,
    pageSize,
    hasMoreMutations,
    loadMutations,
    loadMutationLists,
    addMutationList,
    updateMutationList,
    deleteMutationList,
    addMutationToList,
    removeMutationFromList,
    setSelectedList,
    setFilterText,
  };
});
