import { Home, Store, ShoppingBag, MapPin, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

// --- PALET WARNA ---
// PRIMARY_DARK: #324976
// PRIMARY_ACCENT: #236fa6
// BG_LIGHT: #e0f2fe
// -------------------

const BottomNav = () => {
  const location = useLocation();

  // Fungsi helper untuk mengecek link aktif
  const isActive = (path) => location.pathname === path
    // Warna Aktif: PRIMARY_ACCENT #236fa6
    ? "text-[#236fa6] scale-110 font-semibold"
    // Warna Tidak Aktif: PRIMARY_DARK #324976 dengan opasitas, hover menggunakan PRIMARY_ACCENT
    : "text-[#324976]/70 hover:text-[#236fa6]";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 max-w-md mx-auto h-16">
      <Link to="/" className={`flex flex-col items-center transition-all ${isActive('/')}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </Link>
     
      <Link to="/umkm" className={`flex flex-col items-center transition-all ${isActive('/umkm')}`}>
        <Store size={24} />
        <span className="text-[10px] font-medium mt-1">UMKM</span>
      </Link>

      {/* Tombol Tengah Menonjol (Products) */}
      <Link
        to="/products"
        // Background: PRIMARY_ACCENT #236fa6, Ring: BG_LIGHT #e0f2fe
        className={`flex flex-col items-center transition-all -mt-5 bg-[#236fa6] p-3 rounded-full shadow-lg text-white ring-4 ring-[#e0f2fe] hover:scale-105`}
      >
        <ShoppingBag size={24} />
      </Link>

      <Link to="/location" className={`flex flex-col items-center transition-all ${isActive('/location')}`}>
        <MapPin size={24} />
        <span className="text-[10px] font-medium mt-1">Peta</span>
      </Link>

      <Link to="/profile" className={`flex flex-col items-center transition-all ${isActive('/profile')}`}>
        <User size={24} />
        <span className="text-[10px] font-medium mt-1">Profil</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
