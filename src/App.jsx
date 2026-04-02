import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

const Landing = lazy(() => import('./pages/Landing'));
const NotFound = lazy(() => import('./pages/NotFound'));
const DFAPage = lazy(() => import('./modules/dfa/DFAPage'));
const NFAPage = lazy(() => import('./modules/nfa/NFAPage'));
const RegExPage = lazy(() => import('./modules/regex/RegExPage'));
const PDAPage = lazy(() => import('./modules/pda/PDAPage'));
const TMPage = lazy(() => import('./modules/turing/TMPage'));
const ChomskyPage = lazy(() => import('./modules/chomsky/ChomskyPage'));
const PumpingPage = lazy(() => import('./modules/pumping/PumpingPage'));
const CYKPage = lazy(() => import('./modules/cyk/CYKPage'));
const QuizPage = lazy(() => import('./modules/quiz/QuizPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-violet/30 border-t-violet animate-spin" />
        <p className="font-display text-xl text-text-primary">AutomataVerse</p>
        <p className="text-sm text-text-muted mt-1">Loading module...</p>
      </div>
    </div>
  );
}



function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dfa" element={<DFAPage />} />
        <Route path="/nfa" element={<NFAPage />} />
        <Route path="/regex" element={<RegExPage />} />
        <Route path="/pda" element={<PDAPage />} />
        <Route path="/turing" element={<TMPage />} />
        <Route path="/chomsky" element={<ChomskyPage />} />
        <Route path="/pumping" element={<PumpingPage />} />
        <Route path="/cyk" element={<CYKPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
