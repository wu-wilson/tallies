import { create } from 'zustand';

import { PERSON_COLORS } from '../constants/colors';
import { MAX_PEOPLE, MAX_ITEMS } from '../constants/config';

import type { Screen, Person, BillItem } from '../types/bill';

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
  merchant: string;
  date: string;
  people: Person[];
  items: BillItem[];
  tax: number;
  taxIsPercent: boolean;
  tip: number;
  tipIsPercent: boolean;
}

interface BillActions {
  setScreen: (screen: Screen) => void;
  loadOcrResult: (result: OcrResult) => void;
  setMerchant: (name: string) => void;
  setDate: (date: string) => void;

  addPerson: (name: string) => void;
  removePerson: (id: string) => void;

  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Pick<BillItem, 'name' | 'price'>>) => void;
  toggleAssignment: (itemId: string, personId: string) => void;
  assignAllToItem: (itemId: string) => void;

  splitEvenly: () => void;
  unsplitEvenly: () => void;

  setTax: (value: number) => void;
  setTaxIsPercent: (isPercent: boolean) => void;
  setTip: (value: number) => void;
  setTipIsPercent: (isPercent: boolean) => void;
}

const initialState: BillState = {
  screen: 'capture',
  merchant: '',
  date: '',
  people: [],
  items: [],
  tax: 0,
  taxIsPercent: false,
  tip: 20,
  tipIsPercent: true,
};

/** Fresh client-side UUID — used as the ID for in-memory people and items. */
function uid(): string {
  return crypto.randomUUID();
}

/** Returns the first `PERSON_COLORS` entry not in use, wrapping by `people.length % PERSON_COLORS.length` past 8 people. */
function nextColor(people: Person[]): typeof PERSON_COLORS[number] {
  const used = new Set(people.map((p) => p.color));
  const available = PERSON_COLORS.find((c) => !used.has(c));
  if (available) return available;
  return PERSON_COLORS[people.length % PERSON_COLORS.length];
}

/**
 * Zustand store — single source of truth for the bill flow (screen, people, items, tax/tip).
 * Exposes mutating actions for every field plus `loadOcrResult` which bakes the OCR payload into the store and transitions to Verify.
 * @returns The store hook; call with a selector to subscribe to a slice
 */
export const useBillStore = create<BillState & BillActions>()((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  loadOcrResult: (result) => {
    // Bake quantity into the line price — quantity stays 1 from here on, since the UI doesn't expose
    // a quantity editor and treating each row as a single line total avoids price/quantity drift.
    const items: BillItem[] = result.items.map((item) => ({
      id: uid(),
      name: item.name,
      price: item.price * item.quantity,
      quantity: 1,
      assignees: [],
    }));

    const tipFromOcr = result.tip ?? null;

    set({
      merchant: result.merchant || '',
      date: result.date || new Date().toISOString().split('T')[0],
      people: [],
      items,
      tax: result.tax ?? 0,
      taxIsPercent: false,
      tip: tipFromOcr ?? 20,
      tipIsPercent: tipFromOcr === null,
      screen: 'verify',
    });
  },

  setMerchant: (name) => set({ merchant: name }),
  setDate: (date) => set({ date }),

  addPerson: (name) => {
    const { people } = get();
    if (people.length >= MAX_PEOPLE) return;
    const person: Person = {
      id: uid(),
      name,
      color: nextColor(people),
    };
    set({ people: [...people, person] });
  },

  removePerson: (id) => {
    const { people, items } = get();
    set({
      people: people.filter((p) => p.id !== id),
      items: items.map((item) => ({
        ...item,
        assignees: item.assignees.filter((a) => a !== id),
      })),
    });
  },

  addItem: () => {
    const { items } = get();
    if (items.length >= MAX_ITEMS) return;
    set({
      items: [...items, { id: uid(), name: '', price: 0, quantity: 1, assignees: [] }],
    });
  },

  removeItem: (id) => {
    const { items } = get();
    set({ items: items.filter((i) => i.id !== id) });
  },

  updateItem: (id, updates) => {
    const { items } = get();
    set({
      items: items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    });
  },

  toggleAssignment: (itemId, personId) => {
    const { items } = get();
    set({
      items: items.map((i) => {
        if (i.id !== itemId) return i;
        const has = i.assignees.includes(personId);
        return {
          ...i,
          assignees: has
            ? i.assignees.filter((a) => a !== personId)
            : [...i.assignees, personId],
        };
      }),
    });
  },

  assignAllToItem: (itemId) => {
    const { items, people } = get();
    const allIds = people.map((p) => p.id);
    set({
      items: items.map((i) => (i.id === itemId ? { ...i, assignees: allIds } : i)),
    });
  },

  splitEvenly: () => {
    const { items, people } = get();
    const allIds = people.map((p) => p.id);
    set({
      items: items.map((i) => ({ ...i, assignees: allIds })),
    });
  },

  unsplitEvenly: () => {
    const { items } = get();
    set({
      items: items.map((i) => ({ ...i, assignees: [] })),
    });
  },

  setTax: (value) => set({ tax: value }),
  setTaxIsPercent: (isPercent) => set({ taxIsPercent: isPercent }),
  setTip: (value) => set({ tip: value }),
  setTipIsPercent: (isPercent) => set({ tipIsPercent: isPercent }),
}));
