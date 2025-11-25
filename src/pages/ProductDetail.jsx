import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { ArrowLeft, Edit, Trash, Loader2, Heart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  const fetchProductDetail = async () => {
    setLoading(true);
    setError(null);

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      console.error("Error fetching product detail:", productError);
      setError("Gagal memuat detail produk.");
      setLoading(false);
      return;
    }

    let umkmData = null;
    if (productData.umkm_id) {
      const { data, error } = await supabase
        .from('umkms')
        .select('id, name, phone, address')
        .eq('id', productData.umkm_id)
        .single();
      if (!error && data) umkmData = data;
    }

    setProduct({ ...productData, umkm: umkmData });
    setLoading(false);

    const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
    setReviews(savedReviews);

    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(savedFavorites.some(item => item.id === id && item.type === 'product'));
  };

  useEffect(() => { fetchProductDetail(); }, [id]);

  const toggleFavorite = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const updated = savedFavorites.filter(item => !(item.id === id && item.type === 'product'));
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
    } else {
      savedFavorites.push({ id, type: 'product', name: product.name });
      localStorage.setItem('favorites', JSON.stringify(savedFavorites));
      setIsFavorite(true);
    }
  };

  const handleAddReview = () => {
    if (!newReviewText.trim()) return;

    const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const review = {
      id: Date.now(),
      name: userProfile.name || 'Pengunjung Tamu',
      photo: userProfile.photo || null,
      text: newReviewText,
      rating: newRating,
      date: new Date().toISOString()
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
    setNewReviewText('');
    setNewRating(5);
  };

  const handleDelete = async () => {
    if (!product || isDeleting) return;
    if (!window.confirm(`Yakin ingin menghapus produk "${product.name}"?`)) return;

    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      setError(`Gagal menghapus produk: ${deleteError.message}`);
      setIsDeleting(false);
    } else {
      alert("Produk berhasil dihapus!");
      navigate('/products');
    }
  };

  const handleEdit = () => navigate(`/products/edit/${id}`);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 4.8;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-[#236fa6]">
      <Loader2 size={32} className="animate-spin mr-2" /> Memuat detail produk...
    </div>
  );

  if (error) return (
    <div className="min-h-screen p-6 text-center text-red-600 bg-red-50">
      <p className="font-semibold">{error}</p>
      <button onClick={() => navigate('/products')} className="mt-4 text-[#236fa6] hover:underline">
        Kembali ke Daftar Produk
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen relative pb-24">
      <div className="max-w-7xl mx-auto md:p-8 flex flex-col md:flex-row md:gap-10">

        <div className="relative h-80 md:h-[500px] w-full md:w-1/2 bg-gray-100 md:rounded-2xl overflow-hidden shadow-sm group">
          <img src={product.image_url || 'https://placehold.co/600'} 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
               alt={product.name} />
          <div className="md:hidden absolute top-0 left-0 w-full p-4 flex justify-start bg-gradient-to-b from-black/30 to-transparent pt-6">
            <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 active:scale-95 transition-all">
              <ArrowLeft size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 -mt-8 md:mt-0 relative bg-white rounded-t-[30px] md:rounded-none px-6 py-8 md:p-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:shadow-none z-10">
          <div className="md:hidden w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

          <div className="mb-6 border-b pb-4 border-gray-100">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight mb-2">{product.name}</h1>
              <button onClick={toggleFavorite} className="p-2">
                <Heart size={24} className={`transition-all ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <p className="text-2xl font-bold text-[#236fa6]">Rp {(product.price || 0).toLocaleString('id-ID')}</p>
              <div className="flex items-center gap-3 mt-2 md:mt-0">
                <span className="bg-[#e0f2fe] text-[#236fa6] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide">{product.category || 'Kategori'}</span>
                <div className="flex items-center text-sm font-bold text-yellow-500 gap-1">⭐ {averageRating}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <button onClick={handleEdit} className="flex items-center px-3 py-1.5 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors text-sm">
                <Edit size={16} className="mr-1" /> Edit
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm disabled:bg-red-300">
                {isDeleting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Trash size={16} className="mr-1" />}
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Deskripsi Produk</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {product.description || 'Tidak ada deskripsi lengkap untuk produk ini.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Ulasan ({reviews.length})</h3>
            <div className="mb-4 flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r.id} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  {r.photo ? (
                    <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">{r.name[0]}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold">{r.name} <span className="text-yellow-500">⭐ {r.rating}</span></div>
                    <p className="text-gray-600 text-sm">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none"
                placeholder="Tulis ulasan Anda..."
                rows={3}
                value={newReviewText}
                onChange={e => setNewReviewText(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <select
                  value={newRating}
                  onChange={e => setNewRating(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg p-1 text-sm"
                >
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
                <button onClick={handleAddReview} className="bg-[#236fa6] text-white px-4 py-2 rounded-lg hover:bg-[#1e5a87] transition-colors text-sm">
                  Tambah Review
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
