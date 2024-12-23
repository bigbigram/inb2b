// Custom interface for enhanced notification options
export interface EnhancedNotificationOptions extends NotificationOptions {
  onClick?: () => void;
  data?: any;
}

// Define status types for better type safety
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'success' | 'failed' | 'pending';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private notificationSound: HTMLAudioElement;
  private notificationIcon = '/src/assets/logo.png'; // Update with your logo path
  private notificationBadge = '/src/assets/logo-small.png'; // Update with your small logo path
  private hasUserInteracted = false;

  private constructor() {
    // Only check if notifications are supported
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    this.notificationSound = new Audio('/src/assets/notifications/notification-sound.mp3');
    
    // Listen for user interaction
    const markUserInteraction = () => {
      this.hasUserInteracted = true;
      // Remove listeners after first interaction
      document.removeEventListener('click', markUserInteraction);
      document.removeEventListener('keydown', markUserInteraction);
      document.removeEventListener('touchstart', markUserInteraction);
    };

    document.addEventListener('click', markUserInteraction);
    document.addEventListener('keydown', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction);
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  private async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    return this.permission === 'granted';
  }

  private async playNotificationSound(): Promise<void> {
    try {
      // Only play sound if user has interacted with the page
      if (this.hasUserInteracted) {
        // Reset the audio to the beginning if it's already playing
        this.notificationSound.currentTime = 0;
        await this.notificationSound.play();
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public async showNotification(title: string, options: EnhancedNotificationOptions = {}): Promise<boolean> {
    const hasPermission = await this.checkPermission();
    
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return false;
    }

    try {
      // Store onClick handler separately as it's not cloneable
      const onClickHandler = options.onClick;
      const { onClick, ...notificationOptions } = options;

      // Basic notification options without non-cloneable data
      const enhancedOptions: NotificationOptions = {
        icon: this.notificationIcon,
        badge: this.notificationBadge,
        tag: 'new-items',
        ...notificationOptions,
        // Ensure data is cloneable by converting to simple objects
        data: options.data ? JSON.parse(JSON.stringify(options.data)) : undefined
      };

      const notification = new Notification(title, enhancedOptions);

      // Play sound
      await this.playNotificationSound();

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (onClickHandler) onClickHandler();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  public async notifyNewProducts(products: any[]): Promise<void> {
    const firstProduct = products[0];
    const remainingCount = products.length - 1;
    
    const productData = {
      id: firstProduct.id,
      name: firstProduct.name,
      totalCount: products.length
    };
    
    await this.showNotification('New Products Available! 🆕', {
      body: `${firstProduct.name} ${remainingCount > 0 ? `and ${remainingCount} more items` : ''} added to our catalog`,
      tag: 'new-products',
      data: { type: 'new-products', product: productData },
      onClick: () => window.location.href = '/products?filter=new'
    } as EnhancedNotificationOptions);
  }

  public async notifyPriceDrops(products: any[]): Promise<void> {
    const firstProduct = products[0];
    const remainingCount = products.length - 1;
    
    const productData = {
      id: firstProduct.id,
      name: firstProduct.name,
      totalCount: products.length
    };
    
    await this.showNotification('Price Drop Alert! 💰', {
      body: `${firstProduct.name} ${remainingCount > 0 ? `and ${remainingCount} more items` : ''} now at better prices`,
      tag: 'price-drops',
      data: { type: 'price-drops', product: productData },
      onClick: () => window.location.href = '/products?filter=price-drops'
    } as EnhancedNotificationOptions);
  }

  public async notifyLowStock(products: any[]): Promise<void> {
    const firstProduct = products[0];
    const remainingCount = products.length - 1;
    
    const productData = {
      id: firstProduct.id,
      name: firstProduct.name,
      totalCount: products.length
    };
    
    await this.showNotification('Low Stock Alert! ⚠️', {
      body: `${firstProduct.name} ${remainingCount > 0 ? `and ${remainingCount} more items` : ''} are running low`,
      tag: 'low-stock',
      data: { type: 'low-stock', product: productData },
      onClick: () => window.location.href = '/products?filter=low-stock'
    } as EnhancedNotificationOptions);
  }

  public async notifyOrderStatus(order: { id: string; status: OrderStatus }): Promise<void> {
    const statusEmoji: Record<OrderStatus, string> = {
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };

    await this.showNotification(`Order Update ${statusEmoji[order.status] || '📋'}`, {
      body: `Order #${order.id} is now ${order.status}`,
      tag: `order-${order.id}`,
      data: { type: 'order-status', order: { id: order.id, status: order.status } },
      onClick: () => window.location.href = `/track-order/${order.id}`
    } as EnhancedNotificationOptions);
  }

  public async notifyBulkDiscount(discount: any): Promise<void> {
    await this.showNotification('Bulk Discount Available! 🏷️', {
      body: `Save ${discount.percentage}% when you buy ${discount.minQuantity}+ items`,
      tag: 'bulk-discount',
      data: { type: 'bulk-discount', discount: { id: discount.id, percentage: discount.percentage, minQuantity: discount.minQuantity } },
      onClick: () => window.location.href = '/products?filter=bulk-discount'
    } as EnhancedNotificationOptions);
  }

  public async notifySpecialOffer(offer: any): Promise<void> {
    await this.showNotification('Special Offer! 🎉', {
      body: offer.description,
      tag: `offer-${offer.id}`,
      data: { type: 'special-offer', offer: { id: offer.id, title: offer.title } },
      onClick: () => window.location.href = `/offers/${offer.id}`
    } as EnhancedNotificationOptions);
  }

  public async notifyPaymentStatus(payment: { id: string; orderId: string; status: PaymentStatus }): Promise<void> {
    const statusEmoji: Record<PaymentStatus, string> = {
      'success': '✅',
      'failed': '❌',
      'pending': '⏳'
    };

    await this.showNotification(`Payment Update ${statusEmoji[payment.status] || '💳'}`, {
      body: `Payment for Order #${payment.orderId} ${payment.status}`,
      tag: `payment-${payment.id}`,
      data: { type: 'payment-status', payment: { id: payment.id, orderId: payment.orderId, status: payment.status } },
      onClick: () => window.location.href = `/orders/${payment.orderId}`
    } as EnhancedNotificationOptions);
  }

  public async notifyRestockAlert(product: any): Promise<void> {
    await this.showNotification('Back in Stock! 📦', {
      body: `${product.name} is now available`,
      tag: `restock-${product.id}`,
      data: { type: 'restock', product },
      onClick: () => window.location.href = `/products/${product.id}`
    } as EnhancedNotificationOptions);
  }

  public async notifyQuoteRequest(quote: any): Promise<void> {
    await this.showNotification('New Quote Request 📝', {
      body: `Quote request received for ${quote.productName}`,
      tag: `quote-${quote.id}`,
      data: { type: 'quote-request', quote },
      onClick: () => window.location.href = `/quotes/${quote.id}`
    } as EnhancedNotificationOptions);
  }

  public async notifyShippingUpdate(shipment: any): Promise<void> {
    await this.showNotification('Shipping Update 🚚', {
      body: `${shipment.status} - Order #${shipment.orderId}`,
      tag: `shipping-${shipment.id}`,
      data: { type: 'shipping', shipment },
      onClick: () => window.location.href = `/track-order/${shipment.orderId}`
    } as EnhancedNotificationOptions);
  }

  // Enhanced checkNewItems with more detailed notifications
  public checkNewItems(items: any[]): void {
    const lastChecked = localStorage.getItem('lastCheckedItems');
    const lastItemIds = lastChecked ? JSON.parse(lastChecked) : [];
    
    const currentItemIds = items.map(item => item.id);
    const newItems = items.filter(item => !lastItemIds.includes(item.id));

    if (newItems.length > 0) {
      // Create a more detailed notification message
      const firstItem = newItems[0];
      const remainingCount = newItems.length - 1;
      
      let notificationBody = `New: ${firstItem.name}`;
      if (remainingCount > 0) {
        notificationBody += `\nand ${remainingCount} more item${remainingCount > 1 ? 's' : ''}`;
      }

      // Show notification with enhanced options
      this.showNotification('New Products Available! 🎉', {
        body: notificationBody,
        tag: 'new-items',
        data: {
          items: newItems,
          timestamp: new Date().toISOString()
        },
        onClick: () => {
          // Navigate to products page with filter for new items
          window.location.href = '/products?filter=new';
        }
      });
    }

    localStorage.setItem('lastCheckedItems', JSON.stringify(currentItemIds));
  }

  // Method to clear notification history
  public clearHistory(): void {
    localStorage.removeItem('lastCheckedItems');
  }

  // Method to disable notifications
  public async disableNotifications(): Promise<void> {
    localStorage.setItem('notificationsDisabled', 'true');
  }

  // Method to enable notifications
  public async enableNotifications(): Promise<void> {
    localStorage.removeItem('notificationsDisabled');
    await this.requestPermission();
  }

  // Check if notifications are enabled
  public isEnabled(): boolean {
    return !localStorage.getItem('notificationsDisabled') && this.permission === 'granted';
  }
}

export default NotificationService;
