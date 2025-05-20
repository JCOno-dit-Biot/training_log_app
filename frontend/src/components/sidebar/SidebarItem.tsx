import { Link, useLocation } from 'react-router-dom';

interface SidebarItemProps {
    to: string,
    label: string
}

export default function SidebarItem({ to, label }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block w-full px-4 py-3 rounded transition 
        ${isActive ? 'bg-secondary text-charcoal font-semibold' : 'text-white hover:bg-[#3A5C2E]'}`}
    >
      {label}
    </Link>
  );
}