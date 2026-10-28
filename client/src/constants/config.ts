/** Base URL of the Tallies API; baked in at Vite build time. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Max people on a single bill (matches server-side cap). */
export const MAX_PEOPLE = 50;

/** Max receipts on a single bill (matches server-side cap). */
export const MAX_RECEIPTS = 20;

/** Max items on a single receipt (matches server-side cap). */
export const MAX_ITEMS = 200;

/** Max length of a bill, merchant, or person name (matches server-side cap). */
export const MAX_NAME_LENGTH = 100;

/** Max length of an item name (matches server-side cap). */
export const MAX_ITEM_NAME_LENGTH = 200;

/** Largest price, tax, or tip in dollars, so a bad number can't break the layout or math (matches server-side cap). */
export const MAX_AMOUNT = 99_999.99;

/** Largest percentage a tax or tip rate takes (matches server-side cap). */
export const MAX_RATE = 100;

/** Max length of a Venmo username (matches server-side regex bound). */
export const VENMO_USERNAME_MAX_LENGTH = 30;

/** Longest edge of the compressed receipt image, in pixels. */
export const IMAGE_MAX_DIMENSION = 1500;

/** JPEG quality used when compressing the receipt image. */
export const IMAGE_QUALITY = 0.85;
