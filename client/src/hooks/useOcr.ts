import { useCallback, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { compressImage } from '../lib/imageCompression';

import { API_URL } from '../constants/config';

/** Minimal OCR payload shape this client reads (structurally matches the store's `loadOcrResults` input). */
interface OcrResult {
  merchant?: string | null;
  date?: string | null;
  items: { name: string; price: number; quantity: number }[];
  tax?: number | null;
  tip?: number | null;
}

/** Progress of an in-flight batch scan. */
interface OcrProgress {
  done: number;
  total: number;
}

/**
 * Hook to scan one or more receipt images in a single batch — compress, upload, and load the parsed
 * receipts into the store. Images are processed sequentially (respecting the write rate limit and enabling
 * progress). Successful scans are kept and the flow advances to Verify; a partial failure also sets a
 * one-shot `scanNotice` for Verify to surface. If every image fails, the user stays on the preview and `error` drives a Toast.
 * @returns `{ submitReceipts, isLoading, progress, error }` — `submitReceipts(files)` runs the batch; `progress` holds `{done,total}` while scanning (null otherwise); `error` is the latest failure message (cleared at the start of each call); `isLoading` reflects whether a batch is in flight
 */
export function useOcr() {
  const loadOcrResults = useBillStore((s) => s.loadOcrResults);
  const setScanNotice = useBillStore((s) => s.setScanNotice);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitReceipts = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    const results: OcrResult[] = [];
    let failures = 0;

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImage(files[i]);
        const formData = new FormData();
        formData.append('file', compressed, 'receipt.jpg');

        const response = await fetch(`${API_URL}/api/ocr`, { method: 'POST', body: formData });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `OCR failed (${response.status})`);
        }

        const result = await response.json();
        if (!Array.isArray(result.items) || result.items.length === 0) {
          throw new Error("Couldn't identify a receipt");
        }
        results.push(result);
      } catch {
        failures += 1;
      } finally {
        setProgress({ done: i + 1, total: files.length });
      }
    }

    setIsLoading(false);
    setProgress(null);

    // Every image failed — stay on the preview and surface the error.
    if (results.length === 0) {
      setError(files.length === 1 ? "Couldn't identify a receipt" : "Couldn't scan any of those receipts");
      return;
    }

    // Some succeeded — proceed with them, and (on partial failure) carry a one-shot notice through to
    // Verify so the user knows a receipt was dropped and can re-add it. A clean batch clears any stale notice.
    loadOcrResults(results);
    setScanNotice(
      failures > 0
        ? `Couldn't scan ${failures} of ${files.length} receipts — add ${failures === 1 ? 'it' : 'them'} with "Add receipt"`
        : null,
    );
  }, [loadOcrResults, setScanNotice]);

  return { submitReceipts, isLoading, progress, error };
}
