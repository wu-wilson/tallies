import { create } from 'zustand';

import { PERSON_COLORS } from '../constants/colors';
import { MAX_PEOPLE, MAX_ITEMS, MAX_RECEIPTS } from '../constants/config';

import type { Screen, Person, BillItem, Receipt } from '../types/bill';

/** Shape returned from `/api/ocr` (only the fields this client actually reads — the server schema is wider). */
interface OcrResult {
  merchant?: string | null;
  date?: string | null;
  items: { name: string; price: number; quantity: number }[];
  tax?: number | null;
  tip?: number | null;
}

interface BillState {
  screen: Screen;
  /** Optional bill title. Empty by default — unnamed bills show "Untitled bill" on Verify and fall back to "Your bill" on the breakdown (see `deriveBillName`). */
  name: string;
  receipts: Receipt[];
  people: Person[];
  /** Transient one-shot notice (e.g. "1 of 2 receipts couldn't be scanned") surfaced once on Verify, then cleared. */
  scanNotice: string | null;
  /** Share URL for the current bill once its link has been created; drives the Share screen. Null until created. */
  shareUrl: string | null;
}

interface BillActions {
  setScreen: (screen: Screen) => void;
  loadOcrResults: (results: OcrResult[]) => void;
  setScanNotice: (notice: string | null) => void;
  setShareUrl: (url: string | null) => void;
  setName: (name: string) => void;

  addReceipt: () => void;
  removeReceipt: (id: string) => void;
  setReceiptMerchant: (receiptId: string, name: string) => void;
  setReceiptDate: (receiptId: string, date: string) => void;

  addPerson: (name: string) => void;
  removePerson: (id: string) => void;

  addItem: (receiptId: string) => void;
  removeItem: (receiptId: string, itemId: string) => void;
  updateItem: (receiptId: string, itemId: string, updates: Partial<Pick<BillItem, 'name' | 'price'>>) => void;
  toggleAssignment: (receiptId: string, itemId: string, personId: string) => void;
  assignAllToItem: (receiptId: string, itemId: string) => void;
  clearItemAssignees: (receiptId: string, itemId: string) => void;

  splitReceiptEvenly: (receiptId: string) => void;
  unsplitReceiptEvenly: (receiptId: string) => void;

  setTax: (receiptId: string, value: number) => void;
  setTaxIsPercent: (receiptId: string, isPercent: boolean) => void;
  setTip: (receiptId: string, value: number) => void;
  setTipIsPercent: (receiptId: string, isPercent: boolean) => void;
}

const initialState: BillState = {
  screen: 'landing',
  name: '',
  receipts: [],
  people: [],
  scanNotice: null,
  shareUrl: null,
};

/** Fresh client-side UUID — used as the ID for in-memory receipts, people, and items. */
function uid(): string {
  return crypto.randomUUID();
}

/** Today's date as `YYYY-MM-DD`, used as the default for receipts with no OCR date. */
function today(): string {
  return new Date().toISOString().split('T')[0];
}

/** Returns the first `PERSON_COLORS` entry not in use, wrapping by `people.length % PERSON_COLORS.length` past 8 people. */
function nextColor(people: Person[]): typeof PERSON_COLORS[number] {
  const used = new Set(people.map((p) => p.color));
  const available = PERSON_COLORS.find((c) => !used.has(c));
  if (available) return available;
  return PERSON_COLORS[people.length % PERSON_COLORS.length];
}

/**
 * Build a `Receipt` from one OCR result. The OCR `price` is the item's line total (already accounts for
 * quantity/weight), so it's stored directly and `quantity` is pinned to 1 — the UI has no quantity editor
 * and treating each row as a single line total avoids price/quantity drift (and handles by-weight items).
 * A null OCR tip defaults to a 20% tip; a null tax defaults to $0 flat.
 */
function receiptFromOcr(result: OcrResult): Receipt {
  const items: BillItem[] = result.items.map((item) => ({
    id: uid(),
    name: item.name,
    price: item.price,
    quantity: 1,
    assignees: [],
  }));
  const tipFromOcr = result.tip ?? null;
  return {
    id: uid(),
    merchant: result.merchant || '',
    date: result.date || today(),
    items,
    tax: result.tax ?? 0,
    taxIsPercent: false,
    tip: tipFromOcr ?? 20,
    tipIsPercent: tipFromOcr === null,
  };
}

/** A fresh empty receipt for manual entry — no merchant/items, default 20% tip. */
function blankReceipt(): Receipt {
  return {
    id: uid(),
    merchant: '',
    date: today(),
    items: [],
    tax: 0,
    taxIsPercent: false,
    tip: 20,
    tipIsPercent: true,
  };
}

/** Apply `fn` to the receipt matching `id`, leaving the rest untouched. */
function mapReceipt(receipts: Receipt[], id: string, fn: (r: Receipt) => Receipt): Receipt[] {
  return receipts.map((r) => (r.id === id ? fn(r) : r));
}

/** Apply `fn` to the item matching `itemId` within a receipt. */
function mapItem(receipt: Receipt, itemId: string, fn: (i: BillItem) => BillItem): Receipt {
  return { ...receipt, items: receipt.items.map((i) => (i.id === itemId ? fn(i) : i)) };
}

/**
 * Zustand store — single source of truth for the bill flow (screen, receipts, people, share URL).
 * A bill holds one or more receipts (each with its own merchant, items, and tax/tip) plus a shared set of people.
 * The `landing → capture → verify → result → share` screen lives here; `loadOcrResults` bakes a batch of OCR
 * payloads into receipts and transitions to Verify.
 * @returns The store hook; call with a selector to subscribe to a slice
 */
export const useBillStore = create<BillState & BillActions>()((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  loadOcrResults: (results) => {
    // Enforce the receipt cap here too, so the store never holds more than a shareable bill allows
    // regardless of how many images were scanned.
    set({
      name: '',
      receipts: results.slice(0, MAX_RECEIPTS).map(receiptFromOcr),
      people: [],
      screen: 'verify',
    });
  },

  setScanNotice: (scanNotice) => set({ scanNotice }),

  setShareUrl: (shareUrl) => set({ shareUrl }),

  setName: (name) => set({ name }),

  addReceipt: () => {
    const { receipts } = get();
    if (receipts.length >= MAX_RECEIPTS) return;
    set({ receipts: [...receipts, blankReceipt()] });
  },

  removeReceipt: (id) => {
    const { receipts } = get();
    set({ receipts: receipts.filter((r) => r.id !== id) });
  },

  setReceiptMerchant: (receiptId, name) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, merchant: name })) });
  },

  setReceiptDate: (receiptId, date) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, date })) });
  },

  addPerson: (name) => {
    const { people } = get();
    if (people.length >= MAX_PEOPLE) return;
    const person: Person = { id: uid(), name, color: nextColor(people) };
    set({ people: [...people, person] });
  },

  removePerson: (id) => {
    const { people, receipts } = get();
    set({
      people: people.filter((p) => p.id !== id),
      receipts: receipts.map((r) => ({
        ...r,
        items: r.items.map((item) => ({
          ...item,
          assignees: item.assignees.filter((a) => a !== id),
        })),
      })),
    });
  },

  addItem: (receiptId) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) =>
        r.items.length >= MAX_ITEMS
          ? r
          : { ...r, items: [...r.items, { id: uid(), name: '', price: 0, quantity: 1, assignees: [] }] },
      ),
    });
  },

  removeItem: (receiptId, itemId) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) => ({
        ...r,
        items: r.items.filter((i) => i.id !== itemId),
      })),
    });
  },

  updateItem: (receiptId, itemId, updates) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) =>
        mapItem(r, itemId, (i) => ({ ...i, ...updates })),
      ),
    });
  },

  toggleAssignment: (receiptId, itemId, personId) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) =>
        mapItem(r, itemId, (i) => {
          const has = i.assignees.includes(personId);
          return {
            ...i,
            assignees: has ? i.assignees.filter((a) => a !== personId) : [...i.assignees, personId],
          };
        }),
      ),
    });
  },

  assignAllToItem: (receiptId, itemId) => {
    const allIds = get().people.map((p) => p.id);
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) =>
        mapItem(r, itemId, (i) => ({ ...i, assignees: allIds })),
      ),
    });
  },

  clearItemAssignees: (receiptId, itemId) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) =>
        mapItem(r, itemId, (i) => ({ ...i, assignees: [] })),
      ),
    });
  },

  splitReceiptEvenly: (receiptId) => {
    const allIds = get().people.map((p) => p.id);
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) => ({
        ...r,
        items: r.items.map((i) => ({ ...i, assignees: allIds })),
      })),
    });
  },

  unsplitReceiptEvenly: (receiptId) => {
    set({
      receipts: mapReceipt(get().receipts, receiptId, (r) => ({
        ...r,
        items: r.items.map((i) => ({ ...i, assignees: [] })),
      })),
    });
  },

  setTax: (receiptId, value) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, tax: value })) });
  },

  setTaxIsPercent: (receiptId, isPercent) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, taxIsPercent: isPercent })) });
  },

  setTip: (receiptId, value) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, tip: value })) });
  },

  setTipIsPercent: (receiptId, isPercent) => {
    set({ receipts: mapReceipt(get().receipts, receiptId, (r) => ({ ...r, tipIsPercent: isPercent })) });
  },
}));
