import { create } from 'zustand';

import { toFieldAmount } from '../lib/billMath';
import { formatReceiptDate, todayIso } from '../lib/dates';

import { PERSON_COLORS } from '../constants/colors';
import { MAX_ITEMS, MAX_PEOPLE, MAX_RECEIPTS } from '../constants/config';

import type { BillItem, OcrResult, Person, Receipt, Screen } from '../types/bill';

interface BillState {
  screen: Screen;
  /**
   * Optional bill title. Empty by default — unnamed bills fall back to "Your bill" on the breakdown
   * (see `deriveBillName`).
   */
  name: string;
  receipts: Receipt[];
  people: Person[];
  /**
   * One-shot notice (e.g. "Couldn't read 1 of 2 receipts. Add it with Add another receipt.") shown once on Verify,
   * then cleared.
   */
  scanNotice: string | null;
  /** Share URL for the current bill once its link has been created; drives the Share screen. Null until created. */
  shareUrl: string | null;
  /** The Venmo handle sent with that link, so the Share screen describes what friends will actually see. */
  shareVenmoUsername: string | null;
  /** The person who paid the bill and is owed by everyone else; null until chosen on Result. */
  payerId: string | null;
}

interface BillActions {
  setScreen: (screen: Screen) => void;
  /** Discard any previous bill (including its share link) and open Capture for a fresh one. */
  startNewBill: () => void;
  /** Add scanned receipts to the bill and open Verify. A fresh bill starts empty via `startNewBill`. */
  loadOcrResults: (results: OcrResult[]) => void;
  setScanNotice: (notice: string | null) => void;
  /** Record the created link and the Venmo handle sent with it. */
  setShareLink: (url: string, venmoUsername: string | null) => void;
  setPayerId: (personId: string | null) => void;
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
  shareVenmoUsername: null,
  payerId: null,
};

/** Fresh client-side UUID — used as the ID for in-memory receipts, people, and items. */
function uid(): string {
  return crypto.randomUUID();
}

/**
 * Returns the first `PERSON_COLORS` entry not in use, wrapping by `people.length % PERSON_COLORS.length` past 8 people.
 */
function nextColor(people: Person[]): typeof PERSON_COLORS[number] {
  const used = new Set(people.map((p) => p.color));
  const available = PERSON_COLORS.find((c) => !used.has(c));
  if (available) return available;
  return PERSON_COLORS[people.length % PERSON_COLORS.length];
}

/**
 * Build a `Receipt` from one OCR result, with dollar amounts rounded to the cent and capped at `MAX_AMOUNT` like typed
 * ones, and each line total stored as the price with `quantity` pinned to 1 (which also covers by-weight items). A null
 * tip becomes 20%; a null tax $0 flat.
 */
function receiptFromOcr(result: OcrResult): Receipt {
  const items: BillItem[] = result.items.map((item) => ({
    id: uid(),
    name: item.name,
    price: toFieldAmount(item.price),
    quantity: 1,
    assignees: [],
  }));
  const tipFromOcr = result.tip ?? null;
  // Keep the scan's date only when it's a real `YYYY-MM-DD` (a timestamp's date part counts); otherwise use today's.
  const ocrDate = result.date?.slice(0, 10) ?? '';
  return {
    id: uid(),
    merchant: result.merchant || '',
    date: formatReceiptDate(ocrDate) ? ocrDate : todayIso(),
    items,
    tax: toFieldAmount(result.tax ?? 0),
    taxIsPercent: false,
    tip: tipFromOcr === null ? 20 : toFieldAmount(tipFromOcr),
    tipIsPercent: tipFromOcr === null,
  };
}

/** A fresh empty receipt for manual entry — no merchant/items, default 20% tip. */
function blankReceipt(): Receipt {
  return {
    id: uid(),
    merchant: '',
    date: todayIso(),
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
 * Zustand store, the single source of truth for the bill flow: the current screen, the receipts (each with its own
 * merchant, items, and tax/tip), the people shared across them, the payer, and the share link.
 * @returns The store hook; call with a selector to subscribe to a slice
 */
export const useBillStore = create<BillState & BillActions>()((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  startNewBill: () => set({ ...initialState, screen: 'capture' }),

  loadOcrResults: (results) => {
    // Scans add to the bill being built (going back from Verify keeps its people and edits). Enforce the receipt
    // cap here too, so the store never holds more than a shareable bill allows.
    set({
      receipts: [...get().receipts, ...results.map(receiptFromOcr)].slice(0, MAX_RECEIPTS),
      shareUrl: null,
      shareVenmoUsername: null,
      screen: 'verify',
    });
  },

  setScanNotice: (scanNotice) => set({ scanNotice }),

  setShareLink: (shareUrl, shareVenmoUsername) => set({ shareUrl, shareVenmoUsername }),

  setPayerId: (payerId) => set({ payerId }),

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
    const { people, receipts, payerId } = get();
    set({
      people: people.filter((p) => p.id !== id),
      payerId: payerId === id ? null : payerId,
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
          const isAssigned = i.assignees.includes(personId);
          return {
            ...i,
            assignees: isAssigned ? i.assignees.filter((a) => a !== personId) : [...i.assignees, personId],
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
