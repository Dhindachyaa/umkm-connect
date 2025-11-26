import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Save, Loader2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'productFormDraft';

export default function ProductForm() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const isEditMode = !!id; 

    const initialFormData = {
        name: '',
        price: '',
        category: '',
        description: '',
        image_url: '',
    };

    const [formData, setFormData] = useState(() => {
        if (!isEditMode) {
            const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedDraft) {
                try {
                    const parsedData = JSON.parse(savedDraft);
                    return { ...initialFormData, ...parsedData }; 
                } catch (e) {
                    console.error("Gagal memparsing draft formulir:", e);
                    return initialFormData;
                }
            }
        }
        return initialFormData;
    });

    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const categories = ['Makanan', 'Minuman', 'Kerajinan', 'Fashion', 'Jasa', 'Lain-lain'];

    useEffect(() => {
        if (!isEditMode) return;

        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                setError('Gagal memuat data produk untuk diedit.');
            } else if (data) {
                setFormData({
                    name: data.name || '',
                    price: data.price || '',
                    category: data.category || '',
                    description: data.description || '',
                    image_url: data.image_url || '',
                });
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id, isEditMode]);

    useEffect(() => {
        if (!isEditMode) {
            const { image_url, ...draftData } = formData;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
        }
    }, [formData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const uploadImage = async (file) => {
        if (!file) return formData.image_url;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('umkm-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage
            .from('umkm-images')
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const finalImageUrl = await uploadImage(imageFile);

            const dataToSubmit = {
                ...formData,
                price: parseFloat(formData.price),
                image_url: finalImageUrl,
            };

            let supabaseQuery;
            let successMessage;

            if (isEditMode) {
                supabaseQuery = supabase.from('products').update(dataToSubmit).eq('id', id);
                successMessage = "Produk berhasil diperbarui!";
            } else {
                supabaseQuery = supabase.from('products').insert([dataToSubmit]);
                successMessage = "Produk berhasil ditambahkan!";
            }

            const { error: dbError } = await supabaseQuery;
            if (dbError) throw new Error(`Gagal menyimpan data: ${dbError.message}`);

            if (!isEditMode) {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }

            alert(successMessage);
            navigate('/products');
        } catch (err) {
            console.error('Submit Error:', err.message);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center text-[#324976]">Memuat data produk...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-[#d3e7f7] flex items-center">
                <button onClick={() => navigate(-1)} className="text-[#236fa6] hover:text-[#1f5f8f]">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-[#324976] ml-4">
                    {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#bcdcf5] space-y-3">
                    <h2 className="text-lg font-semibold text-[#324976]">Foto Produk</h2>
                    <label className="block w-full cursor-pointer bg-[#e0f2fe] hover:bg-[#c3e0f7] border border-dashed border-[#236fa6] rounded-lg p-6 text-center transition-colors">
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        {imageFile ? (
                            <p className="text-sm font-medium text-[#236fa6]">{imageFile.name}</p>
                        ) : formData.image_url ? (
                            <div>
                                <p className="text-sm font-medium text-[#236fa6]">Gambar Lama Tersedia (Klik untuk Ganti)</p>
                                <img src={formData.image_url} alt="Current Product" className="w-20 h-20 object-cover mx-auto mt-2 rounded-lg border border-gray-300"/>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <UploadCloud size={32} className="text-[#236fa6] mb-2" />
                                <p className="text-sm font-medium text-[#236fa6]">Upload Gambar Produk</p>
                            </div>
                        )}
                    </label>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-[#bcdcf5] space-y-4">
                    <h2 className="text-lg font-semibold text-[#324976]">Detail Produk</h2>
                    <InputGroup label="Nama Produk" name="name" value={formData.name} onChange={handleChange} required />
                    <InputGroup label="Harga (Rp)" name="price" type="number" value={formData.price} onChange={handleChange} required min="0" />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select name="category" value={formData.category} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#236fa6] focus:border-transparent transition">
                            <option value="">Pilih Kategori</option>
                            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#236fa6] focus:border-transparent transition"></textarea>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                <button type="submit" disabled={isSubmitting || loading}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-white font-semibold transition-colors ${
                        isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#236fa6] hover:bg-[#1f5f8f] shadow-lg shadow-[#236fa6]/50'
                    }`}>
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            <span>{isEditMode ? 'Simpan Perubahan' : 'Tambahkan Produk'}</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

const InputGroup = ({ label, name, type = 'text', value, onChange, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-[#236fa6] focus:border-transparent transition"
            {...props} />
    </div>
);