import type { ZodIssue } from 'zod';

/** Most issues listed in one log line, since a malformed array can raise one per element. */
const MAX_LISTED_ISSUES = 10;

/**
 * Summarize Zod issues as `path: code` pairs for operational logs, omitting the received values so payload
 * contents never land in logs.
 * @param issues - Issues from a failed `safeParse`
 * @returns The first 10 as a comma-separated list (e.g. `items.0.price: too_small`), plus a count of the rest
 */
export function formatIssues(issues: ZodIssue[]): string {
  const listed = issues
    .slice(0, MAX_LISTED_ISSUES)
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.code}`)
    .join(', ');
  return issues.length > MAX_LISTED_ISSUES ? `${listed} (+${issues.length - MAX_LISTED_ISSUES} more)` : listed;
}
