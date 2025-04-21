import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Dashboard' },
  { path: '/dogs', label: 'Dogs' },
  { path: '/runners', label: 'Runners' },
  { path: '/activities', label: 'Activities' },
  { path: '/weight', label: 'Weight' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 shadow-md">
      <ul className="flex space-x-6">
        {tabs.map(tab => (
          <li key={tab.path}>
            <Link
              to={tab.path}
              className={`hover:underline ${
                location.pathname === tab.path ? 'font-bold underline' : ''
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
