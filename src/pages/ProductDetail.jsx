import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { ArrowLeft, Edit, Trash, Loader2, Heart, Star, Package, MessageCircle, Phone, MapPin, Trash2 } from 'lucide-react';

const getUserProfile = () => {
    try {
        const profile = localStorage.getItem('user_profile');
        return profile ? JSON.parse(profile) : {};
    } catch (e) {
        console.error("Error parsing user profile from localStorage:", e);
        return {};
    }
};

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
    const fetchProductDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        setProduct(null); 

        try {
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (productError || !productData) {
                console.error("Error fetching product detail:", productError || "Product not found");
                setError("Gagal memuat detail produk. Produk mungkin sudah dihapus.");
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

        } catch (e) {
            console.error("General error during product fetch:", e);
            setError("Terjadi kesalahan tak terduga saat memuat data.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetail();
    }, [fetchProductDetail]);

    useEffect(() => {
        const savedReviews = JSON.parse(localStorage.getItem(`reviews_${id}`) || '[]');
        setReviews(savedReviews);

        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(savedFavorites.some(item => item.id === id && item.type === 'product'));
    }, [id, product]); 

    const toggleFavorite = () => {
        if (!product) return;
        const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        if (isFavorite) {
            const updated = savedFavorites.filter(item => !(item.id === id && item.type === 'product'));
            localStorage.setItem('favorites', JSON.stringify(updated));
            setIsFavorite(false);
        } else {
            const itemToAdd = { 
                id, 
                type: 'product', 
                name: product.name, 
                image_url: product.image_url 
            };
            savedFavorites.push(itemToAdd);
            localStorage.setItem('favorites', JSON.stringify(savedFavorites));
            setIsFavorite(true);
        }
    };

    const handleAddReview = () => {
        if (!newReviewText.trim()) return;

        const userProfile = getUserProfile();
        const review = {
            id: Date.now(),
            name: userProfile.name || 'Pengunjung Tamu',
            photo: userProfile.photo || null,
            text: newReviewText.trim(),
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
        if (!window.confirm(`Yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;

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

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0; 
        
        const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = totalRating / reviews.length;
        return Number.isNaN(avg) ? 0 : avg.toFixed(1);
    }, [reviews]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-[#e0f2fe]/30">
            <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-[#236fa6]" />
                <p className="text-[#236fa6] font-semibold">Memuat detail produk...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
            <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-red-500" />
                    </div>
                <p className="font-bold text-red-600 text-lg mb-4">{error}</p>
                <button 
                    onClick={() => navigate('/products')} 
                    className="bg-[#236fa6] text-white px-6 py-2.5 rounded-xl hover:bg-[#1e5a87] transition-all duration-300 font-semibold hover:shadow-lg"
                >
                    Kembali ke Daftar Produk
                </button>
            </div>
        </div>
    );
    
    if (!product) return null; 
    const umkm = product.umkm; 

    return (
        <>
            <style>{`
                @keyframes detailFadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes detailSlideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes detailSlideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes detailScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes detailHeartBeat { 0%, 100% { transform: scale(1); } 25% { transform: scale(1.2); } 50% { transform: scale(1); } }
                @keyframes detailShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

                .detail-image-animate { animation: detailSlideInLeft 0.6s ease-out; }
                .detail-content-animate { animation: detailFadeInUp 0.6s ease-out; }
                .detail-section-animate { animation: detailFadeInUp 0.6s ease-out both; }
                .detail-review-item { animation: detailScaleIn 0.4s ease-out both; }
                .detail-heart-animate { animation: detailHeartBeat 0.5s ease-out; }
                .detail-shimmer { 
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
                    background-size: 200% 100%;
                    animation: detailShimmer 2s infinite;
                }
            `}</style>

            <div className="bg-gradient-to-br from-gray-50 via-white to-[#e0f2fe]/20 min-h-screen relative pb-1">
                <div className="max-w-7xl mx-auto md:p-8 flex flex-col md:flex-row md:gap-10">

                    <div className="detail-image-animate relative h-80 md:h-[500px] w-full md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 md:rounded-3xl overflow-hidden shadow-2xl group">
                        <img 
                            src={product.image_url || 'https://placehold.co/600'} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            alt={product.name} 
                            loading="lazy"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 left-0 w-full p-4 flex justify-between bg-gradient-to-b from-black/40 to-transparent pt-6 md:pt-8">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="bg-white/90 backdrop-blur-md p-3 rounded-full text-[#324976] hover:bg-white active:scale-95 transition-all shadow-lg hover:shadow-xl"
                                aria-label="Kembali ke halaman sebelumnya"
                            >
                                <ArrowLeft size={22} />
                            </button>
                        
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleEdit} 
                                    className="bg-[#236fa6] text-white p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group/edit"
                                    aria-label={`Edit produk ${product.name}`}
                                >
                                    <Edit size={22} />
                                </button>

                                <button 
                                    onClick={handleDelete} 
                                    disabled={isDeleting}
                                    className="bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 group/delete"
                                    aria-label={`Hapus produk ${product.name}`}
                                >
                                    {isDeleting ? (
                                        <Loader2 size={22} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={22} />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-4 left-4 w-32 h-32 bg-[#236fa6]/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="detail-content-animate flex-1 -mt-8 md:mt-0 relative bg-white rounded-t-[30px] md:rounded-3xl px-6 py-8 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] md:shadow-2xl z-10 border border-gray-100">
                        <div className="md:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
                        <div className="detail-section-animate mb-3 pb-3 border-b-2 border-gray-100" style={{ animationDelay: '0.2s' }}>
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h1 className="text-2xl md:text-4xl font-text-3xl md:text-4xl font-bold text-[#324976] leading-tight text-[#324976] leading-tight">
                                    {product.name}
                                </h1>
                                <button 
                                    onClick={toggleFavorite} 
                                    className="bg-white border-2 border-[#e0f2fe] p-2 rounded-full shadow-md hover:shadow-lg hover:scale-110 hover:border-red-300 transition-all duration-300 z-10 group/fav flex-shrink-0"
                                    aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                                >
                                    <Heart 
                                        size={24} 
                                        className={`transition-all duration-300 ${
                                            isFavorite 
                                                ? 'text-red-500 fill-red-500 detail-heart-animate' 
                                                : 'text-[#236fa6] group-hover:text-red-400'
                                        }`} 
                                    />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                <div>
                                    <p className="font-bold text-[#324976] text-x10">Harga</p>
                                    <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                        Rp {(product.price || 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e0f2fe] to-[#bfdbfe] text-[#236fa6] text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wide shadow-md">
                                        <Package size={14} />
                                        {product.category || 'Kategori'}
                                    </span>
                                    <div className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-2 rounded-full font-bold text-sm transition-shadow">                                        <Star size={14} className="fill-white" />
                                        {averageRating}
                                    </div>
                                </div>
                            </div>

                            {umkm && (
                                <div className="mt-4 p-4 bg-[#f0f9ff] rounded-xl border border-[#bfdbfe] shadow-inner text-sm detail-section-animate" style={{ animationDelay: '0.3s' }}>
                                    <h4 className="font-bold text-[#324976] mb-2">Informasi Penjual (UMKM)</h4>
                                    <p className="font-semibold text-[#236fa6] mb-1">{umkm.name}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                                        {umkm.phone && (
                                            <a 
                                                href={`tel:${umkm.phone}`} 
                                                className="flex items-center gap-1 hover:text-[#236fa6] transition-colors"
                                            >
                                                <Phone size={14} /> {umkm.phone}
                                            </a>
                                        )}
                                        {umkm.address && (
                                            <p className="flex items-center gap-1">
                                                <MapPin size={14} /> {umkm.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="detail-section-animate mb-8" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-[#236fa6] to-[#324976] rounded-full"></div>
                                <h3 className="font-bold text-[#324976] text-xl">Deskripsi Produk</h3>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-[#e0f2fe]/20 p-6 rounded-2xl border border-gray-100">
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {product.description || 'Tidak ada deskripsi lengkap untuk produk ini.'}
                                </p>
                            </div>
                        </div>

                        <div className="detail-section-animate" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-[#236fa6] to-[#324976] rounded-full"></div>
                                <h3 className="font-bold text-[#324976] text-xl flex items-center gap-2">
                                    <MessageCircle size={24} className="text-[#236fa6]" />
                                    Ulasan
                                    <span className="px-3 py-1 bg-[#e0f2fe] text-[#236fa6] rounded-full text-sm">
                                        {reviews.length}
                                    </span>
                                </h3>
                            </div>

                            <div className="mb-6 flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2"> {/* Menambahkan scroll untuk daftar ulasan */}
                                {reviews.length === 0 ? (
                                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-[#e0f2fe]/20 rounded-2xl border border-gray-100">
                                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-400 font-medium">Belum ada ulasan</p>
                                        <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama memberi ulasan!</p>
                                    </div>
                                ) : (
                                    reviews.map((r, idx) => (
                                        <div 
                                            key={r.id} 
                                            className="detail-review-item flex gap-4 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            {r.photo ? (
                                                <img 
                                                    src={r.photo} 
                                                    alt={r.name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-[#e0f2fe] shadow-md flex-shrink-0" 
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#236fa6] to-[#324976] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                                    {r.name[0]?.toUpperCase() || 'P'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-[#324976]">{r.name}</span>
                                                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                                        <Star size={12} className="fill-white" />
                                                        {r.rating}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-sm leading-relaxed">{r.text}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {new Date(r.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="bg-gradient-to-br from-[#e0f2fe]/30 to-white p-6 rounded-2xl border-2 border-[#e0f2fe] shadow-lg">
                                <h4 className="font-bold text-[#324976] mb-4 flex items-center gap-2">
                                    <Edit size={18} />
                                    Tulis Ulasan Anda
                                </h4>
                                <textarea
                                    className="w-full border-2 border-gray-200 focus:border-[#236fa6] rounded-xl p-4 text-sm resize-none transition-all duration-300 focus:shadow-md outline-none"
                                    placeholder="Bagikan pengalaman Anda tentang produk ini..."
                                    rows={4}
                                    value={newReviewText}
                                    onChange={e => setNewReviewText(e.target.value)}
                                    aria-label="Teks ulasan baru"
                                />
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 gap-3">
                                    <select
                                        value={newRating}
                                        onChange={e => setNewRating(Number(e.target.value))}
                                        className="w-full sm:w-auto border-2 border-gray-200 focus:border-[#236fa6] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#324976] outline-none transition-all duration-300 cursor-pointer hover:border-[#236fa6]/50 flex-shrink-0"
                                        aria-label="Pilih rating bintang"
                                    >
                                        {[5,4,3,2,1].map(n => (
                                            <option key={n} value={n}>{'⭐'.repeat(n)} ({n} Bintang)</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleAddReview} 
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#236fa6] to-[#324976] text-white px-6 py-2.5 rounded-xl hover:shadow-xl transition-all duration-300 text-sm font-semibold hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                                        disabled={!newReviewText.trim()}
                                    >
                                        <MessageCircle size={16} />
                                        Tambah Ulasan
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;