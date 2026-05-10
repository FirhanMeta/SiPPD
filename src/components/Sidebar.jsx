import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard, ClipboardList, Building2,
  ShieldCheck, ChevronRight, Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { profile } = useAuth();
  const role = profile?.role;

  const allMenuItems = [
    {
      name: 'Dashboard PPD',
      path: '/ppd/dashboard',
      icon: LayoutDashboard,
      roles: ['ppd', 'superadmin'],
    },
    {
      name: 'Laporan Kehadiran',
      path: '/attendance/report',
      icon: ClipboardList,
      roles: ['guru', 'ppd', 'superadmin'],
    },
    {
      name: 'Pengurusan Institusi',
      path: '/admin/institusi',
      icon: Building2,
      roles: ['superadmin'],
    },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const roleLabel = {
    superadmin: 'Super Admin',
    ppd: 'Pegawai PPD',
    guru: 'Guru Kelas',
  };

  return (
    <aside className="w-64 bg-[#0f1923] min-h-screen flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm tracking-wide">FAST PPD</p>
            <p className="text-white/30 text-[10px] font-medium tracking-widest uppercase">SiPPD v2.0</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-teal-400" />
          <span className="text-teal-300 text-[11px] font-bold uppercase tracking-wider">
            {roleLabel[role] ?? 'Pengguna'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        <p className="px-3 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">
          Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                active
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />
              <span className="flex-1">{item.name}</span>
              {active && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-white/20 text-[10px] text-center font-mono">
          PPD Semporna © 2026
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
