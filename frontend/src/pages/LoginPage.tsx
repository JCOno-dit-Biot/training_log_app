import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../api/auth/token';
import { useAuth } from '../context/AuthContext';

//{ onLogin }: { onLogin: () => void }
export default function LoginPage() {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { setAuthenticated } = useAuth()

    useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
        navigate('/dashboard');
    } 
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await getToken(formData)
            localStorage.setItem("email", username)
            localStorage.setItem("access_token", response.access_token)
            setAuthenticated(true)
            navigate('/dashboard');

            } catch (err) {
                setError('Invalid credentials');
            };

    };

    return(
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
          <p>   
            <a href="/register" className="text-blue-600 hover:underline">Register</a> 
          </p>
          <p>
            <a href="/reset-password" className="text-blue-600 hover:underline">Forgot your password?</a>
          </p>
          
        </div>
        </div>
        </div>

    );

}
