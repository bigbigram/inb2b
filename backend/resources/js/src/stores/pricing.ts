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
    cnyToBtnRate: 0, // Will be set by API only
    lastUpdated: null as Date | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    needsUpdate(): boolean {
      if (!this.lastUpdated) return true;
      const twelveHours = 12 * 60 * 60 * 1000;
      return new Date().getTime() - this.lastUpdated.getTime() > twelveHours;
    }
  },

  actions: {
    parseNumber(value: string | number | undefined): number {
      if (value === undefined || value === null) return 0;
      const parsed = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(parsed) ? 0 : parsed;
    },

    // Utility method to round up to the nearest whole number
    roundPrice(value: number): number {
      return Math.ceil(value);
    },

    // Calculate base price in BTN
    calculateBasePrice(price: number | string): number {
      const basePrice = Number(price) || 0;
      return this.roundPrice(basePrice * this.cnyToBtnRate);
    },

    // Calculate tax amount
    calculateTaxAmount(basePrice: number, taxRate: number | string): number {
      const rate = Number(taxRate) || 0;
      return this.roundPrice((basePrice * rate) / 100);
    },

    // Calculate logistics amount
    calculateLogisticsAmount(logisticRate: number | string, unitWeight: number | string): number {
      const rate = Number(logisticRate) || 0;
      const weight = Number(unitWeight) || 0;
      return this.roundPrice(rate * weight);
    },

    // Standardized price calculation for all components
    calculateStandardPrice(product: any): number {
      if (!product) return 0;
      
      // Ensure we have a valid exchange rate
      if (!this.cnyToBtnRate) {
        console.warn('Exchange rate not loaded. Using default rate of 1');
        this.cnyToBtnRate = 1;
      }

      // Validate and normalize price inputs
      const validateNumericField = (value: any, defaultValue: number = 0): number => {
        if (value === undefined || value === null) return defaultValue;
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? defaultValue : numValue;
      };

      // Enhanced logging with more context
      console.group('🔢 Standard Price Calculation');
      console.log('Product Details:', {
        title: product.title || 'Unknown Product',
        source: product.source || 'Unknown Source'
      });

      // Validate and normalize price fields
      const basePrice = validateNumericField(
        product.price || product.price_min || product.price_max, 
        0
      );

      if (basePrice <= 0) {
        console.warn('❌ Invalid base price detected:', basePrice);
        console.groupEnd();
        return 0;
      }

      // Convert base price to BTN
      const btnBasePrice = this.calculateBasePrice(basePrice);
      console.log('📊 Base Price Conversion:', {
        originalPrice: basePrice,
        convertedPrice: btnBasePrice,
        exchangeRate: this.cnyToBtnRate
      });

      // Validate and normalize tax rate
      const taxRate = validateNumericField(
        product.tax_rate || product.taxRate, 
        0
      );

      const taxAmount = this.calculateTaxAmount(btnBasePrice, taxRate);
      console.log('💰 Tax Calculation:', {
        basePrice: btnBasePrice,
        taxRate: `${taxRate}%`,
        taxAmount: taxAmount
      });

      // Validate and normalize logistics rate and weight
      const logisticRate = validateNumericField(
        product.logistic_rate || product.logistic, 
        0
      );
      const unitWeight = validateNumericField(
        product.unit_weight || product.weight, 
        0
      );

      const logisticsAmount = this.calculateLogisticsAmount(logisticRate, unitWeight);
      console.log('🚚 Logistics Calculation:', {
        logisticRate: logisticRate,
        unitWeight: unitWeight,
        logisticsAmount: logisticsAmount
      });

      // Calculate total price and round up
      const totalPrice = this.roundPrice(btnBasePrice + taxAmount + logisticsAmount);
      console.log('✅ Final Price Breakdown:', {
        basePrice: btnBasePrice,
        taxAmount: taxAmount,
        logisticsAmount: logisticsAmount,
        totalPrice: totalPrice
      });
      console.groupEnd();

      return totalPrice;
    },

    // Calculate total price with rounding
    calculateTotalPrice(product: any, quantity: number = 1): number {
      if (!product) return 0;

      // Calculate base price
      const basePrice = this.calculateBasePrice(product.price);
      if (!basePrice) return 0;

      // Calculate amounts
      const taxAmount = this.calculateTaxAmount(basePrice, product.taxRate);
      const logisticsAmount = this.calculateLogisticsAmount(product.logisticRate, product.unitWeight);

      // Return total price with quantity and rounding
      return this.roundPrice((basePrice + taxAmount + logisticsAmount) * quantity);
    },

    // Format price consistently
    formatStandardPrice(price: number): string {
      return price ? `Nu. ${price.toFixed(2)}` : 'Price not available';
    },

    // Format price to BTN
    formatPrice(price: number): string {
      return price ? `Nu. ${price.toFixed(2)}` : 'Price not available';
    },

    // Get formatted rates for display
    getDisplayRates(product: any) {
      return {
        tax: product.taxRate ? `${product.taxRate}%` : null,
        logistics: product.logisticRate ? `Nu. ${product.logisticRate}/kg` : null,
        weight: product.unitWeight ? `${product.unitWeight} kg` : null
      };
    },

    calculatePrice(inputs: PriceInputs): number {
      // Only use values provided in inputs
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

    // Calculate pricing with consistent rounding
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

      // Convert CNY to BTN for the base price
      const basePrice = this.roundPrice(price * this.cnyToBtnRate * quantity);
      
      // Calculate tax amount if tax rate exists
      const taxAmount = taxRate ? this.roundPrice((basePrice * taxRate) / 100) : 0;
      
      // Calculate logistics cost if both rate and weight exist
      const logisticAmount = (logisticRate && unitWeight) 
        ? this.roundPrice(logisticRate * unitWeight * quantity) 
        : 0;
      
      // Calculate total price
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

    // Update exchange rate from API
    async updateExchangeRate() {
      // Don't update if we've updated recently
      if (!this.needsUpdate) return;
      
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;

      try {
        const API_KEY = '4214da0d2e6dfdb3c78926c1';
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/CNY/BTN`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }

        const data = await response.json();
        
        if (data.result === 'success') {
          this.cnyToBtnRate = data.conversion_rate;
          this.lastUpdated = new Date();
          // Store in localStorage for persistence
          localStorage.setItem('exchangeRate', JSON.stringify({
            rate: this.cnyToBtnRate,
            lastUpdated: this.lastUpdated.toISOString()
          }));
        } else {
          throw new Error(data.error || 'Failed to get exchange rate');
        }
      } catch (error) {
        console.error('Error updating exchange rate:', error);
        this.error = error instanceof Error ? error.message : 'Failed to update exchange rate';
        // Keep using the default rate if API fails
      } finally {
        this.isLoading = false;
      }
    },

    // Initialize exchange rate
    async init() {
      // Try to load from localStorage first
      const stored = localStorage.getItem('exchangeRate');
      if (stored) {
        const { rate, lastUpdated } = JSON.parse(stored);
        this.cnyToBtnRate = rate;
        this.lastUpdated = new Date(lastUpdated);
      }

      // Update if needed
      if (this.needsUpdate) {
        await this.updateExchangeRate();
      }
    }
  }
});
