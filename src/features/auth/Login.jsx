import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, Activity, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('E-mel atau kata laluan tidak sah. Sila cuba semula.');
      setLoading(false);
      return;
    }

    // Fetch role for redirection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'superadmin') navigate('/admin/institusi');
    else if (profile?.role === 'ppd')   navigate('/ppd/dashboard');
    else                                navigate('/attendance/report');

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#11a9bc 1px, transparent 1px), linear-gradient(90deg, #11a9bc 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-5xl flex rounded-2xl overflow-hidden shadow-2xl border border-white/5">
        {/* LEFT — Branding */}
        <div className="hidden md:flex w-5/12 bg-gradient-to-br from-[#0f2a30] to-[#0b1a20] flex-col justify-between p-10 border-r border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/40">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-sm tracking-wide">FAST PPD</p>
              <p className="text-teal-400/50 text-[10px] font-mono tracking-widest">SiPPD v2.0</p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-white leading-tight mb-3">
              Sistem<br />
              <span className="text-teal-400">Pengurusan</span><br />
              SiPPD
            </h1>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Platform Pengurusan PPD.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Sekolah Rendah (SK)', value: '24' },
              { label: 'Sekolah Menengah (SMK)', value: '6' },
              { label: 'Kadar KPI Semasa', value: '89.86%' },
            ].map((stat) => (
              <div key={stat.label} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/40 text-xs font-medium">{stat.label}</span>
                <span className="text-teal-400 text-xs font-black">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Login Form */}
        <div className="flex-1 bg-[#0f1923] p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-1">Daftar Masuk</h2>
              <p className="text-white/40 text-sm">Masukkan maklumat akaun anda</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-xs font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                  E-mel Rasmi
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@moe.gov.my"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:bg-white/8 transition"
                />
              </div>

              <div>
                <label className="block text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Kata Laluan
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-sm uppercase tracking-widest transition shadow-lg shadow-teal-500/20 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sila Tunggu...
                  </span>
                ) : 'Masuk'}
              </button>
            </form>

            <div className="mt-6 flex justify-between text-xs font-bold">
              <Link to="/register" className="text-white/30 hover:text-teal-400 transition">
                Daftar Akaun Baru →
              </Link>
              <Link to="/forgot-password" className="text-white/30 hover:text-teal-400 transition">
                Lupa Kata Laluan?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
