<template>
    <div class="modal" @keydown.esc="close">
      <div class="modal-content">
        <h2>Добавьте новый список</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Имя: <span class="required">*</span></label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name"
              ref="nameInput"
              :class="{ 'error': nameError }"
              required
            />
            <span class="error-message" v-if="nameError">{{ nameError }}</span>
          </div>
  
          <div class="form-group">
            <label for="description">Описание:</label>
            <textarea 
              id="description" 
              v-model="formData.description"
              rows="3"
            ></textarea>
          </div>
  
          <div class="button-group">
            <button 
              type="submit" 
              :disabled="isLoading || !isValid"
            >
              {{ isLoading ? 'Creating...' : 'Создать' }}
            </button>
            <button 
              type="button" 
              @click="resetForm"
            >
              Очистить
            </button>
            <button 
              type="button" 
              @click="close"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useMutationStore } from '../stores/mutationStore';
  
  interface FormData {
    name: string;
    description: string;
  }
  
  const store = useMutationStore();
  const nameInput = ref<HTMLInputElement | null>(null);
  const isLoading = ref(false);
  const nameError = ref('');
  
  const formData = reactive<FormData>({
    name: '',
    description: ''
  });
  
  const isValid = computed(() => {
    return formData.name.trim().length > 0;
  });
  
  const emit = defineEmits(['close', 'add-list']);
  
  onMounted(() => {
    nameInput.value?.focus();
  });
  
  const validateName = (): boolean => {
    const exists = store.mutationLists.some(
      list => list.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    
    if (exists) {
      nameError.value = 'A list with this name already exists';
      return false;
    }
    
    nameError.value = '';
    return true;
  };
  
  const handleSubmit = async () => {
    if (!isValid.value || !validateName()) return;
    
    isLoading.value = true;
    try {
      await emit('add-list', formData.name.trim(), formData.description.trim());
      resetForm();
      emit('close');
    } finally {
      isLoading.value = false;
    }
  };
  
  const resetForm = () => {
    formData.name = '';
    formData.description = '';
    nameError.value = '';
    nameInput.value?.focus();
  };
  
  const close = () => {
    emit('close');
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .required {
    color: #dc3545;
  }
  
  input[type="text"],
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  input.error {
    border-color: #dc3545;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 4px;
    display: block;
  }
  
  .button-group {
    display: flex;
    gap: 8px;
    margin-top: 24px;
  }
  
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  
  button[type="submit"] {
    background-color: #0d6efd;
    color: white;
  }
  
  button[type="submit"]:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  button[type="button"] {
    background-color: #6c757d;
    color: white;
  }
  </style>
  