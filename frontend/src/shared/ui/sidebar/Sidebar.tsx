import { useNavigate } from 'react-router-dom';
import { Bike, ChartNoAxesCombined, LogOut, PawPrint, Weight } from 'lucide-react';

import { useAuth } from '@/app/auth/auth-context';

import { Button } from '../button';
import SidebarItem from '../sidebar/SidebarItem';

const tabs = [
  { path: '/kennel', label: 'My Kennel', icon: <PawPrint size={20} /> },
  { path: '/activities', label: 'Activities', icon: <Bike size={20} /> },
  { path: '/weight', label: 'Weight', icon: <Weight size={20} /> },
  { path: '/analytics', label: 'Analytics', icon: <ChartNoAxesCombined size={20} /> }
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
    <div className="bg-primary text-neutral-100 fixed top-0 left-0 flex h-screen w-50 flex-col p-0">
      <h1 className="text-l mb-6 font-bold">Kennel App</h1>
      <nav className="flex flex-col space-y-1">
        {tabs.map((tab) => (
          <SidebarItem key={tab.path} to={tab.path} label={tab.label} icon={tab.icon} />
        ))}
      </nav>

      <Button
        type="button"
        variant={'ghost'}
        className="h-12 w-full justify-start px-4 gap-3 absolute bottom-0"
        onClick={handleLogout}
      >
        <span><LogOut /></span>
        <span>Logout</span>
      </Button>
    </div>
  );
}
