import { ShoppingBag, Sparkles } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-gradient-mesh">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#324976] via-[#236fa6] to-[#324976] opacity-95"></div>
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="orb orb-1 absolute w-96 h-96 rounded-full bg-gradient-to-br from-[#3b87c4]/30 to-[#236fa6]/20 blur-3xl"></div>
        <div className="orb orb-2 absolute w-80 h-80 rounded-full bg-gradient-to-br from-[#5ca5d8]/25 to-[#3b87c4]/15 blur-3xl"></div>
        <div className="orb orb-3 absolute w-72 h-72 rounded-full bg-gradient-to-br from-[#236fa6]/35 to-[#324976]/20 blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 grid-pattern"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="light-particle light-particle-1 absolute w-2 h-2 rounded-full bg-white/60 blur-sm"></div>
        <div className="light-particle light-particle-2 absolute w-3 h-3 rounded-full bg-white/50 blur-sm"></div>
        <div className="light-particle light-particle-3 absolute w-2 h-2 rounded-full bg-white/70 blur-sm"></div>
        <div className="light-particle light-particle-4 absolute w-1.5 h-1.5 rounded-full bg-white/60 blur-sm"></div>
        <div className="light-particle light-particle-5 absolute w-2.5 h-2.5 rounded-full bg-white/50 blur-sm"></div>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent z-[1]"></div>
      <div className="relative z-10 flex flex-col items-center">
      <div className="relative w-36 h-36 flex items-center justify-center mb-8 animate-entrance-1">
      <div className="ring-pulse ring-pulse-1 absolute w-36 h-36 rounded-full border-2 border-white/20"></div>
      <div className="ring-pulse ring-pulse-2 absolute w-28 h-28 rounded-full border-2 border-white/30"></div>
      <div className="ring-pulse ring-pulse-3 absolute w-20 h-20 rounded-full border-2 border-white/40"></div>
          
          <div className="relative bg-[#e0f2fe]/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl shadow-black/30 card-float z-10 border border-white/20">
            <div className="relative bg-gradient-to-br from-[#e0f2fe] to-[#bfdbfe] text-[#236fa6] p-5 rounded-2xl shadow-lg shadow-[#236fa6]/20">
              <ShoppingBag size={56} strokeWidth={1.8} className="relative z-10" />
              
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent shine-effect"></div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 animate-entrance-2">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-tight leading-none drop-shadow-2xl">
            UMKM
            <span className="block md:inline md:ml-3 bg-gradient-to-r from-[#e0f2fe] via-white to-[#e0f2fe] bg-clip-text text-transparent accent-shine drop-shadow-lg">
              Connect
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent line-expand"></div>
            <p className="text-sm md:text-base font-semibold text-white/90 tracking-[0.2em] uppercase drop-shadow-md">
              Support Local, Grow Together
            </p>
            <div className="h-[2px] w-10 bg-gradient-to-r from-transparent via-white/60 to-transparent line-expand"></div>
          </div>
        </div>

        <div className="w-72 flex flex-col items-center gap-3 animate-entrance-3">
          <div className="relative w-full h-2.5 bg-white/10 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-white/20">
            <div className="absolute top-0 left-0 h-full loading-fill-glow rounded-full"></div>
             <div className="absolute top-0 left-0 h-full w-full shimmer-overlay rounded-full"></div>
          </div>
          
          <p className="text-sm font-medium text-white/80 loading-text-pulse drop-shadow-md">
            Memuat Aplikasi<span className="loading-dots"></span>
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1 animate-entrance-4">
          <p className="text-xs font-semibold text-white/60 flex items-center gap-2 drop-shadow-md">
            <Sparkles size={14} className="text-white/70" />
            Version 1.0.0
          </p>
          <p className="text-xs font-medium text-white/50 drop-shadow-md">
            © 2025 UMKM Connect By Dhinda 
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;