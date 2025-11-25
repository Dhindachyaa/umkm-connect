import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Shirt, Gift, Zap, MapPin, TrendingUp, Store, UserCircle } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredUmkm, setFeaturedUmkm] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userProfile, setUserProfile] = useState({
    name: "Pengunjung Tamu",
    photo: null
  });

  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('user_profile') || 'null');
    if (savedProfile) {
      setUserProfile({
        name: savedProfile.name || "Pengunjung Tamu",
        photo: savedProfile.photo || null
      });
    }
  }, []);

  const categories = [
    { name: 'Makanan', icon: <Utensils size={20} /> },
    { name: 'Minuman', icon: <Gift size={20} /> },
    { name: 'Fashion', icon: <Shirt size={20} /> },
    { name: 'Kerajinan', icon: <Gift size={20} /> },
    { name: 'Jasa', icon: <Zap size={20} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: prodData } = await supabase.from('products').select('*').limit(8);
      const { data: umkmData } = await supabase.from('umkm').select('*').limit(5);
      if (prodData) setProducts(prodData);
      if (umkmData) setFeaturedUmkm(umkmData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getProductRating = (productId) => {
    const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
    if (!reviews.length) return 4.8;
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <div className="p-4 md:p-0 pb-10 space-y-8 bg-grey">

      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#324976]">Halo, {userProfile.name}! 👋</h1>
          <p className="text-[#324976] text-sm opacity-70">Mau cari apa hari ini?</p>
        </div>
        <div>
          {userProfile.photo ? (
            <img src={userProfile.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#236fa6]" />
          ) : (
            <UserCircle size={40} className="text-[#236fa6]" />
          )}
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-[#236fa6] to-[#324976] rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden group">
        <div className="relative z-10 max-w-lg">
          <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Support Lokal</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">UMKM Bangkit, <br/>Ekonomi Melejit!</h2>
          <p className="text-white text-sm md:text-base mb-6 max-w-[80%] opacity-80">Temukan produk handmade dengan kualitas pilihan.</p>
          <Link
            to="/products"
            className="bg-white text-[#236fa6] px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-[#e0f2fe] transition-colors"
          >
            Lihat Produk
          </Link>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute top-10 right-10 opacity-20 text-white animate-bounce">
            <TrendingUp size={60} />
        </div>
      </div>

      {/* KATEGORI */}
      <div>
        <h3 className="font-bold text-[#324976] mb-4 text-lg">Kategori Pilihan</h3>
        <div className="flex justify-between gap-2 overflow-x-auto">
          {categories.map((cat, idx) => (
            <Link
              to={`/products?category=${cat.name}`}
              key={idx}
              className="flex flex-col items-center min-w-[60px] flex-1 group cursor-pointer"
            >
              <div className="bg-[#e0f2fe] text-[#236fa6] p-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-[#324976] text-center truncate">{capitalize(cat.name)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* UMKM POPULER */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-[#324976] flex items-center gap-2">
            <Store size={20} className="text-[#236fa6]" /> Toko Populer
          </h3>
          <Link to="/umkm" className="text-[#236fa6] text-sm font-semibold flex items-center hover:underline">
            Lihat Semua <ArrowRight size={16} className="ml-1"/>
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
          {loading ? [1,2,3].map(i => (
            <div key={i} className="min-w-[180px] h-36 bg-gray-100 rounded-xl animate-pulse"></div>
          )) : featuredUmkm.map((u) => (
            <Link
              to={`/umkm/${u.id}`}
              key={u.id}
              className="min-w-[180px] md:min-w-[220px] bg-white p-4 rounded-xl shadow-md border border-gray-100 snap-center
                         hover:shadow-lg hover:border-[#e0f2fe] transition-all duration-300 transform hover:translate-y-[-2px] cursor-pointer"
            >
              <div className="flex flex-col items-center w-full pb-3 border-b border-gray-100 mb-3">
                <div className="p-1 bg-[#e0f2fe] rounded-full mb-3 flex-shrink-0">
                  <img
                    src={u.image_url || 'https://placehold.co/100'}
                    className="w-16 h-16 rounded-full object-cover bg-white"
                    alt={u.name}
                  />
                </div>
                <h4 className="font-bold text-lg text-[#324976] text-center">{u.name}</h4>
                <p className="text-sm text-[#236fa6] font-medium text-center opacity-80">{capitalize(u.category)}</p>
              </div>
              <div className="w-full pt-1">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-2 text-[#236fa6] flex-shrink-0" />
                  <span className="truncate max-w-[180px]">{u.address || 'Semarang'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA MAP */}
      <div className="bg-gradient-to-r from-[#236fa6] to-[#324976] rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-white/5 rounded-full opacity-50 transform rotate-45 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 text-white/10 z-0">
          <MapPin size={150} />
        </div>
        <div className="relative z-10 max-w-lg">
          <h3 className="font-extrabold text-white text-2xl mb-2">Cari di Sekitarmu?</h3>
          <p className="text-base text-white mb-5 opacity-95">Lihat peta sebaran UMKM terdekat.</p>
          <Link
            to="/location"
            className="inline-flex items-center gap-1 bg-white text-[#236fa6] px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-100 transition-colors"
          >
            Buka Peta <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* PRODUK */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#324976] text-lg">Rekomendasi Produk</h3>
          <Link to="/products" className="text-[#236fa6] text-xs flex items-center">
            Lihat Semua <ArrowRight size={14} className="ml-1"/>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[#e0f2fe] rounded-xl animate-pulse"></div>
          )) :
          products.map((item) => (
            <Link
              to={`/products/${item.id}`}
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-[#e0f2fe] overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-32 md:h-40 bg-[#e0f2fe] relative">
                <img src={item.image_url || 'https://placehold.co/300'} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm text-[#324976]">
                  ⭐ {getProductRating(item.id)}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm truncate text-[#324976]">{item.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[#236fa6] text-sm font-bold">
                    Rp {item.price?.toLocaleString('id-ID')}
                  </p>
                  <div className="bg-[#e0f2fe] p-1 rounded text-[#236fa6]">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
