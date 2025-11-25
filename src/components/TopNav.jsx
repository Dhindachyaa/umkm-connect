import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';

// --- PALET WARNA ---
// PRIMARY_DARK: #324976 (Teks, Judul)
// PRIMARY_ACCENT: #236fa6 (Link, Aksi, Harga)
// BG_LIGHT: #e0f2fe (Latar Belakang Pucat, Border)
// -------------------

const TopNav = () => {
  const location = useLocation();

  const navClass = (path) =>
    location.pathname === path
      ? "text-[#236fa6] font-bold border-b-2 border-[#236fa6] pb-1"
      : "text-[#324976] opacity-80 hover:text-[#236fa6] font-medium transition-colors";

  // Cek apakah halaman profile aktif
  const isProfileActive = location.pathname === '/profile';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center">
     
      {/* 1. KIRI: Logo Section */}
      <Link to="/" className="flex items-center gap-2">
        {/* Logo Icon BG: PRIMARY_ACCENT #236fa6 */}
        <div className="bg-[#236fa6] text-white p-1.5 rounded-lg">
          <ShoppingBag size={20} />
        </div>
        {/* Teks Logo: PRIMARY_DARK #324976 */}
        <span className="text-xl font-bold tracking-tight text-[#324976]">UMKM Connect</span>
      </Link>

      {/* 2. KANAN: Wrapper untuk Menu + Profile */}
      <div className="flex items-center gap-8">
       
        {/* Menu Links */}
        <div className="flex gap-6 items-center">
          <Link to="/" className={navClass('/')}>Home</Link>
          <Link to="/umkm" className={navClass('/umkm')}>UMKM</Link>
          <Link to="/products" className={navClass('/products')}>Produk</Link>
          <Link to="/location" className={navClass('/location')}>Peta</Link>
        </div>

        {/* Garis Pemisah Kecil (Tetap netral) */}
        <div className="h-6 w-px bg-gray-200"></div>

        {/* Tombol Profile (CTA Akun Saya) */}
        <Link
          to="/profile"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all group
            ${isProfileActive 
              ? 'bg-[#236fa6] text-white' 
              : 'bg-[#e0f2fe] text-[#324976] hover:bg-[#236fa6] hover:text-white'
            }
          `}
        >
          <User size={18} />
          <span className="text-sm font-semibold">Akun Saya</span>
        </Link>

      </div>
    </nav>
  );
};

export default TopNav;
