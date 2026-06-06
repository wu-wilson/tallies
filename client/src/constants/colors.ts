/** The 8 person colors auto-assigned to people on a bill, in assignment order. Runtime hex values live as CSS variables (`--person-<key>`) in `index.css`. */
export const PERSON_COLORS = ['sage', 'gold', 'plum', 'slate', 'rose', 'taupe', 'teal', 'clay'] as const;

/** Key of one of the 8 person colors. */
export type PersonColorKey = typeof PERSON_COLORS[number];
