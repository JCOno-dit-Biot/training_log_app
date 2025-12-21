import { Link, useLocation } from 'react-router-dom';

import { Button } from '../button';

interface SidebarItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

export default function SidebarItem({ to, label, icon }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      className="h-12 text-l w-full justify-start px-4 gap-3"
    >
      <Link
        to={to}
        className={`text-lg w-full flex items-center gap-3`}
      >
        <span className="h-5 w-5">{icon}</span>
        <span>{label}</span>
      </Link>
    </Button>
  );
}
