/**
 * Resolve a bill's display title: the user-given name when set, otherwise the generic "Your bill".
 * @param name - User-entered bill name (may be empty/null/undefined)
 * @returns A non-empty display title
 */
export function deriveBillName(name: string | null | undefined): string {
  return name?.trim() || 'Your bill';
}
