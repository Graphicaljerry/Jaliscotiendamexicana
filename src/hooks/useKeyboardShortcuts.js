import { useEffect } from 'react';

/**
 * Hook for global keyboard shortcuts (F-keys).
 * Maps function keys to POS actions.
 */
function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Don't trigger shortcuts when typing in inputs
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        // Allow F-keys even in inputs
        if (!e.key.startsWith('F')) return;
      }

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          handlers.onRepeatLast?.();
          break;
        case 'F2':
          e.preventDefault();
          handlers.onDeleteLast?.();
          break;
        case 'F3':
          e.preventDefault();
          handlers.onReturnNext?.();
          break;
        case 'F4':
          e.preventDefault();
          handlers.onItemDirect?.();
          break;
        case 'F5':
          e.preventDefault();
          handlers.onQuantity?.();
          break;
        case 'F6':
          e.preventDefault();
          handlers.onPrice?.();
          break;
        case 'F7':
          e.preventDefault();
          handlers.onDiscount?.();
          break;
        case 'F8':
          e.preventDefault();
          handlers.onSalesChange?.();
          break;
        case 'F9':
          e.preventDefault();
          handlers.onCancel?.();
          break;
        case 'F10':
          e.preventDefault();
          handlers.onFinish?.();
          break;
        case 'F11':
          e.preventDefault();
          handlers.onCoupon?.();
          break;
        case 'F12':
          e.preventDefault();
          handlers.onItemLookup?.();
          break;
        default:
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handlers]);
}

export default useKeyboardShortcuts;
