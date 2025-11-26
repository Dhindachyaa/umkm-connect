import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Plus, ChevronLeft, ChevronRight, Package } from 'lucide-react';

const ProductList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const perPage = 6;

    const categories = ['Semua', 'Makanan', 'Minuman', 'Kerajinan', 'Fashion', 'Jasa'];

    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const initialCategory = cat && categories.includes(cat) ? cat : 'Semua';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = async () => {
        setLoading(true);

        let query = supabase.from('products').select('*', { count: 'exact' });
        if (search) query = query.ilike('name', `%${search}%`);
        if (selectedCategory !== 'Semua') query = query.eq('category', selectedCategory);

        const { count } = await query;
        setTotalPages(Math.ceil((count || 0) / perPage));

        const { data, error } = await query
            .order('name', { ascending: true })
            .range((page - 1) * perPage, page * perPage - 1);

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);

        setLoading(false);
    };

    useEffect(() => {
        if (!selectedCategory) return;
        fetchProducts();
    }, [search, selectedCategory, page]);

    const handleCreateNew = () => navigate('/products/new');

    return (
        <>
            <style>{`
                @keyframes productFadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes productSlideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes productScaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes productSlideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes productShimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }

                @keyframes productPulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .product-header-animate {
                    animation: productFadeInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .product-search-animate {
                    animation: productScaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
                }

                .product-category-animate {
                    animation: productSlideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
                }

                .product-card-animate {
                    animation: productSlideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
                }

                .product-pagination-animate {
                    animation: productSlideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
                }

                .product-skeleton {
                    background: linear-gradient(
                        90deg,
                        #e0f2fe 0%,
                        #f0f9ff 50%,
                        #e0f2fe 100%
                    );
                    background-size: 200% 100%;
                    animation: productShimmer 1.5s ease-in-out infinite;
                }

                .product-hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .product-hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(35, 111, 166, 0.15);
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
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

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 pb-24">
                <div className="bg-white sticky top-0 z-20 shadow-md border-b border-gray-200 product-header-animate">
                    <div className="px-4 py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold text-[#324976]">Katalog Produk</h1>
                            <button 
                                onClick={handleCreateNew} 
                                className="bg-gradient-to-r from-[#324976] to-[#236fa6] text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="relative product-search-animate mb-4">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari produk..." 
                                className="w-full bg-gray-50 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none border-2 border-gray-200 focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all duration-300"
                                value={search} 
                                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                            />
                        </div>

                        <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map((cat, idx) => (
                                <button 
                                    key={cat} 
                                    onClick={() => { setPage(1); setSelectedCategory(cat); }}
                                    className={`product-category-animate whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                        selectedCategory === cat 
                                        ? 'bg-gradient-to-r from-[#324976] to-[#236fa6] text-white shadow-lg scale-105' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                                    }`}
                                    style={{ animationDelay: `${0.4 + (idx * 0.05)}s` }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className="product-skeleton rounded-2xl overflow-hidden">
                                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-200"></div>
                                    <div className="p-2.5 space-y-2">
                                        <div className="h-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded"></div>
                                        <div className="h-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded w-1/2 mt-2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="product-card-animate flex flex-col items-center justify-center py-20">
                            <div className="p-8 bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] rounded-full mb-4">
                                <Package size={64} className="text-[#236fa6]" />
                            </div>
                            <p className="text-gray-500 text-center font-medium text-lg">Produk tidak ditemukan</p>
                            <p className="text-gray-400 text-sm text-center mt-1">Coba kata kunci lain atau ubah kategori</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
                            {products.map((item, idx) => (
                                <Link 
                                    to={`/products/${item.id}`} 
                                    key={item.id} 
                                    className="product-card-animate bg-white rounded-xl shadow-md border-2 border-transparent overflow-hidden group product-hover-lift hover:border-[#236fa6]/30"
                                    style={{ animationDelay: `${idx * 0.08}s` }}
                                >
                                        <div className="w-full h-48">                                        
                                            <img 
                                            src={item.image_url || 'https://placehold.co/300'} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                        />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="absolute top-1.5 left-1.5 bg-[#236fa6] backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-md">
                                            {item.category || 'Umum'}
                                        </span>
                                    </div>
                                    <div className="p-2.5">
                                        <h3 className="font-bold text-[#324976] text-xs leading-tight mb-1.5 min-h-[2.2em] line-clamp-2 group-hover:text-[#236fa6] transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-gray-400 uppercase tracking-wide">Harga</span>
                                                <span className="text-[#236fa6] font-bold text-xs">
                                                    Rp {(item.price || 0).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] text-[#236fa6] p-1.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                                <ShoppingBag size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && products.length > 0 && totalPages > 1 && (
                    <div className="product-pagination-animate flex justify-center items-center gap-5 mt-10 pb-4 px-4">
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
                                {totalPages}
                            </span>
                        </div>
                        
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className={`flex items-center gap-1 px-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300  ${
                                page >= totalPages
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                    : "bg-gradient-to-r from-[#324976] to-[#236fa6] text-white shadow-lg hover:shadow-xl hover:scale-105"
                            }`}
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="text-center pb-4">
                        <p className="text-sm text-gray-500">
                            Menampilkan <span className="font-semibold text-[#236fa6]">{products.length}</span> dari halaman{" "}
                            <span className="font-semibold text-[#236fa6]">{page}</span> / <span className="font-semibold text-[#236fa6]">{totalPages}</span>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ProductList;