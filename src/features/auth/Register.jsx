import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Kata laluan tidak sepadan.');
      return;
    }
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
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
            <p className="text-white/30 text-[10px] font-mono">Daftar Akaun Baru</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-teal-400 mx-auto mb-4" />
            <p className="text-white font-bold mb-2">Pendaftaran Berjaya!</p>
            <p className="text-white/40 text-sm">Sila semak e-mel anda untuk pengesahan. Mengalih semula...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-xs font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { label: 'Nama Penuh', name: 'full_name', type: 'text', placeholder: 'Nama seperti dalam IC' },
                { label: 'E-mel Rasmi', name: 'email', type: 'email', placeholder: 'nama@moe.gov.my' },
                { label: 'Kata Laluan', name: 'password', type: 'password', placeholder: 'Min. 8 aksara' },
                { label: 'Sahkan Kata Laluan', name: 'confirm', type: 'password', placeholder: 'Ulang kata laluan' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-white/50 text-[11px] font-bold uppercase tracking-wider mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-bold py-3 rounded-lg text-sm uppercase tracking-widest transition mt-2"
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-white/30 text-xs">
          Sudah ada akaun?{' '}
          <Link to="/login" className="text-teal-400 font-bold hover:underline">
            Daftar Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
