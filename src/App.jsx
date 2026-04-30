import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import MySunnySpots from './pages/MySunnySpots';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Leaderboard from './pages/Leaderboard';
import SunnyTrails from './pages/SunnyTrails';
import About from './pages/About';
import RoutesMap from './pages/RoutesMap';
import AppShell from './components/AppShell';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Auto dark mode based on system preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => document.documentElement.classList.toggle('dark', e.matches);
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app — needs location for AnimatePresence key
  return <AnimatedRoutes />;
};


const pageVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.18, ease: "easeIn" } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AppShell>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ minHeight: "100%" }}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/my-sunny-spots" element={<MySunnySpots />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/sunny-trails" element={<SunnyTrails />} />
            <Route path="/about" element={<About />} />
            <Route path="/routes-map" element={<RoutesMap />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App