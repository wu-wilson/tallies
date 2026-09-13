/**
 * Short operational description of a thrown value for logs: the error code (or name) plus its message, so
 * connection errors that carry only a code still log something useful.
 * @param err - Whatever was caught; non-Error values are stringified
 * @returns e.g. `ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432`, or just the code/name when the message is empty
 */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const code = 'code' in err && typeof err.code === 'string' ? err.code : undefined;
  return [code ?? err.name, err.message].filter(Boolean).join(': ');
}
