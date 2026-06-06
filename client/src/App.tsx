import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useBillStore } from './store/billStore';
import { CaptureScreen } from './components/Capture/CaptureScreen';
import { VerifyScreen } from './components/Verify/VerifyScreen';
import { ResultScreen } from './components/Result/ResultScreen';
import { SharedView } from './components/SharedView/SharedView';

/** Routes the current store `screen` to the matching capture/verify/result component. */
const BillFlow: React.FC = () => {
  const screen = useBillStore((s) => s.screen);

  if (screen === 'capture') return <CaptureScreen />;
  if (screen === 'verify') return <VerifyScreen />;
  return <ResultScreen />;
};

/**
 * Top-level router — `/` runs the capture→verify→result flow, `/b/:id` renders a shared bill.
 * @returns The full app shell with route definitions
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BillFlow />} />
        <Route path="/b/:id" element={<SharedView />} />
      </Routes>
    </BrowserRouter>
  );
};
