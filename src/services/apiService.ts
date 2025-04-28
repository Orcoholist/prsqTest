import axios from 'axios';
import type { Mutation } from '../types/mutation';
import type { MutationList } from '../types/mutationList';

const API_URL = 'https://testapi1.parseq.pro/';

//Все мутации
//https://testapi1.parseq.pro/api/mutations?pageZeroBasedNumber=0&pageSize=20
export const fetchMutations = async (
  pageNumber: number = 0,
  pageSize: number = 20
): Promise<{ mutations: Mutation[]; totalCount: number }> => {
  try {
    const response = await axios.get<{
      page: { zeroBasedNumber: number; size: number };
      resources: Mutation[];
      resourcesTotalNumber: number;
    }>(`${API_URL}/mutations`, {
      params: {
        pageZeroBasedNumber: pageNumber,
        pageSize: pageSize,
      },
    });
    // console.log('Response:', response.data);

    return {
      mutations: response.data.resources || [],
      totalCount: response.data.resourcesTotalNumber || 0,
    };
  } catch (error) {
    console.error('Error fetching mutations:', error);
    throw error;
  }
};

// Список мутаций пользователя
// https://testapi1.parseq.pro/lists
export const fetchMutationLists = async (): Promise<MutationList[]> => {
  try {
    const response = await axios.get<MutationList[]>(`${API_URL}lists`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mutation lists:', error);
    throw error;
  }
};
// Создать новый список мутаций
// https://testapi1.parseq.pro/lists/create?name=testT
export const createMutationList = async (
  name: string
): Promise<MutationList> => {
  try {
    const response = await axios.post<{ list: MutationList }>(
      `${API_URL}lists/create?name=${name}`
    );

    return response.data.list;
  } catch (error) {
    console.error('Error creating mutation list:', error);
    throw error;
  }
};

// Изменить список мутаций
// https://testapi1.parseq.pro/lists/testT/mutations
export const updateMutationList = async (
  listId: string,
  name: string,
  description: string
): Promise<MutationList> => {
  try {
    const response = await axios.put<{ list: MutationList }>(
      `${API_URL}/lists/${name}/mutations`,
      {
        name,
        description,
      }
    );
    return response.data.list;
  } catch (error) {
    console.error('Error updating mutation list:', error);
    throw error;
  }
};

// Удалить список мутаций
// https://testapi1.parseq.pro/lists/test
export const deleteMutationList = async (listId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/lists/${listId}`);
  } catch (error) {
    console.error('Error deleting mutation list:', error);
    throw error;
  }
};

// Добавить новую мутацию в список
// https://testapi1.parseq.pro/lists/duplicate_test_list/mutations
export const addMutationToList = async (
  listName: string,
  mutations: string[]
): Promise<void> => {
  try {
    // Отправляем массив мутаций через PATCH
    await axios.patch(`${API_URL}lists/${listName}/mutations`, mutations);
  } catch (error) {
    console.error('Error adding mutations to list:', error);
    throw error;
  }
};

// Удалить мутацию из списка пользователя
// https://testapi1.parseq.pro/lists/testT/mutations
export const removeMutationFromList = async (
  mutationName: string,
  mutations: string[]
): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/lists/${mutationName}/mutations`, mutations);
  } catch (error) {
    console.error('Error removing mutation from list:', error);
    throw error;
  }
};
