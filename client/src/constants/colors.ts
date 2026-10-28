/**
 * The 8 person colors auto-assigned to people on a bill, in assignment order, mirrored by the server's
 * `PERSON_COLOR_KEYS` to validate shares. Runtime values live as RGB-channel CSS variables (`--person-<key>`) in
 * `index.css`.
 */
export const PERSON_COLORS = ['slate', 'gold', 'plum', 'sage', 'rose', 'teal', 'taupe', 'clay'] as const;

/** Key of one of the 8 person colors. */
export type PersonColorKey = typeof PERSON_COLORS[number];
