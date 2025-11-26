import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase/client.js';

import BottomNav from './components/BottomNav.jsx';
import TopNav from './components/TopNav.jsx';
import Home from './pages/Home.jsx';
import UMKMList from './pages/UMKMList.jsx';
import UMKMDetail from './pages/UMKMDetail.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Location from './pages/Location.jsx';
import Profile from './pages/Profile.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import ProductForm from './pages/ProductForm.jsx';
import UMKMForm from './pages/UMKMForm.jsx';
import Login from './pages/Login.jsx';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  const location = useLocation(); 
  const isLoginPage = location.pathname === '/login'; 
  const isHomePage = location.pathname === '/'; 
  
  const fullWidthRoutes = [
    '/profile',
    '/umkm',
    '/products',
    '/location',
  ];

  const requiresFullWidth = isLoginPage || fullWidthRoutes.includes(location.pathname);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) return <SplashScreen />;

  const ProtectedRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };

  let mainClass;
  
  if (isLoginPage) {
    mainClass = "w-full min-h-screen mx-auto"; 
  } else if (isHomePage) {
    mainClass = "w-full md:max-w-7xl mx-auto md:px-6 md:py-6 pb-24 md:pb-0";
  } else {
    mainClass = "w-full min-h-screen mx-auto pb-24 md:pb-0";
  }

  const shouldShowNav = !isLoginPage;

  return (
    <div className={`min-h-screen ${isLoginPage ? 'bg-blue-100' : 'bg-gray-50'} text-slate-800 font-sans animate-fade-in`}>
      
      {shouldShowNav && (
        <div className="hidden md:block sticky top-0 z-50">
          <TopNav />
        </div>
      )}

      <main className={mainClass}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/umkm" element={<ProtectedRoute><UMKMList /></ProtectedRoute>} />
          <Route path="/umkm/:id" element={<ProtectedRoute><UMKMDetail /></ProtectedRoute>} />
          <Route path="/umkm/new" element={<ProtectedRoute><UMKMForm /></ProtectedRoute>} />
          <Route path="/umkm/edit/:id" element={<ProtectedRoute><UMKMForm /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path="/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/products/edit/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
          <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile session={session} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {shouldShowNav && (
          <div className="md:hidden">
            <BottomNav />
          </div>
      )}
    </div>
  );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;