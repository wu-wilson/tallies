import { useCallback, useEffect, useRef, useState } from 'react';

import { useBillStore } from '../store/billStore';

import { compressImage } from '../lib/imageCompression';

import { API_URL, MAX_RECEIPTS } from '../constants/config';

import type { OcrResult } from '../types/bill';

/** One receipt's slot in the capture list — its preview, scan status, and (once scanned) a parsed summary. */
export interface ScanEntry {
  id: string;
  /** Original file name, shown until OCR resolves a merchant. */
  fileName: string;
  /** Object URL for the picked image; revoked when the entry is removed or the hook unmounts. */
  previewUrl: string;
  status: 'scanning' | 'done' | 'failed';
  /** User-safe reason for a failed scan (server message or a local fallback). */
  error?: string;
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
 * Hook backing the capture screen's receipt list — takes the picked images, scans them one at a time (giving
 * per-receipt progress), and tracks each as `scanning`/`done`/`failed`. Done receipts can be committed into the store,
 * which advances to Verify and carries a one-shot notice when any receipt failed.
 * @returns `{ entries, addFiles, removeEntry, isScanning, doneCount, commit }` — `addFiles(files)` appends and scans
 * (capped at `MAX_RECEIPTS` total); `removeEntry(id)` drops one; `isScanning` is true while any scan is in flight;
 * `doneCount` is the number of successful scans; `commit()` loads the done receipts into the store (a no-op until at
 * least one is ready)
 */
export function useOcr() {
  const loadOcrResults = useBillStore((s) => s.loadOcrResults);
  const setScanNotice = useBillStore((s) => s.setScanNotice);
  const [entries, setEntries] = useState<ScanEntry[]>([]);

  // Mirror `entries` in a ref so unmount cleanup can revoke every object URL without re-subscribing.
  const entriesRef = useRef<ScanEntry[]>([]);
  entriesRef.current = entries;

  // Aborted on unmount, so leaving the screen cancels the scan in flight and skips the queued ones.
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    return () => {
      controller.abort();
      entriesRef.current.forEach((e) => URL.revokeObjectURL(e.previewUrl));
    };
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<ScanEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  // Scans run one at a time even across batches, so a second pick waits behind the first and each row flips in order.
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const scanOne = useCallback(
    async (entryId: string, file: File) => {
      const signal = controllerRef.current?.signal;
      if (!signal || signal.aborted) return;
      try {
        const compressed = await compressImage(file).catch(() => {
          throw new Error("Couldn't open this photo. Try another one.");
        });
        const formData = new FormData();
        formData.append('file', compressed, 'receipt.jpg');

        const response = await fetch(`${API_URL}/api/ocr`, { method: 'POST', body: formData, signal }).catch(() => {
          throw new Error("Couldn't reach Tallies. Check your connection and try again.");
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Couldn't read this receipt. Try again.");
        }

        const result: OcrResult = await response.json().catch(() => {
          throw new Error("Couldn't read this receipt. Try again.");
        });
        if (!Array.isArray(result.items) || result.items.length === 0) {
          throw new Error("Couldn't find a receipt in this photo.");
        }
        updateEntry(entryId, {
          status: 'done',
          merchant: result.merchant || undefined,
          itemCount: result.items.length,
          subtotal: result.items.reduce((sum, item) => sum + item.price, 0),
          result,
        });
      } catch (err) {
        if (signal.aborted) return;
        updateEntry(entryId, {
          status: 'failed',
          error: err instanceof Error ? err.message : "Couldn't read this receipt. Try again.",
        });
      }
    },
    [updateEntry],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const room = MAX_RECEIPTS - useBillStore.getState().receipts.length - entriesRef.current.length;
      const batch = files.slice(0, Math.max(0, room));
      if (batch.length === 0) return;

      const fresh: ScanEntry[] = batch.map((file) => ({
        id: crypto.randomUUID(),
        fileName: file.name || 'Receipt',
        previewUrl: URL.createObjectURL(file),
        status: 'scanning',
      }));
      setEntries((prev) => [...prev, ...fresh]);
      fresh.forEach((entry, i) => {
        queueRef.current = queueRef.current.then(() => scanOne(entry.id, batch[i]));
      });
    },
    [scanOne],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const commit = useCallback(() => {
    const current = entriesRef.current;
    const results: OcrResult[] = [];
    for (const entry of current) {
      if (entry.status === 'done' && entry.result) results.push(entry.result);
    }
    if (results.length === 0) return;

    const failures = current.filter((e) => e.status === 'failed').length;
    loadOcrResults(results);
    setScanNotice(
      failures > 0
        ? `Couldn't read ${failures} of ${current.length} receipts. Add ${failures === 1 ? 'it' : 'them'} with Add another receipt.`
        : null,
    );
  }, [loadOcrResults, setScanNotice]);

  const doneCount = entries.filter((e) => e.status === 'done').length;
  // Derived rather than stored, so a second batch picked while the first is still reading keeps it true.
  const isScanning = entries.some((e) => e.status === 'scanning');

  return { entries, addFiles, removeEntry, isScanning, doneCount, commit };
}
