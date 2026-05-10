import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LogOut, User, ChevronDown, Bell } from 'lucide-react';

const Header = ({ title = 'Dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Pengguna';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-tight">{title}</h2>
        <p className="text-xs text-gray-400 font-medium">
          {new Date().toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition border border-gray-200">
          <Bell size={16} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow">
              {initial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-700 leading-tight uppercase">{displayName}</p>
              <p className="text-[10px] text-gray-400 capitalize">{profile?.role ?? '—'}</p>
            </div>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-white border-b">
                  <p className="text-[10px] font-black text-teal-500 uppercase tracking-wider">Akaun Saya</p>
                  <p className="text-xs font-bold text-gray-700 truncate mt-0.5">{user?.email}</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition">
                  <User size={15} className="text-gray-400" />
                  <span className="font-medium">Profil Pengguna</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-100"
                >
                  <LogOut size={15} />
                  <span className="font-bold">Log Keluar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
