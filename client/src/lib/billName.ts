/**
 * Resolve a bill's display title: the user-given name when set, otherwise the generic "Your bill".
 * @param name - User-entered bill name (may be empty/null/undefined)
 * @returns A non-empty display title
 */
export function deriveBillName(name: string | null | undefined): string {
  return name?.trim() || 'Your bill';
}

/**
 * Resolve a short label for a payment memo: the bill name, else a lone receipt's merchant, else a
 * generic fallback. Avoids the "Your bill" placeholder, which reads oddly in a Venmo note.
 * @param name - User-entered bill name (may be empty/null/undefined)
 * @param receipts - The bill's receipts; a single named receipt lends its merchant when the bill is unnamed
 * @returns A non-empty label suitable for a payment note
 */
export function deriveMemoLabel(name: string | null | undefined, receipts: { merchant: string }[]): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  const merchant = receipts.length === 1 ? receipts[0].merchant.trim() : '';
  return merchant || 'Tallies bill';
}
