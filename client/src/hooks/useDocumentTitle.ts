import { useEffect } from 'react';

/**
 * Show a page-specific title in the browser tab (and to screen readers), restoring the previous one on unmount.
 * @param title - The title to show, or undefined to leave the current one alone
 */
export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (!title) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
