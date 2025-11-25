import { useState, useEffect } from 'react';
import { Trash2, UserCircle, Edit, Save, Camera, Heart, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

const DEFAULT_PROFILE_DATA = {
  name: "Pengunjung Tamu",
  bio: "Selamat datang! Saya senang menjelajahi produk-produk lokal dan UMKM Semarang.",
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

  if (!session) return <p className="p-4 text-center">Silakan Login untuk melihat Profil.</p>;

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-br from-[#236fa6] to-[#1a5a85] pt-12 pb-24 px-6 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">

          <div className="relative mt-6">
            <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl"></div>
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="relative w-32 h-32 rounded-full object-cover border-[5px] border-white shadow-2xl" />
            ) : (
              <div className="relative w-32 h-32 rounded-full border-[5px] border-white bg-white/20 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                <UserCircle size={80} className="text-white" />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-3 bg-white text-[#236fa6] rounded-full shadow-xl cursor-pointer hover:bg-[#e0f2fe] transition-all duration-200">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="text-center mt-4 w-full">
            <p className="text-sm font-medium text-white/70 mb-1">{userEmail}</p>
            {isEditing ? (
              <input value={userName} onChange={(e) => setUserName(e.target.value)} className="text-2xl font-bold bg-white/15 backdrop-blur-md border-b-2 border-white/70 focus:border-white text-white outline-none text-center px-3 py-2 rounded-lg transition-all" />
            ) : (
              <h2 className="text-3xl font-bold tracking-tight">{userName}</h2>
            )}
            {isEditing ? (
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-4 w-full p-3 rounded-xl bg-white/15 backdrop-blur-md text-white outline-none border border-white/30 focus:border-white/70 transition-all resize-none" rows="3" />
            ) : (
              <p className="mt-3 text-white/90 leading-relaxed">{bio}</p>
            )}
          </div>

          <button onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)} className={`mt-2 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all duration-200 ${isEditing ? "bg-white text-[#236fa6] shadow-lg" : "bg-white/20 hover:bg-white/30 text-white border border-white/30"}`}>
            {isEditing ? <Save size={18} /> : <Edit size={18} />}
            {isEditing ? "Simpan" : "Edit Profil"}
          </button>
          
          <button onClick={handleLogout} className="mt-4 px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200">
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </div>

      <div className="w-full px-4 mt-12">
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-gray-100">
            <div className="p-2 bg-red-50 rounded-xl">
              <Heart size={24} className="text-red-500 fill-red-500" />
            </div>
            <h3 className="font-bold text-2xl text-[#324976]">Favorit Saya</h3>
          </div>

          <h4 className="font-semibold text-lg text-[#236fa6] mb-3">UMKM</h4>
          {favoritesUMKM.length === 0 ? (
            <p className="text-gray-400 mb-6">Belum ada UMKM favorit.</p>
          ) : (
            <div className="space-y-3 mb-8">
              {favoritesUMKM.map((item) => (
                <FavoriteItem key={item.id} item={item} removeFavorite={removeFavorite} />
              ))}
            </div>
          )}

          <h4 className="font-semibold text-lg text-[#236fa6] mb-3 mt-6">Produk</h4>
          {favoritesProduct.length === 0 ? (
            <p className="text-gray-400">Belum ada produk favorit.</p>
          ) : (
            <div className="space-y-3">
              {favoritesProduct.map((item) => (
                <FavoriteItem key={item.id} item={item} removeFavorite={removeFavorite} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FavoriteItem = ({ item, removeFavorite }) => (
  <div className="group bg-white hover:bg-gray-50 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex justify-between items-center transition-all duration-200">
    <Link to={`/${item.type}/${item.id}`} className="flex items-center gap-4 flex-1">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-[#236fa6]/10 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
        <img src={`https://placehold.co/60x60/e0f2fe/236fa6?text=${item.name.charAt(0)}`} className="relative w-16 h-16 rounded-xl object-cover shadow" alt={item.name} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg text-[#324976] group-hover:text-[#236fa6] transition-colors truncate">{item.name}</h4>
        <span className="inline-block text-xs bg-[#e0f2fe] text-[#236fa6] px-3 py-1 rounded-full font-medium mt-1.5">{item.type}</span>
      </div>
    </Link>
    <button onClick={() => removeFavorite(item.id)} className="flex-shrink-0 p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200">
      <Trash2 size={20} />
    </button>
  </div>
);

export default Profile;
