import { useCallback, useEffect, useRef, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { compressImage } from '../lib/imageCompression';

import { API_URL, MAX_RECEIPTS } from '../constants/config';

/** Minimal OCR payload shape this client reads (structurally matches the store's `loadOcrResults` input). */
interface OcrResult {
  merchant?: string | null;
  date?: string | null;
  items: { name: string; price: number; quantity: number }[];
  tax?: number | null;
  tip?: number | null;
}

/** One receipt's slot in the capture list — its preview, scan status, and (once scanned) a parsed summary. */
export interface ScanEntry {
  id: string;
  /** Original file name, shown until OCR resolves a merchant. */
  fileName: string;
  /** Object URL for the picked image; revoked when the entry is removed or the hook unmounts. */
  previewUrl: string;
  status: 'scanning' | 'done' | 'failed';
  /** Merchant parsed from a successful scan, when present. */
  merchant?: string;
  /** Item count from a successful scan. */
  itemCount?: number;
  /** Items subtotal from a successful scan, in dollars. */
  subtotal?: number;
  /** Parsed payload from a successful scan, carried through to `commit`. */
  result?: OcrResult;
}

/**
 * Hook backing the capture screen's receipt list — picks images, scans them sequentially (respecting the
 * write rate limit and giving per-receipt progress), and tracks each as `scanning`/`done`/`failed`. Done
 * receipts can be committed into the store, which advances to Verify and carries a one-shot notice when any
 * receipt failed.
 * @returns `{ entries, addFiles, removeEntry, isScanning, doneCount, commit }` — `addFiles(files)` appends
 * and scans (capped at `MAX_RECEIPTS` total); `removeEntry(id)` drops one; `isScanning` is true while any
 * scan is in flight; `doneCount` is the number of successful scans; `commit()` loads the done receipts into
 * the store and returns `true` when at least one was loaded (false when none are ready yet)
 */
export function useOcr() {
  const loadOcrResults = useBillStore((s) => s.loadOcrResults);
  const setScanNotice = useBillStore((s) => s.setScanNotice);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Mirror `entries` in a ref so unmount cleanup can revoke every object URL without re-subscribing.
  const entriesRef = useRef<ScanEntry[]>([]);
  entriesRef.current = entries;
  useEffect(() => () => entriesRef.current.forEach((e) => URL.revokeObjectURL(e.previewUrl)), []);

  const updateEntry = useCallback((id: string, patch: Partial<ScanEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const addFiles = useCallback(
    async (files: File[]) => {
      const room = MAX_RECEIPTS - entriesRef.current.length;
      const batch = files.slice(0, Math.max(0, room));
      if (batch.length === 0) return;

      const fresh: ScanEntry[] = batch.map((file) => ({
        id: crypto.randomUUID(),
        fileName: file.name || 'Receipt',
        previewUrl: URL.createObjectURL(file),
        status: 'scanning',
      }));
      setEntries((prev) => [...prev, ...fresh]);
      setIsScanning(true);

      for (let i = 0; i < batch.length; i++) {
        const entry = fresh[i];
        try {
          const compressed = await compressImage(batch[i]);
          const formData = new FormData();
          formData.append('file', compressed, 'receipt.jpg');

          const response = await fetch(`${API_URL}/api/ocr`, { method: 'POST', body: formData });
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `OCR failed (${response.status})`);
          }

          const result: OcrResult = await response.json();
          if (!Array.isArray(result.items) || result.items.length === 0) {
            throw new Error("Couldn't identify a receipt");
          }
          const subtotal = result.items.reduce((sum, item) => sum + item.price, 0);
          updateEntry(entry.id, {
            status: 'done',
            merchant: result.merchant || undefined,
            itemCount: result.items.length,
            subtotal,
            result,
          });
        } catch {
          updateEntry(entry.id, { status: 'failed' });
        }
      }

      setIsScanning(false);
    },
    [updateEntry],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const commit = useCallback((): boolean => {
    const current = entriesRef.current;
    const results: OcrResult[] = [];
    for (const entry of current) {
      if (entry.status === 'done' && entry.result) results.push(entry.result);
    }
    if (results.length === 0) return false;

    const failures = current.filter((e) => e.status === 'failed').length;
    loadOcrResults(results);
    setScanNotice(
      failures > 0
        ? `Couldn't scan ${failures} of ${current.length} receipts — add ${failures === 1 ? 'it' : 'them'} with "Add receipt"`
        : null,
    );
    return true;
  }, [loadOcrResults, setScanNotice]);

  const doneCount = entries.filter((e) => e.status === 'done').length;

  return { entries, addFiles, removeEntry, isScanning, doneCount, commit };
}
