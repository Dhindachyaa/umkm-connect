import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShoppingBag, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setMessage(
      error ? `Gagal mengirim email reset: ${error.message}` 
            : 'Email reset password telah dikirim!'
    );
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#324976] to-[#236fa6] rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[#324976]">UMKM Connect</h1>
          <p className="text-gray-600">Temukan Produk Lokal Terbaik Semarang</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#324976] text-center">
            {isSignUp ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {isSignUp ? 'Daftarkan akunmu sekarang!' : 'Login untuk melanjutkan'}
          </p>

          {message && (
            <div
              className={`flex items-start gap-3 p-4 mb-6 rounded-xl ${
                message.includes('Gagal') || message.includes('tidak sama')
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              {message.includes('Gagal') || message.includes('tidak sama') ? (
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              ) : (
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
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
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#236fa6] outline-none"
                  />
                </div>
              </div>
            )}

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#236fa6] outline-none"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#236fa6] outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ulangi password"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#236fa6] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[#236fa6] hover:underline text-sm"
                >
                  Lupa password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#324976] to-[#236fa6] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isSignUp ? 'Daftar Sekarang' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-600">
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
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-[#236fa6] font-semibold hover:underline"
            >
              {isSignUp ? 'Login di sini' : 'Daftar sekarang'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
