import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw, 
  type NavigationGuardNext, 
  type RouteLocationNormalized,
  type RouterScrollBehavior
} from 'vue-router'
import AuthService from '../services/AuthService'
import { useAuthStore } from '@/stores/auth.store'

// Import views
import Home from '../views/Home.vue'
import LoginView from '../views/Login.vue'
import RegisterView from '../views/Register.vue'
import About from '../views/About.vue'
import Profile from '../views/Profile.vue'
import CategoryView from '../views/CategoryView.vue'
import ProductDetail from '../views/ProductDetail.vue'
import CartView from '../views/CartView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import Shop from '../views/Shop.vue'
import Terms from '../views/Terms.vue'
import Privacy from '../views/Privacy.vue'
import Contact from '../views/Contact.vue'
import TrackOrder from '../views/TrackOrder.vue'
import Help from '../views/Help.vue'
import Wishlist from '../views/Wishlist.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import FlashDeals from '../views/FlashDeals.vue'
import Orders from '../views/Orders.vue'
import OrderConfirmation from '../views/OrderConfirmation.vue'
import OrderDetailsView from '../views/OrderDetailsView.vue'

// Extend the meta fields type
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    requiresGuest?: boolean
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Home' }
  },
  {
    path: '/flash-deals',
    name: 'flash-deals',
    component: FlashDeals,
    meta: { title: 'Flash Deals' }
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesView,
    meta: { title: 'Categories' }
  },
  {
    path: '/category',
    name: 'category',
    component: CategoryView,
    meta: { title: 'Category' }
  },
  {
    path: '/shop',
    name: 'shop',
    component: Shop,
    meta: { title: 'Shop' }
  },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetail,
    meta: { title: 'Product Details' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { title: 'Shopping Cart' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
    meta: { requiresAuth: true, title: 'Checkout' }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: Wishlist,
    meta: { requiresAuth: true, title: 'Wishlist' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: Orders,
    meta: { requiresAuth: true, title: 'Orders' }
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: () => import('@/views/OrderDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/track-order',
    name: 'track-order',
    component: () => import('@/views/TrackOrderView.vue')
  },
  {
    path: '/track-order/:orderNumber',
    name: 'track-order-detail',
    component: () => import('@/views/TrackOrderView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true, title: 'Profile' }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: 'About Us' }
  },
  {
    path: '/terms',
    name: 'terms',
    component: Terms,
    meta: { title: 'Terms and Conditions' }
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: Privacy,
    meta: { title: 'Privacy Policy' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    meta: { title: 'Contact Us' }
  },
  {
    path: '/track-order',
    name: 'track-order',
    component: TrackOrder,
    meta: { title: 'Track Order' }
  },
  {
    path: '/help',
    name: 'help',
    component: Help,
    meta: { title: 'Help' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true, title: 'Register' }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { requiresGuest: true, title: 'Forgot Password' }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, title: 'Admin Dashboard' }
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'OrderConfirmation',
    component: OrderConfirmation,
    meta: { requiresAuth: true, title: 'Order Confirmation' }
  },
  {
    path: '/orders/:orderNumber',
    name: 'OrderDetails',
    component: OrderDetailsView,
    meta: { requiresAuth: true }
  },
  // Support Page
  {
    path: '/support',
    name: 'Support',
    component: () => import('@/views/SupportView.vue'),
    meta: { 
      title: 'Customer Support',
      requiresAuth: false 
    }
  },

  // Blog Page
  {
    path: '/blog',
    name: 'Blog',
    component: () => import('@/views/BlogView.vue'),
    meta: { 
      title: 'Blog',
      requiresAuth: false 
    }
  },

  // Careers Page
  {
    path: '/careers',
    name: 'Careers',
    component: () => import('@/views/CareersView.vue'),
    meta: { 
      title: 'Careers',
      requiresAuth: false 
    }
  },

  // Partners Page
  {
    path: '/partners',
    name: 'Partners',
    component: () => import('@/views/PartnersView.vue'),
    meta: { 
      title: 'Our Partners',
      requiresAuth: false 
    }
  },

  // Shipping Information Page
  {
    path: '/shipping',
    name: 'Shipping',
    component: () => import('@/views/ShippingView.vue'),
    meta: { 
      title: 'Shipping Information',
      requiresAuth: false 
    }
  },
]

const scrollBehavior: RouterScrollBehavior = (to, _from, savedPosition) => {
  // Update document title if available
  if (to.meta.title) {
    document.title = `${to.meta.title} - Your Store Name`;
  }

  // Handle scroll position
  if (savedPosition) {
    return savedPosition;
  } else {
    return { top: 0 };
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Redirect to home if route not found
  if (to.matched.length === 0) {
    console.warn('No route found for:', to.path);
    next('/');
    return;
  }

  // Authentication checks
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/');
    return;
  }

  next();
});

export default router
