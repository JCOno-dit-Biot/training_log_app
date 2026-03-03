import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { useAuth } from '@/app/auth/auth-context';
import { NAV_TABS } from "@/app/nav/tabs";

import { Button } from '../button';
import SidebarItem from '../sidebar/SidebarItem';


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
      <h1 className="text-l mb-6 mt-2 text-center font-bold">PackTrack</h1>
      <nav className="flex flex-col space-y-1">
        {NAV_TABS.map((tab) => (
          <SidebarItem key={tab.path} to={tab.path} label={tab.label} icon={<tab.Icon />} />
        ))}
      </nav>

      <Button
        type="button"
        variant={'ghost'}
        className="h-12 w-full justify-start px-4 gap-3 absolute bottom-1"
        onClick={handleLogout}
      >
        <span><LogOut /></span>
        <span>Logout</span>
      </Button>
    </div>
  );
}
