import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useBillStore } from './store/billStore';
import { MarketingScreen } from './components/Marketing/MarketingScreen';
import { CaptureScreen } from './components/Capture/CaptureScreen';
import { VerifyScreen } from './components/Verify/VerifyScreen';
import { ResultScreen } from './components/Result/ResultScreen';
import { ShareScreen } from './components/Result/ShareScreen';
import { SharedView } from './components/SharedView/SharedView';
import { NotFound } from './components/common/NotFound';

/** Routes the current store `screen` to the matching landing/capture/verify/result/share component. */
const BillFlow: React.FC = () => {
  const screen = useBillStore((s) => s.screen);

  if (screen === 'landing') return <MarketingScreen />;
  if (screen === 'capture') return <CaptureScreen />;
  if (screen === 'verify') return <VerifyScreen />;
  if (screen === 'share') return <ShareScreen />;
  return <ResultScreen />;
};

/**
 * Top-level router — `/` runs the landing→capture→verify→result→share flow, `/b/:id` renders a shared bill,
 * and any other path falls through to the not-found screen.
 * @returns The full app shell with route definitions
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BillFlow />} />
        <Route path="/b/:id" element={<SharedView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
