<template>
  <div class="container" >
    <div class="header__row">      
      <button @click="toggleAllMutationsList">Все мутации </button> 
      <button @click="toggleMutationListSidebar">Ваши сохраненные списки : {{selectedListName}}</button>    
     
      
      
      
    </div>
    <MutationListSidebar 
          v-if="isMutationListSidebarVisible"
          :selectedListName="selectedListName" 
          @list-selected="onListSelected" 
          class="sidebar"
           @close="toggleMutationListSidebar"
        />
    
    <div class="main-content">
      <div class="main-content-left">
        <AllMutationsList
          v-if="isAllMutationsListVisible"
          :mutations="mutationStore.mutations"
          :loading="mutationStore.loading"
          :error="mutationStore.error"
        />
      </div>
      <div class="main-content-right">
        <MutationListPanel 
          v-if="selectedListName" 
          :selectedListName="selectedListName"        
        /> 
      </div>  
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MutationListSidebar from './components/MutationListSidebar.vue';
import MutationListPanel from './components/MutationListPanel.vue';
import AllMutationsList from './components/AllMutationsList.vue';
import { useMutationStore } from './stores/mutationStore';

const selectedListName = ref<string | null>(null);
const mutationStore = useMutationStore();
const isMutationListSidebarVisible = ref(false);
const isAllMutationsListVisible = ref(false);

const toggleMutationListSidebar = () => {
  isMutationListSidebarVisible.value = !isMutationListSidebarVisible.value;

};

const toggleAllMutationsList = () => {
  isAllMutationsListVisible.value = !isAllMutationsListVisible.value;

};


const onListSelected = (listName: string) => {  
  selectedListName.value = listName;
};

onMounted(() => {
  if (mutationStore.mutations.length === 0) {
    mutationStore.loadMutations();
  }

  mutationStore.loadMutationLists();

});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 95vh;
  overflow: hidden;
}

.header__row {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
}

.header__row button {
  min-width: 250px; 
  height: 40px; 
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 

  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid transparent; 
}


.header__row button:active {
  transform: none;
  box-shadow: none;
}


.main-content-right {
  width: 50%; 
  min-width: 50%;
}

.main-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  height: calc(100% - 5vh); 
  overflow: hidden;
}

.main-content-left {
  width: 50%; 
  padding: 0 10px;
  height: 100%;
  /* overflow-y: auto;  */
}
</style>
