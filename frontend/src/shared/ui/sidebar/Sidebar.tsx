import { useNavigate } from 'react-router-dom';
import { Bike, LogOut, PawPrint, Weight } from 'lucide-react';

import { useAuth } from '@app/providers/auth-provider';

import SidebarItem from '../sidebar/SidebarItem';

const tabs = [
  { path: '/kennel', label: 'My Kennel', icon: <PawPrint size={20} /> },
  { path: '/activities', label: 'Activities', icon: <Bike size={20} /> },
  { path: '/weight', label: 'Weight', icon: <Weight size={20} /> },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout(); // backend clears refresh cookie
    } catch (err) {
      console.error('Logout error:', err); // optional toast here
    }

    navigate('/');
  };
  return (
    <div className="bg-primary text-cream fixed top-0 left-0 flex h-screen w-50 flex-col p-0">
      <h1 className="text-l mb-6 font-bold">Kennel App</h1>
      <nav className="flex flex-col space-y-1">
        {tabs.map((tab) => (
          <SidebarItem key={tab.path} to={tab.path} label={tab.label} icon={tab.icon} />
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="text-cream hover:bg-secondary hover:text-charcoal absolute bottom-4 flex w-full items-center gap-3 rounded px-4 py-3 transition"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}
