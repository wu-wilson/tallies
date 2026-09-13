import type { ZodIssue } from 'zod';

/**
 * Summarize Zod issues as `path: code` pairs for operational logs, omitting the received values so payload
 * contents never land in logs.
 * @param issues - Issues from a failed `safeParse`
 * @returns Comma-separated `path: code` list, e.g. `items.0.price: too_small`
 */
export function formatIssues(issues: ZodIssue[]): string {
  return issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.code}`).join(', ');
}
