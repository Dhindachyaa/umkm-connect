import { ShoppingBag } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background Decoration halus: Menggunakan BG_LIGHT */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e0f2fe]/50 via-white to-white z-0"></div>

      <div className="z-10 flex flex-col items-center relative">
       
        {/* 1. Logo Icon */}
        <div className="animate-entrance-1 bg-white p-5 rounded-3xl shadow-xl shadow-[#e0f2fe] mb-8">
           {/* Icon BG: Gradient dari PRIMARY_ACCENT ke PRIMARY_DARK */}
           <div className="bg-gradient-to-tr from-[#236fa6] to-[#324976] text-white p-4 rounded-2xl">
             <ShoppingBag size={52} strokeWidth={1.5} />
           </div>
        </div>

        {/* 2. Title & Tagline */}
        <div className="animate-entrance-2 text-center mb-12">
            {/* Title: PRIMARY_DARK dan Accent */}
            <h1 className="text-4xl font-extrabold text-[#324976] mb-2 tracking-tight">
            UMKM <span className="text-[#236fa6]">Connect</span>
            </h1>
            {/* Tagline: PRIMARY_ACCENT */}
            <p className="text-[#236fa6] text-sm font-bold tracking-[0.2em] uppercase opacity-70">
            Support Local, Grow Together
            </p>
        </div>

        {/* 3. Loading Bar Animation (MENGGUNAKAN GLOBAL CSS) */}
        <div className="w-56 h-2 bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
          {/* Kelas kustom `loading-fill` akan membuat bar berjalan dari 0% ke 100% */}
          <div className="absolute top-0 left-0 h-full w-0 rounded-full bg-[#236fa6] loading-fill"></div>
        </div>

        {/* Version Info (Di bawah) */}
        <p className="absolute -bottom-32 animate-entrance-4 text-xs text-gray-400 font-medium">
          Versi 1.0.0 &copy; 2024 Dev Tim
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
