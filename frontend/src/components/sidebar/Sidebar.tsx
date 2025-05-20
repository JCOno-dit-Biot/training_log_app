import { SidebarItem } from '../sidebar/SidebarItem'

const tabs = [
  { path: '/', label: 'Dashboard' },
  { path: '/dogs', label: 'Dogs' },
  { path: '/runners', label: 'Runners' },
  { path: '/activities', label: 'Activities' },
  { path: '/weight', label: 'Weight' },
];

export default function Sidebar() {
  return (
  <div className="h-screen w-60 bg-primary text-cream fixed top-0 left-0 flex flex-col p-0">
      <h1 className="text-2xl font-bold mb-6">Kennel App</h1>
      <nav className="flex flex-col space-y-1 text-cream">
        {tabs.map((tab) => (
          <SidebarItem key={tab.path} to={tab.path} label={tab.label} />
        ))}
      </nav>
    </div>
  );
}
