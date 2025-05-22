import SidebarItem from '../sidebar/SidebarItem'
import { Home, PawPrint, Bike, Weight, LogOut } from 'lucide-react'

const tabs = [
  { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/my-kennel', label: 'My Kennel', icon: <PawPrint size={20} /> },
  { path: '/activities', label: 'Activities', icon: <Bike size={20} /> },
  { path: '/weight', label: 'Weight', icon: <Weight size={20} /> },
];

export default function Sidebar() {
  return (
  <div className="h-screen w-50 bg-primary text-cream fixed top-0 left-0 flex flex-col p-0">
      <h1 className="text-l font-bold mb-6">Kennel App</h1>
      <nav className="flex flex-col space-y-1">
        {tabs.map((tab) => (
          <SidebarItem key={tab.path} to={tab.path} label={tab.label} icon={tab.icon} />
        ))}
      </nav>

      <button
        // onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 w-full text-cream hover:bg-secondary hover:text-charcoal rounded transition"
      >
        <LogOut size={20} />
        Logout
      </button>
      
    </div>
  );
}
