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


// Tab routes are always mounted — hidden via CSS to preserve state & scroll
const TAB_ROUTES = ["/", "/my-sunny-spots", "/leaderboard", "/sunny-trails"];

// Full-width slide: stack pages slide in from the right, exit to the left
const stackVariants = {
  initial: { x: "100%", opacity: 1 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
  exit:    { x: "100%", opacity: 1, transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  const isTabRoute = TAB_ROUTES.includes(location.pathname);

  return (
    <AppShell>
      {/* Always-mounted tab pages — shown/hidden with CSS, NEVER unmounted (preserves scroll & state) */}
      <div style={{ display: isTabRoute ? "block" : "none", minHeight: "100%" }}>
        <div style={{ display: location.pathname === "/" ? "block" : "none" }}><Home /></div>
        <div style={{ display: location.pathname === "/my-sunny-spots" ? "block" : "none" }}><MySunnySpots /></div>
        <div style={{ display: location.pathname === "/leaderboard" ? "block" : "none" }}><Leaderboard /></div>
        <div style={{ display: location.pathname === "/sunny-trails" ? "block" : "none" }}><SunnyTrails /></div>
      </div>

      {/* Stack routes — slide over tabs, unmount on leave */}
      <AnimatePresence mode="wait" initial={false}>
        {!isTabRoute && (
          <motion.div
            key={location.pathname}
            variants={stackVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: "absolute", inset: 0, zIndex: 40, overflowY: "auto", background: "hsl(var(--background))" }}
          >
            <Routes location={location}>
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </motion.div>
        )}
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