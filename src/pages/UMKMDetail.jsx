import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { ArrowLeft, Heart, MapPin, Phone, ExternalLink, Edit, Trash2, Loader2, Share2, Star, Clock } from 'lucide-react';

const UMKMDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [umkm, setUmkm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const categories = ['Makanan', 'Minuman', 'Kerajinan', 'Fashion', 'Jasa', 'Lain-lain'];

    useEffect(() => {
        const getDetail = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('umkm').select('*').eq('id', id).single();
                if (error) throw new Error(error.message);
                if (data) {
                    setUmkm(data);
                    const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
                    setIsFavorite(saved.some(item => item.id === data.id));
                }
            } catch (error) {
                console.error('Error fetching UMKM detail:', error.message);
            } finally {
                setLoading(false);
            }
        };
        getDetail();
    }, [id]);

    const handleFavorite = () => {
        if (!umkm) return;
        const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (!isFavorite) {
            const newItem = { id: umkm.id, name: umkm.name, category: umkm.category, image_url: umkm.image_url, type: 'umkm' };
            localStorage.setItem('favorites', JSON.stringify([...saved, newItem]));
            setIsFavorite(true);
        } else {
            localStorage.setItem('favorites', JSON.stringify(saved.filter(item => item.id !== umkm.id)));
            setIsFavorite(false);
        }
    };

    const handleDelete = async () => {
        if (!umkm || isDeleting) return;
        if (!window.confirm(`Yakin ingin menghapus UMKM "${umkm.name}"?`)) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase.from('umkm').delete().eq('id', id);
            if (error) throw new Error(error.message);
            alert("UMKM berhasil dihapus!");
            navigate('/umkm', { replace: true });
        } catch (error) {
            console.error('Delete Error:', error.message);
            alert(`Gagal menghapus: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => navigate(`/umkm/edit/${id}`);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#e0f2fe] to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#e0f2fe] border-t-[#236fa6] animate-spin mx-auto mb-4"></div>
                    <p className="text-[#324976] font-semibold">Memuat Detail...</p>
                </div>
            </div>
        );
    }

    if (!umkm) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#e0f2fe] to-white flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md w-full">
                    <p className="text-red-500 font-semibold mb-4">UMKM tidak ditemukan.</p>
                    <button
                        onClick={() => navigate('/umkm')}
                        className="w-full bg-[#236fa6] text-white py-3 rounded-xl font-bold hover:bg-[#324976] transition-all duration-300"
                    >
                        Kembali ke Daftar
                    </button>
                </div>
            </div>
        );
    }

    const mapEmbedUrl = umkm.latitude && umkm.longitude
        ? `https://maps.google.com/maps?q=${umkm.latitude},${umkm.longitude}&hl=es;z=16&output=embed`
        : null;

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen pb-1">
            <div className="relative h-64 md:h-80 w-full bg-gradient-to-br from-[#e0f2fe] to-[#d0e8f7] overflow-hidden group">
                <img 
                    src={umkm.image_url || 'https://placehold.co/600x400?text=UMKM+Logo'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt={`Logo ${umkm.name}`}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 group/btn"
                >
                    <ArrowLeft size={20} className="text-[#324976] group-hover/btn:translate-x-[-2px] transition-transform" />
                </button>

                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button 
                        onClick={handleEdit} 
                        className="bg-[#236fa6] text-white p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group/edit"
                        title="Edit UMKM"
                    >
                        <Edit size={20} className="group-hover/edit:rotate-12 transition-transform" />
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50 group/delete"
                        title="Hapus UMKM"
                    >
                        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} className="group-hover/delete:rotate-12 transition-transform" />}
                    </button>
                </div>


            </div>

            <div className="px-4 md:px-6 -mt-8 relative z-20 animate-fade-in">
                <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 space-y-6">
                    
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="inline-block mb-3">
                                    <span className="bg-gradient-to-r from-[#e0f2fe] to-[#bae6fd] text-[#236fa6] text-xs px-3 py-1.5 rounded-full font-bold border border-[#236fa6]/20">
                                        {umkm.category || 'UMKM'}
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-[#324976] leading-tight">
                                    {umkm.name}
                                </h1>
                            </div>
                            <button 
                                onClick={handleFavorite}
                                className="bg-white border-2 border-[#e0f2fe] p-2 rounded-full shadow-md hover:shadow-lg hover:scale-110 hover:border-red-300 transition-all duration-300 z-10 group/fav flex-shrink-0"
                            >
                                <Heart 
                                    size={18}
                                    fill={isFavorite ? 'currentColor' : 'none'} 
                                    className={`transition-all duration-300 ${isFavorite ? 'text-red-500 group-hover/fav:scale-125' : 'text-gray-400 group-hover/fav:text-red-500'}`}
                                />
                            </button>
                        </div>

                        <div className="flex items-start gap-3 text-gray-600 text-sm bg-[#e0f2fe]/30 p-4 rounded-xl border border-[#e0f2fe]">
                            <MapPin size={18} className="text-[#236fa6] flex-shrink-0 mt-0.5" /> 
                            <p className='leading-relaxed font-medium'>{umkm.address}</p>
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-gray-200 pt-6">
                        <h3 className="font-bold text-lg text-[#324976] flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-[#236fa6] to-[#324976] rounded"></div>
                            Tentang {umkm.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                            {umkm.description}
                        </p>
                    </div>

                    {mapEmbedUrl && (
                        <div className="space-y-3 border-t border-gray-200 pt-6">
                            <h3 className="font-bold text-lg text-[#324976] flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-[#236fa6] to-[#324976] rounded"></div>
                                Lokasi di Peta
                            </h3>
                            <div className="rounded-2xl overflow-hidden shadow-md border-2 border-[#e0f2fe] hover:shadow-lg transition-shadow duration-300">
                                <iframe
                                    src={mapEmbedUrl}
                                    width="100%"
                                    height="300"
                                    className="rounded-xl"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Lokasi UMKM"
                                ></iframe>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default UMKMDetail;