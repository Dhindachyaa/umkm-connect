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
    if (!reviews.length) return 0;
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    return avg.toFixed(1);
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  return (
    <>
      <style>{`
        @keyframes homeFadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes homeSlideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes homeBounceIn {
          0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          50% { transform: scale(1.1) rotate(5deg); }
          70% { transform: scale(0.95) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes homeScaleIn {
          from { opacity: 0; transform: scale(0.5) rotate(-5deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes homeCardSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes homeFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(2deg); }
          66% { transform: translateY(-6px) rotate(-2deg); }
        }
        @keyframes homeFloatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-20px) rotate(8deg) scale(1.05); }
        }
        @keyframes homePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes homeWave {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
        }
        @keyframes homeShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes homeRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes homeGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(35, 111, 166, 0.3); }
          50% { box-shadow: 0 0 40px rgba(35, 111, 166, 0.6), 0 0 60px rgba(35, 111, 166, 0.4); }
        }
        @keyframes homeBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes homeSpinSlow {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes skeletonShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-animate {
          animation: skeletonPulse 1.8s ease-in-out infinite;
          position: relative;
          overflow: hidden;
        }
        .skeleton-animate::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          animation: skeletonShine 2s ease-in-out infinite;
        }
        .home-header-animate { animation: homeSlideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .home-profile-animate { animation: homeBounceIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both; }
        .home-hero-animate { animation: homeFadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both; }
        .home-category-animate { animation: homeFadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both; }
        .home-category-item { animation: homeScaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .home-section-animate { animation: homeFadeInUp 0.9s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .home-card-animate { animation: homeCardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .home-float { animation: homeFloat 4s ease-in-out infinite; }
        .home-float-slow { animation: homeFloatSlow 5s ease-in-out infinite; }
        .home-pulse { animation: homePulse 2.5s ease-in-out infinite; }
        .home-wave { animation: homeWave 2.5s ease-in-out infinite; display: inline-block; transform-origin: 70% 70%; }
        .home-shimmer {
          background: linear-gradient( 90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100% );
          background-size: 200% 100%;
          animation: homeShimmer 3s linear infinite;
        }
        .home-rotate-slow { animation: homeSpinSlow 25s linear infinite; }
        .home-glow { animation: homeGlow 3s ease-in-out infinite; }
        .home-breathe { animation: homeBreathe 4s ease-in-out infinite; }
        .hover-lift { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .hover-lift:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); }
        .hover-scale { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hover-scale:hover { transform: scale(1.1); }
        .hover-glow { transition: all 0.4s ease; }
        .hover-glow:hover { box-shadow: 0 0 30px rgba(35, 111, 166, 0.5), 0 0 60px rgba(35, 111, 166, 0.3); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="p-4 md:p-0 pb-10 space-y-8 bg-grey">

        <header className="flex justify-between items-center home-header-animate">
          <div>
            <h1 className="text-2xl font-bold text-[#324976]">
              Halo, {userProfile.name}! 
              <span className="inline-block home-wave ml-2">👋</span>
            </h1>
            <p className="text-[#324976] text-sm opacity-70 mt-1">Mau cari apa hari ini?</p>
          </div>
          <div className="home-profile-animate">
            {userProfile.photo ? (
              <img 
                src={userProfile.photo} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border-4 border-[#236fa6] shadow-lg hover-scale" 
              />
            ) : (
              <div className="p-2 bg-[#e0f2fe] rounded-full hover-scale">
                <UserCircle size={40} className="text-[#236fa6]" />
              </div>
            )}
          </div>
        </header>

        <div className="bg-gradient-to-r from-[#236fa6] to-[#324976] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group home-hero-animate hover-lift hover-glow">
          <div className="relative z-10 max-w-lg">
            <span className="bg-white/20 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block home-pulse">
              Support Lokal
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              UMKM Bangkit, <br/>Ekonomi Melejit!
            </h2>
            <p className="text-white text-sm md:text-base mb-6 max-w-[80%] opacity-90">
              Temukan produk handmade dengan kualitas pilihan.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-[#236fa6] px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-[#e0f2fe] transition-all duration-300 hover:gap-3 group/btn"
            >
              Lihat Produk
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full home-breathe"></div>
          <div className="absolute top-5 right-5 opacity-20 text-white home-float-slow">
            <TrendingUp size={60} />
          </div>
          <div className="absolute bottom-5 left-5 w-20 h-20 border-2 border-white/20 rounded-full home-rotate-slow"></div>
          <div className="absolute inset-0 home-shimmer opacity-10"></div>
        </div>

        <div className="home-category-animate">
          <h3 className="font-bold text-[#324976] mb-4 text-lg">Kategori Pilihan</h3>
          <div className="flex justify-between gap-2">
            {categories.map((cat, idx) => (
              <Link
                to={`/products?category=${cat.name}`}
                key={idx}
                className="home-category-item flex flex-col items-center min-w-[60px] flex-1 group cursor-pointer"
                style={{ animationDelay: `${0.7 + (idx * 0.1)}s` }}
              >
                <div className="bg-[#e0f2fe] text-[#236fa6] p-4 rounded-full shadow-sm hover-scale">
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-[#324976] text-center truncate mt-2">{capitalize(cat.name)}</span>
              </Link>
            ))}
          </div>
        </div>
      
        <div className="home-section-animate" style={{ animationDelay: '1.2s' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-[#324976] flex items-center gap-2">
              <div className="p-2 bg-[#e0f2fe] rounded-lg home-pulse">
                <Store size={20} className="text-[#236fa6]" />
              </div>
              Toko Populer
            </h3>
            <Link 
              to="/umkm" 
              className="text-[#236fa6] text-sm font-semibold flex items-center hover:underline group"
            >
              Lihat Semua 
              <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            {loading ? [1,2,3].map(i => (
              <div 
                key={i} 
                className="min-w-[180px] h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl skeleton-animate"
              ></div>
            )) : featuredUmkm.map((u, idx) => (
              <Link
                to={`/umkm/${u.id}`}
                key={u.id}
                className="home-card-animate min-w-[180px] md:min-w-[220px] bg-white p-4 rounded-xl shadow-md border border-gray-100 snap-center hover-lift hover:border-[#236fa6]/30 transition-all duration-300 cursor-pointer group"
                style={{ animationDelay: `${1.4 + (idx * 0.1)}s` }}
              >
                <div className="flex flex-col items-center w-full pb-3 border-b border-gray-100 mb-3">
                  <div className="relative p-1 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] rounded-full mb-3 flex-shrink-0 hover-scale">
                    <img
                      src={u.image_url || 'https://placehold.co/100'}
                      className="w-16 h-16 rounded-full object-cover bg-white border-2 border-white shadow-md"
                      alt={u.name}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#236fa6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <h4 className="font-bold text-lg text-[#324976] text-center group-hover:text-[#236fa6] transition-colors">
                    {u.name}
                  </h4>
                  <p className="text-sm text-[#236fa6] font-medium text-center opacity-80">
                    {capitalize(u.category)}
                  </p>
                </div>
                <div className="w-full pt-1">
                  <div className="flex items-center text-sm text-gray-600 group-hover:text-[#236fa6] transition-colors">
                    <MapPin size={14} className="mr-2 text-[#236fa6] flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{u.address || 'Semarang'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div 
          className="home-section-animate bg-gradient-to-r from-[#236fa6] to-[#324976] rounded-xl p-6 text-white relative overflow-hidden shadow-xl hover-lift hover-glow group cursor-pointer"
          style={{ animationDelay: '1.8s' }}
        >
          <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-white/5 rounded-full opacity-50 transform rotate-45 pointer-events-none z-0 home-breathe"></div>
          <div className="absolute bottom-0 right-0 text-white/10 z-0 home-float">
            <MapPin size={150} />
          </div>
          <div className="absolute inset-0 home-shimmer opacity-5"></div>
          <div className="relative z-10 max-w-lg">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">
              Cari di Sekitarmu?
            </h3>
            <p className="text-base text-white mb-5 opacity-95">
              Lihat peta sebaran UMKM terdekat.
            </p>
            <Link
              to="/location"
              className="inline-flex items-center gap-2 bg-white text-[#236fa6] px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300 hover:gap-3 group/btn"
            >
              Buka Peta 
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="home-section-animate" style={{ animationDelay: '2.1s' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#324976] text-lg flex items-center gap-2">
              Rekomendasi Produk
            </h3>
            <Link 
              to="/products" 
              className="text-[#236fa6] text-xs font-semibold flex items-center group hover:underline"
            >
              Lihat Semua 
              <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? [...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="h-48 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] rounded-xl skeleton-animate"
              ></div>
            )) :
            products.map((item, idx) => (
              <Link
                to={`/products/${item.id}`}
                key={item.id}
                className="home-card-animate bg-white rounded-xl shadow-md border border-[#e0f2fe] overflow-hidden hover-lift hover:border-[#236fa6]/50 transition-all duration-300 group"
                style={{ animationDelay: `${2.3 + (idx * 0.08)}s` }}
              >
                <div className="h-32 md:h-40 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] relative overflow-hidden">
                  <img 
                    src={item.image_url || 'https://placehold.co/300'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={item.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold shadow-md text-[#324976] flex items-center gap-1">
                    <span className="home-pulse">⭐</span>
                    {getProductRating(item.id)}
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm truncate text-[#324976] group-hover:text-[#236fa6] transition-colors">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-[#236fa6] text-sm font-bold">
                      Rp {item.price?.toLocaleString('id-ID')}
                    </p>
                    <div className="bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] p-1.5 rounded-full text-[#236fa6] hover-scale shadow-sm">
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;