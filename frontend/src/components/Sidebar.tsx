import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Dashboard' },
  { path: '/dogs', label: 'Dogs' },
  { path: '/runners', label: 'Runners' },
  { path: '/activities', label: 'Activities' },
  { path: '/weight', label: 'Weight' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
  <div className="h-screen w-60 bg-primary text-cream fixed top-0 left-0 flex flex-col p-0">
      <h1 className="text-2xl font-bold mb-6">Kennel App</h1>
      <nav className="flex flex-col space-y-3 text-cream">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`w-full p-4 rounded text-left text-cream hover:underline ${
              location.pathname === tab.path ? 'font-bold underline' : ''
            } hover:bg-secondary `}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
