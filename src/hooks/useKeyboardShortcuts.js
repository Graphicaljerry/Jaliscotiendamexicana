import { useEffect, useRef } from 'react';

/**
 * Hook for global keyboard shortcuts (F-keys).
 * Maps function keys to POS actions.
 * Uses a ref to always have the latest handlers without re-registering.
 */
function useKeyboardShortcuts(handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger shortcuts when typing in inputs (except F-keys)
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        if (!e.key.startsWith('F')) return;
      }

      const h = handlersRef.current;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          h.onCancel?.();
          break;
        case 'F1':
          e.preventDefault();
          h.onRepeatLast?.();
          break;
        case 'F2':
          e.preventDefault();
          e.stopPropagation();
          h.onDeleteLast?.();
          break;
        case 'F3':
          e.preventDefault();
          h.onReturnNext?.();
          break;
        case 'F4':
          e.preventDefault();
          h.onItemDirect?.();
          break;
        case 'F5':
          e.preventDefault();
          h.onQuantity?.();
          break;
        case 'F6':
          e.preventDefault();
          h.onPrice?.();
          break;
        case 'F7':
          e.preventDefault();
          h.onDiscount?.();
          break;
        case 'F8':
          e.preventDefault();
          h.onSalesChange?.();
          break;
        case 'F9':
          e.preventDefault();
          h.onCancel?.();
          break;
        case 'F10':
          e.preventDefault();
          e.stopPropagation();
          h.onFinish?.();
          break;
        case 'F11':
          e.preventDefault();
          h.onCoupon?.();
          break;
        case 'F12':
          e.preventDefault();
          h.onItemLookup?.();
          break;
        default:
          break;
      }
    }

    // Use capture phase to intercept before browser handles it
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []); // Only register once
}

export default useKeyboardShortcuts;
