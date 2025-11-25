import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-6 shadow-xl rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4" style={{ color: '#236fa6' }}>
          {isSignUp ? 'Daftarkan akunmu sekarang!' : 'Selamat datang kembali!'}
        </h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.includes('Gagal') || message.includes('tidak sama') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 pl-10 border rounded-md"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 pl-10 border rounded-md"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 pl-10 border rounded-md"
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {isSignUp && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 pl-10 border rounded-md"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          )}

          {!isSignUp && (
            <p
              className="text-right text-sm cursor-pointer hover:underline"
              style={{ color: '#236fa6' }}
              onClick={handleForgotPassword}
            >
              Lupa password?
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-3 rounded-md"
            style={{ backgroundColor: '#236fa6' }}
          >
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold hover:underline"
            style={{ color: '#236fa6' }}
          >
            {isSignUp ? 'Login' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
