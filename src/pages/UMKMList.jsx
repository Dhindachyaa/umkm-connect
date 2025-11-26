import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Store, ChevronLeft, ChevronRight } from "lucide-react";

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
        const t = setTimeout(fetchUmkms, 400); 
        return () => clearTimeout(t);
    }, [search, page]);

    const totalPages = Math.ceil(totalData / ITEMS_PER_PAGE);

    const handleCreateNew = () => {
        navigate('/umkm/new');
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <>
            <style>{`
                @keyframes umkmFadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes umkmSlideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes umkmScaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes umkmShimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }

                @keyframes umkmPulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                @keyframes umkmFloat {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }

                .umkm-header-animate {
                    animation: umkmFadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .umkm-search-animate {
                    animation: umkmScaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
                }

                .umkm-card-animate {
                    animation: umkmSlideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
                }

                .umkm-pagination-animate {
                    animation: umkmSlideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
                }

                .umkm-skeleton {
                    background: linear-gradient(
                        90deg,
                        #e0f2fe 0%,
                        #f0f9ff 50%,
                        #e0f2fe 100%
                    );
                    background-size: 200% 100%;
                    animation: umkmShimmer 1.5s ease-in-out infinite;
                }

                .umkm-pulse {
                    animation: umkmPulse 2s ease-in-out infinite;
                }

                .umkm-float {
                    animation: umkmFloat 3s ease-in-out infinite;
                }

                .umkm-hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .umkm-hover-lift:hover {
                    transform: translateY(-6px) scale(1.01);
                    box-shadow: 0 20px 25px -5px rgba(35, 111, 166, 0.15), 0 10px 10px -5px rgba(35, 111, 166, 0.1);
                }

                .umkm-hover-glow:hover {
                    box-shadow: 0 0 20px rgba(35, 111, 166, 0.3);
                }

                @media (prefers-reduced-motion: reduce) {
                    *,
                    *::before,
                    *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 pb-20">
                <div className="bg-white sticky top-0 z-10 shadow-md border-b border-gray-200 umkm-header-animate">
                    <div className="px-4 py-4">
                        <div className="flex justify-between items-center mb-4"> 
                            <h1 className="text-2xl font-bold text-[#324976]">Daftar UMKM</h1>
                            <button
                                onClick={handleCreateNew}
                                className="bg-gradient-to-r from-[#324976] to-[#236fa6] text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                                aria-label="Tambah UMKM Baru"
                            >
                                <Plus size={15} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="relative umkm-search-animate">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari nama UMKM..."
                                className="w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none border-2 border-gray-200 focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4 mt-2">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div 
                                key={i} 
                                className="flex bg-white p-4 rounded-2xl shadow-md border border-gray-100 items-center gap-4 umkm-skeleton"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg w-3/4"></div>
                                    <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg w-1/4"></div>
                                    <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg w-1/2"></div>
                                </div>
                            </div>
                        ))
                    ) : umkms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 umkm-card-animate">
                            <div className="p-6 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] rounded-full mb-4 umkm-float">
                                <Store size={48} className="text-[#236fa6]" />
                            </div>
                            <p className="text-gray-500 text-center font-medium">Tidak ada UMKM ditemukan</p>
                            <p className="text-gray-400 text-sm text-center mt-1">Coba kata kunci lain atau tambah UMKM baru</p>
                        </div>
                    ) : (
                        umkms.map((umkm, idx) => (
                            <Link
                                to={`/umkm/${umkm.id}`}
                                key={umkm.id}
                                className="umkm-card-animate flex bg-white p-4 rounded-2xl shadow-md border-2 border-transparent items-center gap-4 umkm-hover-lift hover:border-[#236fa6]/30 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30 transition-all duration-300 group"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#236fa6]/20 to-[#324976]/20 rounded-xl group-hover:scale-110 transition-transform duration-300 blur-sm"></div>
                                    <img
                                        src={umkm.image_url || "https://placehold.co/80"}
                                        alt={umkm.name}
                                        className="relative w-20 h-20 rounded-xl object-cover border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#236fa6] to-[#324976] rounded-full flex items-center justify-center shadow-lg umkm-pulse">
                                        <Store size={12} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-[#324976] truncate group-hover:text-[#236fa6] transition-colors duration-300">
                                        {umkm.name}
                                    </h3>
                                    <p className="text-xs text-[#236fa6] font-semibold mt-1.5 inline-block bg-gradient-to-r from-[#e0f2fe] to-[#bfdbfe] px-3 py-1 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                                        {capitalize(umkm.category) || 'Kategori Umum'}
                                    </p>
                                    <div className="flex items-center mt-2.5 text-sm text-gray-600 group-hover:text-[#236fa6] transition-colors">
                                        <MapPin size={16} className="mr-1.5 text-[#236fa6] flex-shrink-0" /> 
                                        <span className="truncate">{umkm.address}</span>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="text-gray-300 group-hover:text-[#236fa6] group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                            </Link>
                        ))
                    )}
                </div>

                {!loading && umkms.length > 0 && (
                    <div className="umkm-pagination-animate flex justify-center items-center gap-5 mt-10 pb-4 px-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className={`flex items-center gap-1 px-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                page === 1 
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-[#324976] to-[#236fa6] text-white shadow-lg hover:shadow-xl hover:scale-105"
                            }`}
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>
                        
                        <div className="px-4 py-2.5 bg-white rounded-xl shadow-md border border-gray-200">
                            <span className="text-sm font-bold text-[#324976]">
                                {page}
                            </span>
                            <span className="text-sm text-gray-400 mx-1">/</span>
                            <span className="text-sm text-gray-600">
                                {totalPages || 1}
                            </span>
                        </div>
                        
                        <button
                            disabled={page >= totalPages || totalPages === 0 || umkms.length < ITEMS_PER_PAGE}
                            onClick={() => setPage(page + 1)}
                            className={`flex items-center gap-1 px-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                page >= totalPages || totalPages === 0 || umkms.length < ITEMS_PER_PAGE
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-[#324976] to-[#236fa6] text-white shadow-lg hover:shadow-xl hover:scale-105"
                            }`}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {!loading && totalData > 0 && (
                    <div className="text-center pb-4">
                        <p className="text-sm text-gray-500">
                           Menampilkan <span className="font-semibold text-[#236fa6]">{umkms.length}</span> dari halaman{" "}
                            <span className="font-semibold text-[#236fa6]">{page}</span> / <span className="font-semibold text-[#236fa6]">{totalPages}</span>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}