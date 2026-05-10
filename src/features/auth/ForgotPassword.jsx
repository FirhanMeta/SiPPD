import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) setError(resetError.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f1923] rounded-2xl border border-white/5 shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">FAST PPD</p>
            <p className="text-white/30 text-[10px] font-mono">Tetapkan Semula Kata Laluan</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-teal-400 mx-auto mb-4" />
            <p className="text-white font-bold mb-2">E-mel Dihantar!</p>
            <p className="text-white/40 text-sm">Sila semak peti masuk anda untuk pautan tetapan semula.</p>
            <Link to="/login" className="mt-6 inline-block text-teal-400 text-sm font-bold hover:underline">
              ← Kembali ke Log Masuk
            </Link>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-sm mb-6">
              Masukkan e-mel anda dan kami akan menghantar pautan untuk menetapkan semula kata laluan.
            </p>
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-xs font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleReset} className="space-y-4">
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
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-widest transition"
              >
                {loading ? 'Menghantar...' : 'Hantar Pautan Reset'}
              </button>
            </form>
            <p className="mt-6 text-center">
              <Link to="/login" className="text-white/30 text-xs hover:text-teal-400 transition">
                ← Kembali ke Log Masuk
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
