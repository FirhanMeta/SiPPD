import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/ppd/dashboard' },
    { name: 'Laporan Kehadiran', path: '/attendance/report' },
    { name: 'Pengurusan PPD', path: '/admin/institusi' },
  ];

  return (
    <div className="w-64 bg-[#2d2d2d] min-h-screen text-white p-4">
      <div className="mb-8 p-4 border-b border-gray-700">
         <h1 className="font-black text-[#11a9bc]">FAST PPD</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`block p-3 rounded text-sm font-bold ${
              location.pathname === item.path ? 'bg-[#11a9bc]' : 'hover:bg-gray-700'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};