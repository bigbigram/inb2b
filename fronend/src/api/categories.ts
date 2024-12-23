import axios from 'axios';
import type { Category, CategoryResponse } from '../types/category';

const api = axios.create({
  baseURL: 'https://ecom.indob2c.com/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<CategoryResponse>('/category.php');

    if (!response.data) {
      throw new Error('No data received from API');
    }

    // If the data is directly an array of categories
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // If the data is wrapped in a success/data structure
    if (response.data.data) {
      return response.data.data;
    }

    throw new Error('Invalid response format');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Network error occurred');
    }
    throw error;
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const categories = await getCategories();
    return categories.find(cat => cat.id === id) || null;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
}
