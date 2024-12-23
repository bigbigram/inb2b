// This file is now written in TypeScript instead of PHP
import axios from 'axios';
import type { ProductSku } from '../types/product';

const api = axios.create({
  // Use relative URL to work with Vite proxy
  baseURL: 'https://ecom.indob2c.com/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

const parseSku = (sku: any): ProductSku => {
  // Parse stock with validation
  let stock = 0;
  if (sku.quantity !== undefined) {
    stock = typeof sku.quantity === 'string' ? parseInt(sku.quantity) : Number(sku.quantity);
  } else if (sku.stock !== undefined) {
    stock = typeof sku.stock === 'string' ? parseInt(sku.stock) : Number(sku.stock);
  }

  // Validate stock number
  if (isNaN(stock) || stock < 0) {
    console.warn('Invalid stock value:', { raw: sku.stock || sku.quantity, parsed: stock });
    stock = 0;
  }

  // Normalize stock values
  if (stock === 1000 || (stock === 100 && sku.props_names?.includes('➴'))) {
    // For cases where all SKUs show same high number, normalize to "in stock"
    stock = 999;
  }

  // Parse props_names for color and size
  let color = '';
  let size = '';
  if (sku.props_names) {
    const props = sku.props_names.split(';');
    props.forEach((prop: string) => {
      const [key, value] = prop.split(':');
      if (key.includes('颜色')) {
        color = value.replace(/[➴↟↸✵☾♵⠞⢗]/g, ''); // Remove special characters
      } else if (key.includes('尺码')) {
        size = value.replace(/[➴↟↸✵☾♵⠞⢗]/g, ''); // Remove special characters
      }
    });
  }

  const parsedSku = {
    sku_id: sku.sku_id?.toString() || '',
    color: color,
    size: size,
    stock: stock,
    price: parseFloat(sku.price || '0'),
    color_images: Array.isArray(sku.color_images) ? sku.color_images : []
  };

  console.log('Parsed SKU:', {
    ...parsedSku,
    raw_stock: sku.stock,
    props_names: sku.props_names
  });
  
  return parsedSku;
};

export const getProductSku = async (itemId: number): Promise<ProductSku[]> => {
  try {
    console.log(`Fetching SKUs for item ${itemId}`);
    const response = await api.get('/productSku.php', {
      params: { item_id: itemId }
    });
    
    // Handle both array and single object responses
    const skuData = response.data;
    const skus = Array.isArray(skuData) ? skuData : [skuData].filter(Boolean);
    
    const parsedSkus = skus.map(parseSku);
    console.log(`Parsed SKUs for ${itemId}:`, parsedSkus.map(sku => ({
      color: sku.color,
      size: sku.size,
      stock: sku.stock
    })));
    
    return parsedSkus;
  } catch (error) {
    console.error('Failed to fetch product SKU:', error);
    return [];
  }
};
