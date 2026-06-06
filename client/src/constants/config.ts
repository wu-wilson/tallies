/** Base URL of the Tallies API; baked in at Vite build time. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Max people on a single bill (matches server-side cap). */
export const MAX_PEOPLE = 50;

/** Max receipts on a single bill (matches server-side cap). */
export const MAX_RECEIPTS = 20;

/** Max items on a single receipt (matches server-side cap). */
export const MAX_ITEMS = 200;

/** Max length of a person's name. */
export const MAX_NAME_LENGTH = 100;

/** Max length of an item name. */
export const MAX_ITEM_NAME_LENGTH = 200;

/** Longest edge of the compressed receipt image, in pixels. */
export const IMAGE_MAX_DIMENSION = 1500;

/** JPEG quality used when compressing the receipt image. */
export const IMAGE_QUALITY = 0.85;
