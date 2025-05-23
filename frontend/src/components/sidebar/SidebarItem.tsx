import { Link, useLocation } from 'react-router-dom';


interface SidebarItemProps {
    to: string;
    label: string;
    icon?: React.ReactNode;
}

export default function SidebarItem ({ to, label, icon }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block w-full px-4 py-3 rounded transition 
        ${isActive ? 'bg-secondary text-charcoal font-semibold' : 'text-white hover:bg-secondary'}`}
    >
      <div className='flex flex-row space-x-3'> {icon} <span>{label}</span> </div>
    </Link>
  );
}