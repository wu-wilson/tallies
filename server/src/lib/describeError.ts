/**
 * Short operational description of a thrown value for logs: the error code (or name) plus its message, so
 * connection errors that carry only a code still log something useful.
 * @param err - Whatever was caught; non-Error values are stringified
 * @returns e.g. `ECONNREFUSED: connect ECONNREFUSED 127.0.0.1:5432`, or just the code/name when neither the error nor
 * its first sub-error has a message
 */
export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const code = 'code' in err && typeof err.code === 'string' ? err.code : undefined;
  // A host with several addresses (`localhost` is ::1 and 127.0.0.1) fails to connect with an empty message and one
  // error per address, so describe the first of those.
  const attempts = 'errors' in err && Array.isArray(err.errors) ? err.errors : [];
  const message = err.message || (attempts[0] instanceof Error ? attempts[0].message : '');
  return [code ?? err.name, message].filter(Boolean).join(': ');
}
