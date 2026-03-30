import { useEffect, useRef } from 'react';

/**
 * Global barcode scanner hook.
 * USB barcode scanners act as keyboard input, sending keystrokes very rapidly
 * (< 50ms between characters) followed by Enter.
 * This hook detects that rapid input pattern and triggers a callback with the barcode.
 */
function useBarcodeScanner(onScan) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const MAX_KEY_INTERVAL = 50; // ms between keys from scanner
    const MIN_BARCODE_LENGTH = 3;

    function handleKeyDown(e) {
      // Ignore if focus is on an input, textarea, or select
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        return;
      }

      const now = Date.now();

      // If too much time has passed since last key, reset buffer
      if (now - lastKeyTimeRef.current > MAX_KEY_INTERVAL) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        // Scanner sends Enter at end of barcode
        if (bufferRef.current.length >= MIN_BARCODE_LENGTH) {
          e.preventDefault();
          const barcode = bufferRef.current;
          bufferRef.current = '';
          onScan(barcode);
        }
        bufferRef.current = '';
        return;
      }

      // Only accept printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;

        // Safety: clear buffer after a timeout in case Enter never comes
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          bufferRef.current = '';
        }, 200);
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan]);
}

export default useBarcodeScanner;
