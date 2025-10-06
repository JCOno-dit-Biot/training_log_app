import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from?.pathname || '/kennel';

  const { status, isAuthenticated, login } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true)
    setError(null)
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      await login(username, password); // AuthProvider sets tokens+user+status
      // navigation happens via the effect when status flips to authenticated
    } catch (err: any) {
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
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(/background/canicross_bolt.jpg)` }}
    >
      <div className="max-w-md mx-auto mt-10 p-6 rounded shadow bg-white">
        <h1 className="text-xl font-bold mb-4 text-center">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text=center space-y-2">
          {/* <p>   
            <a href="/register" className="text-blue-600 hover:underline">Register</a> 
          </p> */}
          <p>
            <a href="/reset-password" className="text-blue-600 hover:underline">Forgot your password?</a>
          </p>

        </div>
      </div>
    </div>

  );

}
