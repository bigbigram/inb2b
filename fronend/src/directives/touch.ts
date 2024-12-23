import type { DirectiveBinding } from 'vue'

interface TouchHandlers {
  touchstart: (e: TouchEvent) => void;
  touchmove: (e: TouchEvent) => void;
  touchend: (e: TouchEvent) => void;
}

export const touch = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const handlers: TouchHandlers = {
      touchstart: (e: TouchEvent) => binding.value?.(e),
      touchmove: (e: TouchEvent) => binding.value?.(e),
      touchend: (e: TouchEvent) => binding.value?.(e)
    };

    // Store handlers on the element for cleanup
    (el as any)._touchHandlers = handlers;

    // Add event listeners with passive option
    Object.entries(handlers).forEach(([event, handler]) => {
      el.addEventListener(event, handler, { passive: true });
    });
  },

  unmounted(el: HTMLElement) {
    // Clean up event listeners
    const handlers = (el as any)._touchHandlers as TouchHandlers;
    if (handlers) {
      Object.entries(handlers).forEach(([event, handler]) => {
        el.removeEventListener(event, handler);
      });
      delete (el as any)._touchHandlers;
    }
  }
}
