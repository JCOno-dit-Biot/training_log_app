import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './auth-context';

export function RequireAuth() {
  const { status } = useAuth();
  const loc = useLocation();

  if (status === 'unknown') return <div />; // or a splash screen
  if (status === 'guest') return <Navigate to="/login" replace state={{ from: loc }} />;

  return <Outlet />;
}
