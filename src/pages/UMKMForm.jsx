import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, UploadCloud } from 'lucide-react';

export default function UMKMForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    map_url: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Makanan', 'Minuman', 'Kerajinan', 'Fashion', 'Jasa', 'Lain-lain'];
  // Restore draft
  useEffect(() => {
    if (!isEditMode) {
      const saved = localStorage.getItem('unsavedUMKMForm');
      if (saved) {
        const data = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...data }));

        if (data.imageFileName) {
          setImageFile({ name: data.imageFileName });
        }
      }
    }
  }, [isEditMode]);

  // Auto save draft
  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(
        'unsavedUMKMForm',
        JSON.stringify({
          ...formData,
          imageFileName: imageFile ? imageFile.name : null,
        })
      );
    }
  }, [formData, imageFile, isEditMode]);

  // Fetch data kalau edit
  useEffect(() => {
    if (!isEditMode) return;

    const fetchUMKM = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('umkm').select('*').eq('id', id).single();

      if (error) {
        setError('Gagal memuat data UMKM untuk diedit.');
      } else if (data) {
        setFormData({
          name: data.name || '',
          category: data.category || '',
          description: data.description || '',
          address: data.address || '',
          map_url: data.map_url || '',
          image_url: data.image_url || '',
        });
      }
      setLoading(false);
    };

    fetchUMKM();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const filePath = `umkm-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('umkm-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw new Error(`Gagal upload gambar: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage
      .from('umkm-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

const extractCoordsFromGoogleMapsUrl = (url) => {
    try {
      if (!url) return { latitude: null, longitude: null };

      const atRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const atMatch = url.match(atRegex);
      if (atMatch) return { latitude: parseFloat(atMatch[1]), longitude: parseFloat(atMatch[2]) };

      const placeRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
      const placeMatch = url.match(placeRegex);
      if (placeMatch) return { latitude: parseFloat(placeMatch[1]), longitude: parseFloat(placeMatch[2]) };

      const qRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const qMatch = url.match(qRegex);
      if (qMatch) return { latitude: parseFloat(qMatch[1]), longitude: parseFloat(qMatch[2]) };

      return { latitude: null, longitude: null };
    } catch (err) {
      return { latitude: null, longitude: null };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const finalImageUrl = await uploadImage(imageFile);
      const { latitude, longitude } = extractCoordsFromGoogleMapsUrl(formData.map_url);

      // Pastikan ada koordinat sebelum simpan (Opsional, hapus jika boleh null)
      if (!latitude || !longitude) {
         throw new Error("Link Google Maps tidak valid atau koordinat tidak ditemukan.");
      }

      // ✅ DATA FINAL YANG DIKIRIM KE SUPABASE
      // Perhatikan: map_url TIDAK dimasukkan ke sini
      const dataToSubmit = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        latitude: latitude,   // Hanya kirim hasil convert
        longitude: longitude, // Hanya kirim hasil convert
        image_url: finalImageUrl,
      };

      let query;
      let successMessage;

      if (isEditMode) {
        query = supabase.from('umkm').update(dataToSubmit).eq('id', id);
        successMessage = 'UMKM berhasil diperbarui!';
      } else {
        query = supabase.from('umkm').insert([dataToSubmit]);
        successMessage = 'UMKM berhasil ditambahkan!';
      }

      const { error: dbError } = await query;
      if (dbError) throw new Error(dbError.message);

      if (!isEditMode) {
        localStorage.removeItem('unsavedUMKMForm');
      }

      alert(successMessage);
      navigate('/umkm');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-[#324976]">
        Memuat data UMKM...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-[#d3e7f7] flex items-center">
        <button onClick={() => navigate(-1)} className="text-[#236fa6] hover:text-[#1f5f8f]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#324976] ml-4">
          {isEditMode ? 'Edit UMKM' : 'Tambah UMKM Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Informasi Dasar</h2>

          <InputGroup label="Nama UMKM" name="name" value={formData.name} onChange={handleChange} required />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Utama</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <InputGroup label="Alamat Lengkap" name="address" value={formData.address} onChange={handleChange} required />

          <InputGroup
            label="Link Google Maps (URL)"
            name="map_url"
            value={formData.map_url}
            onChange={handleChange}
            type="url"
            placeholder="Contoh: https://maps.app.goo.gl/..."
          />
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Foto/Logo UMKM</h2>

          <label className="block w-full cursor-pointer bg-gray-100 hover:bg-gray-200 border border-dashed border-gray-400 rounded-lg p-6 text-center transition-colors">
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

            {imageFile ? (
              <p className="text-sm font-medium text-blue-600">{imageFile.name}</p>
            ) : formData.image_url ? (
              <div>
                <p className="text-sm font-medium text-blue-600">Gambar Lama Tersedia (Klik untuk Ganti)</p>
                <img
                  src={formData.image_url}
                  alt="Current Logo"
                  className="w-20 h-20 object-cover mx-auto mt-2 rounded-lg border border-gray-300"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud size={32} className="text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-700">Pilih File Logo/Foto UMKM</p>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
            {error}
          </div>
        )}

        <button
  type="submit"
  disabled={isSubmitting || loading}
  className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold text-white transition-all 
    ${
      isSubmitting
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-[#236fa6] hover:bg-[#1f5f8f] shadow-md shadow-[#236fa6]/40'
    }
  `}
>
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>{isEditMode ? 'Simpan Perubahan' : 'Simpan UMKM Baru'}</span>
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
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      {...props}
    />
  </div>
);
