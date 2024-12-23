import axios from 'axios';
import type { Product, ProductWithParsedData, CategoryProduct, CategoryProductResponse, Category, CategoryPrice } from '../types/product';

const api = axios.create({
  baseURL: 'https://ecom.indob2c.com/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      throw new Error('Received HTML instead of JSON. API endpoint might be incorrect.');
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
      throw new Error('Received HTML instead of JSON. API endpoint might be incorrect.');
    }
    return Promise.reject(error);
  }
);

// Add retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryRequest = async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error)) {
      console.log(`Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

const parseImageUrls = (imgs: string | string[] | undefined): string[] => {
  if (!imgs) return [];
  if (Array.isArray(imgs)) return imgs;
  try {
    // Try parsing as JSON string
    const parsed = JSON.parse(imgs);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    // If not JSON, split by comma if it's a comma-separated string
    if (typeof imgs === 'string' && imgs.includes(',')) {
      return imgs.split(',').map(url => url.trim());
    }
    // If single URL, return as array
    return [imgs];
  }
};

const parseProduct = (product: any): ProductWithParsedData => {
  try {
    // Parse main_imgs
    const mainImgs = parseImageUrls(product.main_imgs);

    // Parse prices
    let prices = [];
    if (typeof product.prices === 'string') {
      try {
        prices = JSON.parse(product.prices.replace(/\\/g, ''));
      } catch {
        prices = [{ beginAmount: "1", price: product.price_min }];
      }
    } else if (Array.isArray(product.prices)) {
      prices = product.prices;
    }

    // Parse sizes
    const sizes = parseImageUrls(product.sizes);

    // Ensure we have images array for the frontend
    const images = mainImgs.length > 0 ? mainImgs : 
                  parseImageUrls(product.images) || 
                  (product.main_image ? [product.main_image] : []);

    return {
      ...product,
      id: product.id?.toString() || product.item_id?.toString() || '',
      item_id: product.id?.toString() || product.item_id?.toString() || '', // Add this for compatibility
      main_imgs: mainImgs,
      images: images, // Add this for the frontend
      thumbnail: images[0] || '', // Add this for the frontend
      prices: prices,
      sizes: sizes,
      name: product.name || product.title || '',
      title: product.name || product.title || '', // Add this for compatibility
      price_min: parseFloat(product.price_min || '0'),
      price_max: parseFloat(product.price_max || '0'),
      sale_count: parseInt(product.sale_count || '0', 10),
      category_id: product.category_id?.toString() || '',
      description: product.description || '',
      specifications: product.specifications || [],
      rating: parseFloat(product.rating || '0'),
      review_count: parseInt(product.review_count || '0', 10),
      stock: parseInt(product.stock || '0', 10)
    };
  } catch (error) {
    console.error('Error parsing product:', error, product);
    throw error;
  }
};

export const getProducts = async (
  page: number = 1,
  limit: number = 12
): Promise<ProductWithParsedData[]> => {
  try {
    console.log(`Fetching products - page: ${page}, limit: ${limit}`);
    
    const response = await retryRequest(() => 
      api.get('/products.php', {
        params: { page, limit }
      })
    );
    
    // Debug logs for API response
    console.log('Products API Response:', {
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      data: response.data
    });

    let products: any[] = [];
    
    // Handle different API response formats
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        products = response.data.items;
      }
    }

    if (!products.length) {
      console.warn('No products found in API response:', response.data);
    }

    return products
      .filter(product => product && typeof product === 'object')
      .map(product => {
        try {
          return parseProduct(product);
        } catch (e) {
          console.error('Error parsing product:', e, product);
          return null;
        }
      })
      .filter((product): product is ProductWithParsedData => product !== null);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id: string | number): Promise<ProductWithParsedData | null> => {
  try {
    const response = await retryRequest(() => 
      api.get(`/productdetails.php?id=${id}`)
    );
    return parseProduct(response.data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

export async function getProductsByCategory(categoryId: string | number): Promise<CategoryProduct[]> {
  try {
    const response = await retryRequest(() => 
      api.get<CategoryProductResponse>(`/productByCategory.php`, {
        params: {
          cate_id: categoryId
        }
      })
    );

    if (!response.data) {
      throw new Error('No data received from API');
    }

    // Parse the main_imgs and prices strings into arrays/objects
    return response.data.data.map(product => {
      try {
        // Safely parse main_imgs
        let cleanMainImgs: string[] = [];
        const mainImgs = product.main_imgs as string | string[] | undefined;
        
        if (typeof mainImgs === 'string' && mainImgs) {
          try {
            const parsed = JSON.parse(mainImgs.replace(/\\/g, ''));
            cleanMainImgs = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            cleanMainImgs = [];
          }
        } else if (Array.isArray(mainImgs)) {
          cleanMainImgs = mainImgs.map(img => 
            typeof img === 'string' ? img.replace(/[\[\]"\\]/g, '') : ''
          ).filter(Boolean);
        }

        // Safely parse prices
        let cleanPrices: CategoryPrice[] = [];
        const prices = product.prices;
        
        if (typeof prices === 'string') {
          try {
            const cleanPriceString = prices.replace(/\\/g, '');
            const parsedPrices = JSON.parse(cleanPriceString);
            cleanPrices = Array.isArray(parsedPrices) ? parsedPrices : [];
          } catch {
            cleanPrices = [{ beginAmount: "1", price: product.price_min }];
          }
        } else if (Array.isArray(prices)) {
          cleanPrices = prices;
        }
        // Safely parse sizes
        let cleanSizes: string[] = [];
        const sizes = product.sizes as string | string[] | undefined;
        
        if (typeof sizes === 'string' && sizes) {
          try {
            const parsed = JSON.parse(sizes.replace(/\\/g, ''));
            cleanSizes = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            cleanSizes = [];
          }
        } else if (Array.isArray(sizes)) {
          cleanSizes = sizes;
        }

        return {
          ...product,
          main_imgs: cleanMainImgs,
          prices: cleanPrices,
          sizes: cleanSizes
        };
      } catch (error) {
        console.error('Error parsing product data:', error);
        return {
          ...product,
          main_imgs: [],
          prices: [{ beginAmount: "1", price: product.price_min }],
          sizes: []
        };
      }
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await retryRequest(() => 
      api.get('/category.php')
    );
    console.log('Categories API Response:', response.data);

    if (!response.data) {
      console.error('No data in API response');
      return [];
    }

    // Handle both array and object responses
    const rawCategories = Array.isArray(response.data) ? response.data : [response.data];
    
    return rawCategories
      .filter(category => category && typeof category === 'object' && (category.cate_id || category.id))
      .map(category => {
        const cateId = (category.cate_id || category.id || '').toString();
        console.log('Processing category:', { raw: category, parsedId: cateId });
        
        return {
          cate_id: cateId,
          cate_name: category.cate_name || category.name || 'Unnamed Category',
          image_url: category.cate_image || category.image_url || '/placeholder-category.jpg',
          cate_image: category.cate_image || category.image_url || '/placeholder-category.jpg',
          product_count: parseInt(category.product_count || '0', 10),
          parent_id: category.parent_id ? category.parent_id.toString() : null
        };
      })
      .filter(category => category.cate_id); // Filter out any categories without IDs
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getFlashDeals = async (): Promise<ProductWithParsedData[]> => {
  try {
    const response = await retryRequest(() => 
      api.get('/products.php', {
        params: { 
          limit: 16,
          page: 1,
          sort: 'random'
        }
      })
    );
    
    let products: Product[] = [];
    
    // Handle different API response formats
    if (Array.isArray(response.data)) {
      products = response.data;
    } else if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        products = response.data.items;
      }
    }

    // Take only the first 16 products
    products = products.slice(0, 16);

    return products
      .filter(product => product && typeof product === 'object')
      .map(product => {
        try {
          return parseProduct(product);
        } catch (e) {
          console.error('Error parsing product:', e, product);
          return null;
        }
      })
      .filter((product): product is ProductWithParsedData => product !== null);
  } catch (error) {
    console.error('Error fetching flash deals:', error);
    throw error;
  }
};