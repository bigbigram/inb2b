import axios from 'axios';
// import type { Product } from '../types';  // Removed unused import

const BASE_URL = 'https://ecom.indob2c.com/api/productdetails.php';
const SKU_URL = 'https://ecom.indob2c.com/api/productSku.php';

export const getProductDetails = async (itemId: string | number) => {
  try {
    console.log('Fetching product details for ID:', itemId);
    const response = await axios.get(`${BASE_URL}?item_id=${itemId}`);
    console.log('Product details response:', response);

    if (!response.data) {
      throw new Error('No data received from product details API');
    }

    // Process response to include rates with consistent naming
    const processedData = {
      ...response.data,
      tax_rate: response.data.tax_rate || response.data.taxRate || response.data.tax || '0',
      taxRate: response.data.tax_rate || response.data.taxRate || response.data.tax || '0',
      logistic_rate: response.data.logistic_rate || response.data.logistic || response.data.logisticRate || '0',
      logistic: response.data.logistic_rate || response.data.logistic || response.data.logisticRate || '0',
      unit_weight: response.data.unit_weight || response.data.unitWeight || '0'
    };

    console.log('Processed product data with rates:', {
      original: {
        tax_rate: response.data.tax_rate,
        taxRate: response.data.taxRate,
        tax: response.data.tax,
        logistic_rate: response.data.logistic_rate,
        logistic: response.data.logistic,
        logisticRate: response.data.logisticRate,
        unit_weight: response.data.unit_weight,
        unitWeight: response.data.unitWeight
      },
      processed: {
        tax_rate: processedData.tax_rate,
        taxRate: processedData.taxRate,
        logistic_rate: processedData.logistic_rate,
        logistic: processedData.logistic,
        unit_weight: processedData.unit_weight
      }
    });

    return processedData;
  } catch (error) {
    console.error('Failed to fetch product details:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch product details: ${error.message}`);
    }
    throw error;
  }
};

export const getProductSkus = async (itemId: string | number) => {
  try {
    console.log('Fetching SKUs for ID:', itemId);
    const response = await axios.get(`${SKU_URL}?item_id=${itemId}`);
    console.log('SKUs response:', response);

    if (!response.data) {
      throw new Error('No data received from SKU API');
    }

    // Ensure we have an array of SKUs
    if (!Array.isArray(response.data)) {
      console.warn('SKU response is not an array:', response.data);
      return { data: [] };
    }

    return { data: response.data };
  } catch (error) {
    console.error('Failed to fetch product SKUs:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch product SKUs: ${error.message}`);
    }
    throw error;
  }
};
