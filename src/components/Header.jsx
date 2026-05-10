import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, User, ChevronDown } from 'lucide-react';

const Header = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login');
    } else {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <header className="bg-white border-b flex justify-between items-center px-6 py-2 shadow-sm relative z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-sm md:text-lg font-semibold text-gray-700 uppercase tracking-tight">
          Sistem Pengurusan Identiti (FAST PPD)
        </h1>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 text-sm text-gray-600 hover:bg-gray-50 p-1 rounded-lg transition"
        >
          <span className="hidden md:block font-bold uppercase">{userName || 'PENGGUNA'}</span>
          <div className="w-8 h-8 bg-[#11a9bc] rounded-full border flex items-center justify-center text-white font-bold text-xs">
            {userName ? userName.charAt(0) : 'U'}
          </div>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase">Akaun Saya</p>
              <p className="text-xs font-bold text-gray-700 truncate">{userName}</p>
            </div>
            <button className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition">
              <User size={16} />
              <span>Profil Pengguna</span>
            </button>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t"
            >
              <LogOut size={16} />
              <span className="font-bold">Log Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;