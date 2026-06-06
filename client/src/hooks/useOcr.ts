import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { compressImage } from '../lib/imageCompression';

import { API_URL } from '../constants/config';

/**
 * Hook to manage a single OCR roundtrip — compress, upload, and load the parsed bill into the store.
 * Failures leave the user on the image preview; `ImagePreview` watches `error` and surfaces it via a Toast.
 * @returns `{ submitReceipt, isLoading, error }` — `submitReceipt(file)` runs the full roundtrip; `error` holds the latest failure message (cleared at the start of each call); `isLoading` reflects whether a request is in flight
 */
export function useOcr() {
  const loadOcrResult = useBillStore((s) => s.loadOcrResult);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReceipt = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed, 'receipt.jpg');

      const response = await fetch(`${API_URL}/api/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `OCR failed (${response.status})`);
      }

      const result = await response.json();
      if (!Array.isArray(result.items) || result.items.length === 0) {
        throw new Error("Couldn't identify a receipt");
      }
      loadOcrResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan receipt';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadOcrResult]);

  return { submitReceipt, isLoading, error };
}
