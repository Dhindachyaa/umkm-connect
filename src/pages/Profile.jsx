import { useState, useEffect } from 'react';
import { Trash2, UserCircle, Edit, Save, Camera, Heart, LogOut, Star, Award, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const DEFAULT_PROFILE_DATA = {
  name: "Pengguna",
  bio: "Saya senang menjelajahi produk-produk lokal dan UMKM Semarang.",
  photo: null,
};

const Profile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState(DEFAULT_PROFILE_DATA.name);
  const [bio, setBio] = useState(DEFAULT_PROFILE_DATA.bio);
  const [profilePic, setProfilePic] = useState(DEFAULT_PROFILE_DATA.photo);
  const [isEditing, setIsEditing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [favoritesUMKM, setFavoritesUMKM] = useState([]);
  const [favoritesProduct, setFavoritesProduct] = useState([]);
  const [activeTab, setActiveTab] = useState('umkm'); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) navigate('/login');
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoritesUMKM(saved.filter(item => item.type === "umkm"));
    setFavoritesProduct(saved.filter(item => item.type === "product"));

    const savedProfile = JSON.parse(localStorage.getItem('user_profile') || 'null');

    if (session?.user) {
      setUserEmail(session.user.email);
      const googleName = session.user.user_metadata?.full_name;
      const defaultName = googleName || session.user.email.split('@')[0];

      if (savedProfile) {
        setUserName(savedProfile.name || defaultName);
        setBio(savedProfile.bio || DEFAULT_PROFILE_DATA.bio);
        setProfilePic(savedProfile.photo || DEFAULT_PROFILE_DATA.photo);
      } else {
        setUserName(defaultName);
        setBio(DEFAULT_PROFILE_DATA.bio);
        setProfilePic(DEFAULT_PROFILE_DATA.photo);
      }
    } else {
      setUserEmail('Sesi Tamu');
      if (savedProfile) {
        setUserName(savedProfile.name);
        setBio(savedProfile.bio);
        setProfilePic(savedProfile.photo);
      }
    }
  }, [session]);

  const handleSaveProfile = () => {
    localStorage.setItem(
      'user_profile',
      JSON.stringify({ name: userName, bio, photo: profilePic })
    );
    setIsEditing(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !session?.user) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; 
    if (file.size > MAX_FILE_SIZE) { 
        alert('Gagal: Ukuran file melebihi batas (Maks. 5MB). Coba gunakan gambar yang lebih kecil.');
        return; 
    }
    try {
      const fileName = `${session.user.id}-${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from('profile_pics')
        .upload(fileName, file, { upsert: true, metadata: { user_id: session.user.id } });

      if (error) throw error;

      const { data } = supabase.storage
        .from('profile_pics')
        .getPublicUrl(fileName);

      setProfilePic(data.publicUrl);

      localStorage.setItem(
        'user_profile',
        JSON.stringify({ name: userName, bio, photo: data.publicUrl })
      );
    } catch (error) {
      console.error('Upload gagal:', error.message);
      alert('Gagal upload gambar: ' + error.message);
    }
  };

  const removeFavorite = (id) => {
    const all = [...favoritesUMKM, ...favoritesProduct];
    const updated = all.filter(item => item.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setFavoritesUMKM(updated.filter(i => i.type === "umkm"));
    setFavoritesProduct(updated.filter(i => i.type === "product"));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert('Logout Gagal: ' + error.message);
    else navigate('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-[#e0f2fe]/30">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <UserCircle size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-gray-700">Silakan Login untuk melihat Profil</p>
        </div>
      </div>
    );
  }

  const totalFavorites = favoritesUMKM.length + favoritesProduct.length;

  return (
    <>
      <style>{`
        @keyframes profileMeshMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes profileOrbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
        }

        @keyframes profileRotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes profileRotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes profileRingPulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }

        @keyframes profileCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes profileFadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes favoriteItemFadeIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .profile-mesh-gradient {
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0%, rgba(224, 242, 254, 0.1) 25%, rgba(255, 255, 255, 0.05) 50%, rgba(224, 242, 254, 0.1) 75%, rgba(255, 255, 255, 0.05) 100%);
          background-size: 400% 400%;
          animation: profileMeshMove 20s ease infinite;
        }

        .profile-orb-1 {
          top: 15%;
          left: 10%;
          animation: profileOrbFloat 18s ease-in-out infinite;
        }

        .profile-orb-2 {
          top: 60%;
          right: 15%;
          animation: profileOrbFloat 22s ease-in-out infinite 5s;
        }

        .profile-orb-3 {
          bottom: 20%;
          left: 20%;
          animation: profileOrbFloat 20s ease-in-out infinite 10s;
        }

        .profile-rotate-slow {
          animation: profileRotateSlow 30s linear infinite;
        }

        .profile-rotate-reverse {
          animation: profileRotateReverse 25s linear infinite;
        }

        .profile-ring-pulse-1 {
          animation: profileRingPulse 3s ease-in-out infinite;
        }

        .profile-ring-pulse-2 {
          animation: profileRingPulse 3s ease-in-out infinite 0.5s;
        }

        .profile-ring-pulse-3 {
          animation: profileRingPulse 3s ease-in-out infinite 1s;
        }

        .profile-card-float {
          animation: profileCardFloat 4s ease-in-out infinite;
        }

        .profile-fade-in-1 {
          animation: profileFadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .profile-fade-in-2 {
          animation: profileFadeInUp 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .profile-fade-in-3 {
          animation: profileFadeInUp 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .profile-fade-in-4 {
          animation: profileFadeInUp 0.6s ease-out 0.6s forwards;
          opacity: 0;
        }

        .profile-fade-in-5 {
          animation: profileFadeInUp 0.6s ease-out 0.7s forwards;
          opacity: 0;
        }

        .profile-fade-in-6 {
          animation: profileFadeInUp 0.6s ease-out 0.8s forwards;
          opacity: 0;
        }

        .profile-fade-in-7 {
          animation: profileFadeInUp 0.6s ease-out 0.9s forwards;
          opacity: 0;
        }

        .favorite-item-fade-in {
          animation: favoriteItemFadeIn 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .tab-fade-in {
          animation: tabFadeIn 0.4s ease-out forwards;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#e0f2fe]/20 pb-6">
        
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#324976] via-[#236fa6] to-[#1e5a8a]">
            <div className="absolute inset-0 profile-mesh-gradient"></div>
            
            <div className="profile-orb-1 absolute w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="profile-orb-2 absolute w-48 h-48 rounded-full bg-[#e0f2fe]/20 blur-2xl"></div>
            <div className="profile-orb-3 absolute w-56 h-56 rounded-full bg-white/5 blur-3xl"></div>
            
            <div className="absolute top-10 right-20 w-32 h-32 border-2 border-white/10 rounded-full profile-rotate-slow"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 border border-white/10 rounded-full profile-rotate-reverse"></div>
          </div>

          <div className="relative z-10 pt-16 pb-32 px-4">
            
            <div className="flex justify-center mb-8 profile-fade-in-1">
              <div className="relative">
                <div className="absolute inset-0 -m-3">
                  <div className="profile-ring-pulse-1 absolute inset-0 rounded-full border-2 border-white/20"></div>
                  <div className="profile-ring-pulse-2 absolute inset-2 rounded-full border-2 border-white/30"></div>
                  <div className="profile-ring-pulse-3 absolute inset-4 rounded-full border-2 border-white/40"></div>
                </div>
                
                <div className="relative profile-card-float">
                  <div className="absolute -inset-1 bg-gradient-to-br from-white/40 to-white/10 rounded-full blur-lg"></div>
                  
                  {profilePic ? (
                    <img 
                      src={`${profilePic}?t=${Date.now()}`}
                      alt="Profile" 
                      className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl"
                    />
                  ) : (
                    <div className="relative w-36 h-36 rounded-full border-4 border-white bg-white/20 flex items-center justify-center shadow-2xl backdrop-blur-md">
                      <UserCircle size={80} className="text-white" />
                    </div>
                  )}
                  
                  <label className="absolute -bottom-1 -right-1 p-3 bg-white text-[#236fa6] rounded-full shadow-xl cursor-pointer hover:bg-[#e0f2fe] hover:scale-110 transition-all duration-300 group">
                    <Camera size={18} className="group-hover:rotate-12 transition-transform" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="text-center mb-8 profile-fade-in-2">
              <p className="text-sm font-medium text-white/70 mb-2 tracking-wide">{userEmail}</p>
              
              {isEditing ? (
                <div className="flex flex-col items-center gap-4">
                  <input 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    className="text-3xl font-bold bg-white/10 backdrop-blur-md border-2 border-white/30 focus:border-white text-white outline-none text-center px-4 py-3 rounded-xl transition-all w-full max-w-sm mx-auto"
                    placeholder="Nama Anda"
                  />
                  
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    className="w-full max-w-lg mx-auto p-4 rounded-xl bg-white/10 backdrop-blur-md text-white outline-none border-2 border-white/30 focus:border-white transition-all resize-none"                   
                    rows="3"
                    placeholder="Ceritakan tentang diri Anda..."
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                    {userName}
                  </h2>
                  
                  <p className="mt-4 text-white/90 leading-relaxed max-w-xl mx-auto text-lg">
                    {bio}
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center profile-fade-in-3">
              <button 
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)} 
                className={`px-3 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isEditing 
                    ? "bg-white text-[#236fa6] shadow-xl hover:shadow-2xl" 
                    : "bg-white/15 backdrop-blur-md hover:bg-white/25 text-white border-2 border-white/30 hover:border-white/50"
                }`}
              >
                {isEditing ? <Save size={20} /> : <Edit size={20} />}
                {isEditing ? "Simpan Profil" : "Edit Profil"}
              </button>
              
              <button 
                onClick={handleLogout} 
                className="px-4 py-3 rounded-xl flex items-center gap-2 font-semibold bg-red-500/90 backdrop-blur-md hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-white/20"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 100" className="w-full h-auto text-gray-50" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,50 C240,80 480,20 720,50 C960,80 1200,20 1440,50 L1440,100 L0,100 Z"></path>
            </svg>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20 mb-10">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            
          <div className="bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 md:p-6 border border-white/50 profile-fade-in-4 hover:-translate-y-1">              
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4"></div>
                <div className="p-2 md:p-4 bg-gradient-to-br from-[#236fa6] to-[#324976] rounded-lg md:rounded-xl shadow-md">
                  <Heart size={20} className="text-white md:w-7 md:h-7" />
                 </div>
                                <div className="text-center md:text-left">
                                    <p className="text-gray-500 text-[10px] md:text-sm font-medium">Total Favorit</p>
                                    <p className="text-xl md:text-3xl font-bold text-[#324976]">{totalFavorites}</p>
                                </div>
                            </div>
                        </div>

           <div className="bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 md:p-6 border border-white/50 profile-fade-in-4 hover:-translate-y-1">              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4"></div>
                <div className="p-2 md:p-4 bg-gradient-to-br from-[#236fa6] to-[#324976] rounded-lg md:rounded-xl shadow-md">
                  <Star size={20} className="text-white md:w-7 md:h-7" />
              </div>
                                <div className="text-center md:text-left">
                                    <p className="text-gray-500 text-[10px] md:text-sm font-medium">UMKM Favorit</p>
                                    <p className="text-xl md:text-3xl font-bold text-[#324976]">{favoritesUMKM.length}</p>
                                </div>
                            </div>
                        </div>
          <div className="bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 md:p-6 border border-white/50 profile-fade-in-4 hover:-translate-y-1">              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4"></div>
                <div className="p-2 md:p-4 bg-gradient-to-br from-[#236fa6] to-[#324976] rounded-lg md:rounded-xl shadow-md">
                  <TrendingUp size={20} className="text-white md:w-7 md:h-7" />
              </div>
                                <div className="text-center md:text-left">
                                    <p className="text-gray-500 text-[10px] md:text-sm font-medium">Produk Favorit</p>
                                    <p className="text-xl md:text-3xl font-bold text-[#324976]">{favoritesProduct.length}</p>
                                </div>
                            </div>
                        </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl p-4 md:p-8 border border-gray-100 profile-fade-in-7">
            
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b-2 border-gray-100">
              <div className="p-2 md:p-3 bg-gradient-to-br from-white-400 to-white-400 rounded-xl shadow-lg">
                <Heart size={24} className="text-red-500 fill-red-500 md:w-10 md:h-10" />
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-3xl text-[#324976]">Favorit Saya</h3>
                <p className="text-gray-500 text-xs md:text-sm mt-1 hidden md:block">Koleksi UMKM & Produk pilihan Anda</p>
              </div>
            </div>

           <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('umkm')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'umkm' 
                    ? 'bg-gradient-to-r from-[#236fa6] to-[#324976] text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm md:text-base">UMKM</span>
              </button>

              <button 
                onClick={() => setActiveTab('product')}
                className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === 'product' 
                    ? 'bg-gradient-to-r from-[#236fa6] to-[#324976] text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm md:text-base">Produk</span>
              </button>
            </div>

            <div className="min-h-[200px]">
              {activeTab === 'umkm' && (
                <div className="tab-fade-in">
                  {favoritesUMKM.length === 0 ? (
                    <div className="text-center py-12 md:py-16 bg-gradient-to-br from-gray-50 to-[#e0f2fe]/30 rounded-2xl">
                      <Star size={48} className="mx-auto text-gray-300 mb-4 md:w-16 md:h-16" />
                      <p className="text-gray-500 font-semibold text-base md:text-lg">Belum ada UMKM favorit</p>
                      <p className="text-gray-400 text-sm md:text-base mt-2 px-4">Mulai eksplorasi dan tambahkan UMKM favorit Anda!</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {favoritesUMKM.map((item, index) => (
                        <FavoriteItem key={item.id} item={item} removeFavorite={removeFavorite} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'product' && (
                <div className="tab-fade-in">
                  {favoritesProduct.length === 0 ? (
                    <div className="text-center py-12 md:py-16 bg-gradient-to-br from-gray-50 to-[#e0f2fe]/30 rounded-2xl">
                      <TrendingUp size={48} className="mx-auto text-gray-300 mb-4 md:w-16 md:h-16" />
                      <p className="text-gray-500 font-semibold text-base md:text-lg">Belum ada produk favorit</p>
                      <p className="text-gray-400 text-sm md:text-base mt-2 px-4">Temukan produk lokal terbaik dan simpan di sini!</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:gap-4">
                      {favoritesProduct.map((item, index) => (
                        <FavoriteItem key={item.id} item={item} removeFavorite={removeFavorite} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
const FavoriteItem = ({ item, removeFavorite, index }) => {
    
    const pathPrefix = item.type === 'product' ? 'products' : 'umkm';
    
    return (
        <div 
            className="group bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white p-4 md:p-5 rounded-xl md:rounded-2xl shadow-md hover:shadow-xl border border-gray-200 hover:border-[#236fa6]/30 flex justify-between items-center transition-all duration-300 hover:-translate-y-1 favorite-item-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Link to={`/${pathPrefix}/${item.id}`} className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                
                <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#236fa6]/20 to-[#324976]/20 rounded-xl md:rounded-2xl blur-md group-hover:blur-lg transition-all"></div>
                    <img 
                        src={item.image_url || `https://placehold.co/80x80/e0f2fe/236fa6?text=${item.name.charAt(0)}`} 
                        className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-300" 
                        alt={item.name} 
                    />
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-[#236fa6] to-[#324976] rounded-full flex items-center justify-center shadow-lg">
                        <Heart size={12} className="text-white fill-white md:w-3.5 md:h-3.5" />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base md:text-lg text-[#324976] group-hover:text-[#236fa6] transition-colors truncate mb-1">
                        {item.name}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs bg-[#e0f2fe] text-[#236fa6] px-2 md:px-3 py-1 md:py-1.5 rounded-full font-semibold border border-[#236fa6]/20">
                            <Award size={10} className="md:w-3 md:h-3" />
                            {item.type === 'umkm' ? 'UMKM' : 'Produk'}
                        </span>
                    </div>
                </div>
            </Link>
            
            <button 
                onClick={(e) => { 
                    e.preventDefault(); 
                    removeFavorite(item.id, item.type); 
                }} 
                className="flex-shrink-0 p-2 md:p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg md:rounded-xl border-2 border-gray-200 hover:border-red-300 transition-all duration-300 hover:scale-110 hover:rotate-12 group/btn ml-2"
            >
                <Trash2 size={16} className="md:w-5 md:h-5 group-hover/btn:animate-pulse" />
            </button>
        </div>
    );
};

export default Profile;