import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@app/auth/auth-context';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [_pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from?.pathname || '/kennel';

  const { status, isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      await login(username, password); // AuthProvider sets tokens+user+status
      // navigation happens via the effect when status flips to authenticated
    } catch {
      // Keep it generic; optionally parse err.response?.data
      setError('Invalid credentials or network error.');
    } finally {
      setPending(false);
    }
  };
  if (status === 'unknown') {
    return <div className="p-6 text-sm text-gray-500">Checking session…</div>;
  }

  return (
    <div
      className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(/background/canicross_bolt.jpg)` }}
    >
      <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
        <h1 className="mb-4 text-center text-xl font-bold">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="text=center mt-4 space-y-2 text-sm">
          {/* <p>   
            <a href="/register" className="text-blue-600 hover:underline">Register</a> 
          </p> */}
          <p>
            <a href="/reset-password" className="text-blue-600 hover:underline">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
