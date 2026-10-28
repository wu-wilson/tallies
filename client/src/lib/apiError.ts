/**
 * Read the user-safe message from a failed API response.
 * @param response - A response that isn't ok
 * @param fallback - The message to use when the body isn't the API's `{ error: string }` shape
 * @returns The server's message, or the fallback
 */
export async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  const data: unknown = await response.json().catch(() => null);
  if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string' && data.error) {
    return data.error;
  }
  return fallback;
}
