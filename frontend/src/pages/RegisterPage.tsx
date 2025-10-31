import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Kennel } from '@shared/types/Kennel';
import { getKennels } from '@entities/auth/api/kennels';
import { register } from '@entities/auth/api/register';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [kennelQuery, setKennelQuery] = useState('');
  const [filteredKennels, setFilteredKennels] = useState<Kennel[]>([]);
  const [addNewMode, setAddNewMode] = useState(false);
  const [newKennelName, setNewKennelName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getKennels()
      .then((res) => setKennels(res))
      .catch(() => setKennels([]));
  }, []);

  useEffect(() => {
    const filtered = kennels.filter((k) =>
      k.name.toLowerCase().includes(kennelQuery.toLowerCase()),
    );
    setFilteredKennels(filtered);
  }, [kennelQuery, kennels]);

  const handleSelectKennel = (kennel: string) => {
    setKennelQuery(kennel);
    setFilteredKennels([]);
  };

  const onRegister = async (e: React.FocusEvent) => {
    e.preventDefault();
    setError('');

    const kennel_name = addNewMode ? newKennelName : kennelQuery;

    if (!kennel_name) {
      setError('Please select or enter a kennel name.');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('email', username); // if email is used instead of "username"
    formData.append('password', password);
    formData.append('kennel_name', kennel_name);

    try {
      const res = await register(formData);

      if (res.status_code === 201) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 5000); // redirect after 10s
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-bold">Register</h2>

        <form onSubmit={onRegister} className="space-y-4">
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

          {/* Kennel Search/Selection */}
          {!addNewMode && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search kennel"
                className="w-full rounded border p-2"
                value={kennelQuery}
                onChange={(e) => setKennelQuery(e.target.value)}
              />
              {kennelQuery && (
                <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded border bg-white text-sm shadow">
                  {filteredKennels.map((kennel) => (
                    <li
                      key={kennel.name}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-100"
                      onClick={() => handleSelectKennel(kennel.name)}
                    >
                      {kennel.name}
                    </li>
                  ))}
                  {filteredKennels.length === 0 && (
                    <li
                      className="cursor-pointer px-3 py-2 text-blue-600 hover:underline"
                      onClick={() => setAddNewMode(true)}
                    >
                      ➕ Add new kennel
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* If adding new kennel, show input field */}
          {addNewMode && (
            <input
              type="text"
              placeholder="New kennel name"
              className="w-full rounded border p-2"
              value={newKennelName}
              onChange={(e) => setNewKennelName(e.target.value)}
              required
            />
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        {success && (
          <div className="mt-4 rounded border border-green-400 bg-green-100 p-4 text-green-700">
            Account created successfully! Redirecting to login in 5 seconds...
          </div>
        )}

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
