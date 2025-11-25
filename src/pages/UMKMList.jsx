// src/pages/UMKMList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, MapPin } from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function UMKMList() {
    const [umkms, setUmkms] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    const fetchUmkms = async () => {
        setLoading(true);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        try {
            let query = supabase
                .from("umkm")
                .select("*", { count: 'exact' })
                .order('name', { ascending: true })
                .range(start, end);

            if (search) {
                query = query.ilike("name", `%${search}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            setUmkms(data || []);
            setTotalData(count || 0);
        } catch (err) {
            console.error("Error fetching UMKM:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchUmkms, 400); // Debounce search
        return () => clearTimeout(t);
    }, [search, page]);

    const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

    const handleCreateNew = () => {
        navigate('/umkm/new');
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm border-b border-gray-200">
                <div className="flex justify-between items-center mb-3"> 
                    <h1 className="text-xl font-bold text-gray-800">Daftar UMKM</h1>
                    <button
                        onClick={handleCreateNew}
                        className="bg-[#236fa6] text-white p-2 rounded-full shadow-md hover:bg-[#1e5a87] transition-colors"
                        aria-label="Tambah UMKM Baru"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama UMKM..."
                        className="w-full bg-white rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none border border-gray-300 focus:ring-2 focus:ring-[#236fa6]"
                        value={search}
                        onChange={(e) => {
                            setPage(1);
                            setSearch(e.target.value);
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <p className="text-center text-sm text-gray-600">Memuat data UMKM...</p>
                ) : umkms.length === 0 ? (
                    <p className="text-center text-gray-500">Tidak ada UMKM ditemukan.</p>
                ) : (
                    umkms.map((umkm) => (
                        <Link
                            to={`/umkm/${umkm.id}`}
                            key={umkm.id}
                            className="flex bg-white p-4 rounded-xl shadow-sm border border-gray-200 items-center gap-4 hover:shadow-md hover:border-[#236fa6] transition"
                        >
                            <img
                                src={umkm.image_url || "https://placehold.co/80"}
                                alt={umkm.name}
                                className="w-20 h-20 rounded-lg object-cover bg-[#236fa6] flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-800 truncate">{umkm.name}</h3>
                                <p className="text-xs text-[#236fa6] font-semibold mt-1 inline-block bg-[#e0f2fe] px-2 py-0.5 rounded-full">
                                    {capitalize(umkm.category) || 'Kategori Umum'}
                                </p>
                                <div className="flex items-center mt-2 text-sm text-gray-500 truncate">
                                    <MapPin size={16} className="mr-1 text-[#236fa6]-500 flex-shrink-0" /> 
                                    <span className="truncate">{umkm.address}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-6 py-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#236fa6] text-white hover:bg-[#1e5a87]"
                    }`}
                >
                    Previous
                </button>
                <span className="text-sm font-medium text-gray-700">
                    Halaman {page} / {totalPages || 1}
                </span>
                <button
                    disabled={page >= totalPages || totalPages === 0 || umkms.length < ITEMS_PER_PAGE}
                    onClick={() => setPage(page + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page >= totalPages || totalPages === 0 || umkms.length < ITEMS_PER_PAGE ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#236fa6] text-white hover:bg-[#1e5a87]"
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
