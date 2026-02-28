import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import FeedPage from './pages/FeedPage';
import { ProfilePage, ExplorePage, SettingsPage } from './pages/Pages';
import './index.css';

// ── Protected Route ──────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ── Public Route (redirect if logged in) ─────────────────────
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

// ── App Routes ───────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* App routes (layout wraps all) */}
      <Route path="/" element={<AppLayout><FeedPage /></AppLayout>} />
      <Route path="/explore" element={<AppLayout><ExplorePage /></AppLayout>} />
      <Route path="/profile/:username" element={<AppLayout><ProfilePage /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><ProtectedRoute><SettingsPage /></ProtectedRoute></AppLayout>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--black-3)',
              color: 'var(--white)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '13.5px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#e8a830', secondary: '#0a0a0a' },
            },
            error: {
              iconTheme: { primary: '#e85d75', secondary: '#0a0a0a' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
