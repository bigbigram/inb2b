import { defineStore } from 'pinia'

interface PriceRange {
  beginAmount: string;
  price: string;
}

interface ProductPricing {
  totalPrice: number;
  taxAmount: number;
  logisticAmount: number;
}

export interface PriceInputs {
  price: string | number;
  taxRate?: string | number;
  logisticRate?: string | number;
  unitWeight?: string | number;
  quantity?: string | number;
}

export const usePricingStore = defineStore('pricing', {
  state: () => ({
    cnyToBtnRate: 12, // Default fallback rate
    lastUpdated: new Date(),
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    needsUpdate(): boolean {
      // Update if last update was more than 24 hours ago
      const hoursSinceUpdate = (new Date().getTime() - this.lastUpdated.getTime()) / (1000 * 60 * 60);
      return hoursSinceUpdate > 24;
    }
  },

  actions: {
    parseNumber(value: any): number {
      if (value === undefined || value === null) return 0;
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(numValue) ? 0 : numValue;
    },

    roundPrice(value: number): number {
      return Math.ceil(Math.max(0, value));
    },

    calculateBasePrice(price: number | string): number {
      const basePrice = this.parseNumber(price);
      const convertedPrice = basePrice * this.cnyToBtnRate;
      return this.roundPrice(convertedPrice);
    },

    calculateTaxAmount(basePrice: number, taxRate: number | string): number {
      const numBasePrice = this.parseNumber(basePrice);
      const numTaxRate = this.parseNumber(taxRate);
      
      // Ensure tax rate is a reasonable percentage (0-25%)
      const sanitizedTaxRate = Math.min(Math.max(numTaxRate, 0), 25);
      
      const taxAmount = numBasePrice * (sanitizedTaxRate / 100);
      
      return this.roundPrice(taxAmount);
    },

    calculateLogisticsAmount(logisticRate: number | string, unitWeight: number | string): number {
      const numLogisticRate = this.parseNumber(logisticRate);
      const numUnitWeight = this.parseNumber(unitWeight);
      
      // Ensure logistics rate and weight are reasonable
      const sanitizedLogisticRate = Math.max(numLogisticRate, 0);
      const sanitizedUnitWeight = Math.max(numUnitWeight, 0);
      
      // Use a more moderate logistics calculation
      const logisticsAmount = sanitizedLogisticRate * sanitizedUnitWeight;
      
      return this.roundPrice(logisticsAmount);
    },

    getItemPrice(product: any, quantity: number = 1): number {
      console.group('🔍 Item Price Calculation Debug');
      console.log('Product Details:', product);

      let price = 0;
      
      // First, try direct price field
      if (product.price && !isNaN(parseFloat(product.price.toString()))) {
        price = parseFloat(product.price.toString());
        console.log('Price from direct price field:', price);
      }

      // Check price tiers if available
      if (product.prices && Array.isArray(product.prices)) {
        const applicablePriceTier = product.prices
          .sort((a: any, b: any) => parseInt(b.beginAmount) - parseInt(a.beginAmount))
          .find((tier: any) => quantity >= parseInt(tier.beginAmount));
        
        if (applicablePriceTier) {
          price = parseFloat(applicablePriceTier.price);
          console.log('Price from price tiers:', price, 'Tier:', applicablePriceTier);
        }
      }

      // Fallback to price_min if no other price found
      if (price === 0 && product.price_min) {
        price = parseFloat(product.price_min);
        console.log('Price from price_min:', price);
      }

      console.log('Final Calculated Price:', price);
      console.groupEnd();

      return price;
    },

    calculateStandardPrice(product: any, quantity: number = 1): number {
      console.group('🚨 DETAILED STANDARD PRICE CALCULATION');
      console.log('🔍 Full Product Object:', product);

      if (!product) {
        console.warn('❌ No product provided');
        console.groupEnd();
        return 0;
      }

      // Get base price using the same method as cart store
      const basePrice = this.getItemPrice(product, quantity);
      
      // Validate and convert price
      const btnBasePrice = this.calculateBasePrice(basePrice);
      
      // Calculate additional costs
      const taxRate = this.parseNumber(product.tax_rate || product.taxRate || 10);
      const logisticRate = this.parseNumber(product.logistic_rate || product.logistic || 50);
      const unitWeight = this.parseNumber(product.unit_weight || product.weight || 0.5);

      const taxAmount = this.calculateTaxAmount(btnBasePrice, taxRate);
      const logisticsAmount = this.calculateLogisticsAmount(logisticRate, unitWeight);

      const totalPrice = this.roundPrice(btnBasePrice + taxAmount + logisticsAmount);

      console.log('💸 Final Price Breakdown:', {
        basePrice: btnBasePrice,
        taxAmount: taxAmount,
        logisticsAmount: logisticsAmount,
        totalPrice: totalPrice
      });
      
      console.groupEnd();
      return totalPrice;
    },

    calculateTotalPrice(product: any, quantity: number = 1): number {
      if (!product) return 0;

      const basePrice = this.calculateBasePrice(product.price);
      if (!basePrice) return 0;

      const taxAmount = this.calculateTaxAmount(basePrice, product.taxRate);
      const logisticsAmount = this.calculateLogisticsAmount(product.logisticRate, product.unitWeight);

      return this.roundPrice((basePrice + taxAmount + logisticsAmount) * quantity);
    },

    formatStandardPrice(price: number): string {
      return price ? `Nu. ${price.toFixed(2)}` : 'Price not available';
    },

    formatPrice(price: number): string {
      return price ? `Nu. ${price.toFixed(2)}` : 'Price not available';
    },

    getDisplayRates(product: any) {
      return {
        tax: product.taxRate ? `${product.taxRate}%` : null,
        logistics: product.logisticRate ? `Nu. ${product.logisticRate}/kg` : null,
        weight: product.unitWeight ? `${product.unitWeight} kg` : null
      };
    },

    calculatePrice(inputs: PriceInputs): number {
      const basePrice = this.parseNumber(inputs.price);
      const taxRate = this.parseNumber(inputs.taxRate);
      const logisticRate = this.parseNumber(inputs.logisticRate);
      const unitWeight = this.parseNumber(inputs.unitWeight);
      const quantity = this.parseNumber(inputs.quantity);

      if (!this.cnyToBtnRate) {
        console.warn('Exchange rate not loaded from API');
        return 0;
      }

      const pricing = this.calculatePricing(
        basePrice,
        taxRate,
        logisticRate,
        unitWeight,
        quantity || 1
      );

      return pricing.totalPrice;
    },

    calculatePricing(
      price: number,
      taxRate: number,
      logisticRate: number,
      unitWeight: number,
      quantity: number
    ): ProductPricing {
      if (!this.cnyToBtnRate) {
        console.warn('Exchange rate not loaded from API');
        return {
          totalPrice: 0,
          taxAmount: 0,
          logisticAmount: 0
        };
      }

      const basePrice = this.roundPrice(price * this.cnyToBtnRate * quantity);
      const taxAmount = taxRate ? this.roundPrice((basePrice * taxRate) / 100) : 0;
      const logisticAmount = (logisticRate && unitWeight) 
        ? this.roundPrice(logisticRate * unitWeight * quantity) 
        : 0;
      const totalPrice = this.roundPrice(basePrice + taxAmount + logisticAmount);

      return {
        totalPrice: totalPrice,
        taxAmount: taxAmount,
        logisticAmount: logisticAmount
      };
    },

    calculateBulkPricing(
      prices: PriceRange[],
      taxRate: number,
      logisticRate: number,
      unitWeight: number
    ) {
      return prices.map(range => ({
        beginAmount: range.beginAmount,
        ...this.calculatePricing(
          Number(range.price),
          taxRate,
          logisticRate,
          unitWeight
        )
      }));
    },

    calculateTotalAmount(
      subtotal: number, 
      shippingCost: number, 
      taxAmount: number
    ): number {
      const numSubtotal = this.parseNumber(subtotal);
      const numShippingCost = this.parseNumber(shippingCost);
      const numTaxAmount = this.parseNumber(taxAmount);
      const totalAmount = numSubtotal + numShippingCost + numTaxAmount;
      return this.roundPrice(totalAmount);
    },

    calculateTotalTax(items: any[]): number {
      if (!Array.isArray(items) || items.length === 0) return 0;
      const totalTax = items.reduce((total, item) => {
        const itemTax = this.calculateTaxAmount(
          this.calculateBasePrice(item.price || item.unit_price), 
          item.tax_rate || 0
        );
        return total + itemTax;
      }, 0);
      return this.roundPrice(totalTax);
    },

    calculateShippingCost(items: any[]): number {
      if (!Array.isArray(items) || items.length === 0) return 0;
      const totalShipping = items.reduce((total, item) => {
        const itemShipping = this.calculateLogisticsAmount(
          item.logistic_rate || 0, 
          item.unit_weight || 0
        );
        return total + itemShipping;
      }, 0);
      return this.roundPrice(totalShipping);
    },

    calculateSubtotal(items: any[]): number {
      if (!Array.isArray(items) || items.length === 0) return 0;
      const subtotal = items.reduce((total, item) => {
        const itemPrice = this.calculateBasePrice(item.price || item.unit_price);
        return total + (itemPrice * this.parseNumber(item.quantity));
      }, 0);
      return this.roundPrice(subtotal);
    },

    updateExchangeRate: {
      async handler() {
        // Don't update if we've updated recently
        if (!this.needsUpdate) return;
        
        if (this.isLoading) return;

        this.isLoading = true;

        const DEFAULT_EXCHANGE_RATE = 12; 

        try {
          // First, try to get rate from localStorage
          const storedRate = localStorage.getItem('exchangeRate');
          if (storedRate) {
            try {
              const parsedStoredRate = JSON.parse(storedRate);
              const storedDate = new Date(parsedStoredRate.lastUpdated);
              const now = new Date();
              
              // Check if stored rate is less than 24 hours old
              if ((now.getTime() - storedDate.getTime()) < 24 * 60 * 60 * 1000) {
                this.cnyToBtnRate = parsedStoredRate.rate;
                this.lastUpdated = storedDate;
                return parsedStoredRate.rate;
              }
            } catch (parseError) {
              console.error('Error parsing stored exchange rate:', parseError);
            }
          }

          // Fetch from external API
          const API_KEY = '4214da0d2e6dfdb3c78926c1';
          const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/CNY/BTN`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.result === 'success') {
            this.cnyToBtnRate = data.conversion_rate || DEFAULT_EXCHANGE_RATE;
            this.lastUpdated = new Date();
            
            // Store in localStorage for future use
            localStorage.setItem('exchangeRate', JSON.stringify({
              rate: this.cnyToBtnRate,
              lastUpdated: this.lastUpdated.toISOString()
            }));
            
            console.group(' Exchange Rate Update');
            console.log('New Rate:', this.cnyToBtnRate);
            console.log('Last Updated:', this.lastUpdated);
            console.groupEnd();

            return this.cnyToBtnRate;
          } else {
            return DEFAULT_EXCHANGE_RATE;
          }
        } catch (error) {
          console.error(' Exchange Rate Update Failed', error);
          
          // Use default rate on failure
          this.cnyToBtnRate = DEFAULT_EXCHANGE_RATE;
          this.error = error instanceof Error ? error.message : 'Failed to update exchange rate';
          return DEFAULT_EXCHANGE_RATE;
        } finally {
          this.isLoading = false;
        }
      },
      deep: true
    },

    async init() {
      // Check if rate needs update or is not set
      if (this.needsUpdate || this.cnyToBtnRate <= 0) {
        try {
          await this.updateExchangeRate.handler();
        } catch (error) {
          console.error('Initialization failed:', error);
        }
      }
    },
  }
});
