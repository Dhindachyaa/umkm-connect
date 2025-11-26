import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client'; 
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShoppingBag, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/');
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage('Password dan Confirm Password tidak sama!');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Daftar Gagal: ${error.message}`);
      } else {
        localStorage.setItem('user_profile', JSON.stringify({ name, email }));
        setMessage('Pendaftaran berhasil! Silakan cek email untuk konfirmasi.');
        setIsSignUp(false);
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Login Gagal: ${error.message}`);
      } else {
        setMessage('Login Berhasil! Mengarahkan...');
        navigate('/');
      }
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Masukkan email untuk reset password!');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setMessage(`Gagal mengirim email reset: ${error.message}`);
    else setMessage('Email reset password telah dikirim!');
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-sky-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-blue-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

    <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#324976] to-[#236fa6] rounded-2xl mb-4 shadow-lg animate-logo-bounce">
            <ShoppingBag className="text-white animate-logo-icon" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#324976] mb-2 animate-brand-title">UMKM Connect</h1>
          <p className="text-gray-600 animate-brand-subtitle">Temukan Produk Lokal Terbaik Semarang</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm bg-opacity-95 animate-slide-up">
          <h2 className="text-xl sm:text-2xl font-bold text-[#324976] mb-1 sm:mb-2 text-center">
            {isSignUp ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-5 sm:mb-6">
            {isSignUp ? 'Daftarkan akunmu sekarang!' : 'Login untuk melanjutkan'}
          </p>

          {message && (
            <div
              className={`flex items-start gap-3 p-4 mb-6 rounded-xl animate-scale-in ${
                message.includes('Gagal') || message.includes('tidak sama')
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              {message.includes('Gagal') || message.includes('tidak sama') ? (
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              )}
              <p
                className={`text-sm ${
                  message.includes('Gagal') || message.includes('tidak sama')
                    ? 'text-red-700'
                    : 'text-green-700'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#236fa6] transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder-animate"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#236fa6] transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder-animate"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#236fa6] transition-colors" size={20} />
                <input
                  type={'password'} 
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder-animate"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#236fa6] transition-colors" size={20} />
                  <input
                    type={'password'}
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:border-[#236fa6] focus:ring-4 focus:ring-blue-50 outline-none transition-all duration-200 placeholder-animate"
                  />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#236fa6] hover:text-[#324976] font-medium hover:underline transition-colors"
                >
                  Lupa password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#324976] to-[#236fa6] text-white py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span>{isSignUp ? 'Daftar Sekarang' : 'Login'}</span>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-[#236fa6] hover:text-[#324976] font-semibold hover:underline transition-colors"
              >
                {isSignUp ? 'Login di sini' : 'Daftar sekarang'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;