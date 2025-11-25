import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* SEARCH & CATEGORY */}
            <div className="bg-white sticky top-0 z-20 px-4 py-3 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                    <h1 className="text-xl font-bold text-gray-800">Katalog Produk</h1>
                    <button onClick={handleCreateNew} className="bg-[#236fa6] text-white p-2 rounded-full shadow-md hover:bg-[#1e5a87] transition-colors">
                        <Plus size={20} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari produk..." 
                        className="w-full bg-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#236fa6] transition-all"
                        value={search} 
                        onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                    />
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat) => (
                        <button 
                            key={cat} 
                            onClick={() => { setPage(1); setSelectedCategory(cat); }}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                selectedCategory === cat 
                                ? 'bg-[#236fa6] text-white shadow-md shadow-[#236fa6]/30' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRID PRODUK */}
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {products.map((item) => (
                            <Link to={`/products/${item.id}`} key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300">
                                <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <img src={item.image_url || 'https://placehold.co/300'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute top-2 left-2 bg-[#236fa6]/100 backdrop-blur-sm text-[#e0f2fe] text-[10px] px-2 py-0.5 rounded-md">{item.category || 'Umum'}</span>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug mb-2 min-h-[2.5em]">{item.name}</h3>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400">Harga</span>
                                            <span className="text-[#236fa6] font-bold text-sm">Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="bg-[#e0f2fe] text-[#236fa6] p-1.5 rounded-lg">
                                            <ShoppingBag size={14} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <p>Produk tidak ditemukan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
