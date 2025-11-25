import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase/client';

import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import Home from './pages/Home';
import UMKMList from './pages/UMKMList';
import UMKMDetail from './pages/UMKMDetail';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Location from './pages/Location';
import Profile from './pages/Profile';
import SplashScreen from './components/SplashScreen';
import ProductForm from './pages/ProductForm';
import UMKMForm from './pages/UMKMForm';
import Login from './pages/Login';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Splashscreen 2.5 detik
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Ambil session Supabase saat mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) return <SplashScreen />;

  // Wrapper route yang butuh login
  const ProtectedRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-slate-800 font-sans animate-fade-in">
        <div className="hidden md:block sticky top-0 z-50">
          <TopNav />
        </div>

        <main className="w-full md:max-w-7xl mx-auto md:px-6 md:py-6 pb-24 md:pb-0">
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Home & Public */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />

            {/* UMKM */}
            <Route path="/umkm" element={
              <ProtectedRoute>
                <UMKMList />
              </ProtectedRoute>
            } />
            <Route path="/umkm/:id" element={
              <ProtectedRoute>
                <UMKMDetail />
              </ProtectedRoute>
            } />
            <Route path="/umkm/new" element={
              <ProtectedRoute>
                <UMKMForm />
              </ProtectedRoute>
            } />
            <Route path="/umkm/edit/:id" element={
              <ProtectedRoute>
                <UMKMForm />
              </ProtectedRoute>
            } />

            {/* Produk */}
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductList />
              </ProtectedRoute>
            } />
            <Route path="/products/:id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } />
            <Route path="/products/new" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            <Route path="/products/edit/:id" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />

            {/* Lokasi */}
            <Route path="/location" element={
              <ProtectedRoute>
                <Location />
              </ProtectedRoute>
            } />

            {/* Profil */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile session={session} />
              </ProtectedRoute>
            } />

            {/* Redirect semua route tidak dikenal ke home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
