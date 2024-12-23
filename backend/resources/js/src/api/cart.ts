import { ref, watch } from 'vue';

export interface CartItem {
  productId: number;
  color: string;
  size: string;
  quantity: number;
  title?: string;
  price?: string;
  image?: string;
}

interface Cart {
  items: CartItem[];
  total: number;
}

// Create a reactive cart store
const cart = ref<Cart>({
  items: [],
  total: 0,
});

// Watch for cart changes and save to localStorage
watch(cart, (newCart) => {
  console.log('Cart changed, saving to localStorage:', newCart);
  saveCart();
}, { deep: true });

// Load cart from localStorage if available
const loadCart = () => {
  console.log('Loading cart from localStorage');
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      cart.value = parsedCart;
      console.log('Loaded cart:', cart.value);
    } catch (e) {
      console.error('Error loading cart:', e);
      // Initialize empty cart if loading fails
      cart.value = { items: [], total: 0 };
    }
  } else {
    console.log('No cart found in localStorage');
  }
};

// Save cart to localStorage
const saveCart = () => {
  try {
    const cartString = JSON.stringify(cart.value);
    localStorage.setItem('cart', cartString);
    console.log('Saved cart to localStorage:', cartString);
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

// Add items to cart
export const addToCart = (items: CartItem[]) => {
  console.log('Adding items to cart:', items);
  
  if (!Array.isArray(cart.value.items)) {
    cart.value.items = [];
  }

  items.forEach(newItem => {
    if (!newItem.productId || !newItem.color || !newItem.size || !newItem.quantity) {
      console.error('Invalid item:', newItem);
      return;
    }

    const existingItemIndex = cart.value.items.findIndex(
      item => 
        item.productId === newItem.productId && 
        item.color === newItem.color && 
        item.size === newItem.size
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      cart.value.items[existingItemIndex].quantity += newItem.quantity;
      console.log('Updated existing item:', cart.value.items[existingItemIndex]);
    } else {
      // Add new item
      cart.value.items.push({ ...newItem });
      console.log('Added new item:', newItem);
    }
  });

  // Recalculate total
  cart.value.total = cart.value.items.reduce(
    (sum, item) => sum + (parseFloat(item.price || '0') * item.quantity), 
    0
  );

  // Force save to localStorage
  saveCart();
  
  console.log('Final cart state:', cart.value);
  return cart.value;
};

// Get cart contents
export const getCart = () => {
  console.log('Getting cart:', cart.value);
  return cart.value;
};

// Clear cart
export const clearCart = () => {
  cart.value = { items: [], total: 0 };
  saveCart();
};

// Initialize cart on module load
loadCart();
