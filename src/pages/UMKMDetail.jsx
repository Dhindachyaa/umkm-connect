// src/pages/UMKMDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { ArrowLeft, Heart, MapPin, Phone, ExternalLink, Edit, Trash2, Loader2 } from 'lucide-react';

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
            const { data, error } = await supabase.from('umkm').select('*').eq('id', id).single();
            if (error) console.error('Error fetching UMKM detail:', error.message);
            if (data) {
                setUmkm(data);
                const saved = JSON.parse(localStorage.getItem('favorites') || '[]');
                setIsFavorite(saved.some(item => item.id === data.id));
            }
            setLoading(false);
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

    if (loading) return <div className="p-10 text-center text-gray-600">Memuat Detail...</div>;
    if (!umkm) return <div className="p-10 text-center text-red-500">UMKM tidak ditemukan.</div>;

    const mapEmbedUrl = umkm.latitude && umkm.longitude
        ? `https://maps.google.com/maps?q=${umkm.latitude},${umkm.longitude}&hl=es;z=16&output=embed`
        : null;

    return (
        <div className="bg-white min-h-screen relative">
            <div className="h-64 w-full bg-gray-200 relative">
                <img 
                    src={umkm.image_url || 'https://placehold.co/600x400?text=UMKM+Logo'} 
                    className="w-full h-full object-cover" 
                    alt={`Logo ${umkm.name}`}
                />
                <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors">
                    <ArrowLeft size={20} />
                </button>

                <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={handleEdit} className="bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition">
                        <Edit size={20} />
                    </button>
                    <button onClick={handleDelete} className="bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="-mt-6 relative bg-white rounded-t-3xl p-6 shadow-2xl pb-20">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md font-semibold">{umkm.category || 'UMKM'}</span>
                        <h1 className="text-2xl font-bold mt-2">{umkm.name}</h1>
                    </div>
                    <button onClick={handleFavorite} className={`bg-pink-50 p-2 rounded-full transition ${isFavorite ? 'text-pink-500' : 'text-gray-400'}`}>
                        <Heart fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <div className="flex items-start text-gray-500 text-sm mb-6">
                    <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" /> 
                    <p className='leading-snug'>{umkm.address}</p>
                </div>

                <div className="mb-6 border-t pt-4">
                    <h3 className="font-bold text-lg mb-2">Tentang {umkm.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{umkm.description}</p>
                </div>

                {mapEmbedUrl && (
                    <div className="mb-6">
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="250"
                            className="rounded-xl border border-gray-300"
                            allowFullScreen
                            loading="lazy"
                            title="Lokasi UMKM"
                        ></iframe>
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    {umkm.phone && (
                        <a href={`https://wa.me/${umkm.phone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition">
                            <Phone size={18} className="mr-2"/> Hubungi via WhatsApp
                        </a>
                    )}
                    {umkm.map_url && (
                        <a href={umkm.map_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition">
                            <ExternalLink size={18} className="mr-2"/> Buka di Google Maps
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UMKMDetail;
