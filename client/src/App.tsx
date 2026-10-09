import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CaptureScreen } from './components/Capture/CaptureScreen';
import { NotFound } from './components/common/NotFound';
import { MarketingScreen } from './components/Marketing/MarketingScreen';
import { ResultScreen } from './components/Result/ResultScreen';
import { ShareScreen } from './components/Result/ShareScreen';
import { SharedView } from './components/SharedView/SharedView';
import { VerifyScreen } from './components/Verify/VerifyScreen';

import { useBillStore } from './store/billStore';

import type { Screen } from './types/bill';

/** The flow's screens in order; the system back gesture steps to the one before. */
const FLOW: Screen[] = ['landing', 'capture', 'verify', 'result', 'share'];

/** Set once the app first renders, so a later `BillFlow` mount knows it was reached from another route. */
let hasAppMounted = false;

/**
 * Routes the current store `screen` to its component, opening each at the top with focus on its heading. It also maps
 * the system back gesture to the previous screen and ignores file drops outside the capture drop zone and double-tap
 * clicks carried over to a new screen, a dialog, or a control that replaced a removed one.
 * @returns The current screen
 */
const BillFlow: React.FC = () => {
  const screen = useBillStore((s) => s.screen);

  // Each new screen opens at the top. The page's first render is left alone, so it keeps what a reload restores;
  // arriving from another route (a shared bill's "Split your own bill") counts as a new screen.
  const prevScreenRef = useRef<Screen | null>(hasAppMounted ? null : screen);
  // The screen this one was opened from, unless Back brought it up; the back guard below reads it.
  const cameFromRef = useRef<Screen | null>(null);
  const isBackRef = useRef(false);
  useLayoutEffect(() => {
    if (prevScreenRef.current === screen) return;
    cameFromRef.current = isBackRef.current ? null : prevScreenRef.current;
    isBackRef.current = false;
    prevScreenRef.current = screen;
    window.scrollTo({ top: 0, behavior: 'instant' });
    // The control that changed screens is gone, so move focus to the new screen's heading for screen readers.
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [screen]);

  // System back (Android's button, iOS's edge swipe) would leave the page and the bill held only in memory. Past the
  // landing page, one history entry stands in front of the app: Back pops it and steps back a screen instead. The entry
  // is tagged, so a reload on it (which restarts on the landing page) still knows to drop it.
  const isGuardedRef = useRef(window.history.state?.isFlowGuard === true);
  useEffect(() => {
    if (screen !== 'landing' && !isGuardedRef.current) {
      window.history.pushState({ ...window.history.state, isFlowGuard: true }, '');
      isGuardedRef.current = true;
    } else if (screen === 'landing' && isGuardedRef.current) {
      // Back on the landing page should leave, so drop the entry an in-app return or a reload left behind.
      isGuardedRef.current = false;
      window.history.back();
    }
  }, [screen]);
  useEffect(() => {
    const handlePopState = () => {
      if (!isGuardedRef.current) return;
      isGuardedRef.current = false;
      // Fields save when they lose focus, so let the one being edited save before its screen goes away.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      const { screen: current, setScreen } = useBillStore.getState();
      // Capture opened from Verify (to add a receipt) returns there, as its own back link does; landing would strand
      // the bill. Anything else steps back in flow order.
      const isBackToVerify = current === 'capture' && cameFromRef.current === 'verify';
      isBackRef.current = true;
      setScreen(isBackToVerify ? 'verify' : FLOW[Math.max(FLOW.indexOf(current) - 1, 0)]);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // A double-tap's second click lands on whatever the first one put under the finger: a new screen (Share's Start a
  // new bill under Result's Create), a dialog it opened (the assign sheet's checklist), or a control that slid into
  // place (the next row's remove, Add another receipt). Drop it unless the same screen and dialog are up and the
  // first tap's control is still under that point. Keyboard and scripted clicks (`detail` 0) pass untouched.
  useEffect(() => {
    let tap: { layer: string; x: number; y: number; control: Element | null } | null = null;
    const dropCarriedClick = (e: MouseEvent) => {
      if (e.detail === 0) return;
      const isDialogOpen = document.querySelector('[aria-modal="true"]') !== null;
      const layer = `${useBillStore.getState().screen}${isDialogOpen ? ':dialog' : ''}`;
      if (e.detail === 1) {
        tap = { layer, x: e.clientX, y: e.clientY, control: controlAt(e.target) };
        return;
      }
      if (tap?.layer === layer && controlAt(document.elementFromPoint(tap.x, tap.y)) === tap.control) return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('click', dropCarriedClick, true);
    return () => window.removeEventListener('click', dropCarriedClick, true);
  }, []);

  // The bill lives only in memory, and a file dropped outside the capture drop zone would open in the tab and lose it.
  useEffect(() => {
    const blockFileDrop = (e: DragEvent) => {
      if (e.defaultPrevented || !e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none';
    };
    window.addEventListener('dragover', blockFileDrop);
    window.addEventListener('drop', blockFileDrop);
    return () => {
      window.removeEventListener('dragover', blockFileDrop);
      window.removeEventListener('drop', blockFileDrop);
    };
  }, []);

  if (screen === 'landing') return <MarketingScreen />;
  if (screen === 'capture') return <CaptureScreen />;
  if (screen === 'verify') return <VerifyScreen />;
  if (screen === 'share') return <ShareScreen />;
  return <ResultScreen />;
};

/**
 * Top-level router — `/` runs the landing→capture→verify→result→share flow, `/b/:id` renders a shared bill,
 * and any other path falls through to the not-found screen. Framer Motion follows the user's reduced-motion setting.
 * @returns The full app shell with route definitions
 */
export const App: React.FC = () => {
  useEffect(() => {
    hasAppMounted = true;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BillFlow />} />
          <Route path="/b/:id" element={<SharedView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
};

/** The control a click landed in (or the element itself outside one), to tell whether a tap's spot changed. */
function controlAt(node: EventTarget | null): Element | null {
  return node instanceof Element ? (node.closest('a, button, input, label, select') ?? node) : null;
}
