import { useEffect, useState } from "react";
import { getKennels } from "@entities/auth/api/kennels";
import { register } from '@entities/auth/api/register'
import { Kennel } from '@shared/types/Kennel'
import { useNavigate } from "react-router-dom";

export default function Register() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [kennels, setKennels] = useState<Kennel[]>([]);
  const [kennelQuery, setKennelQuery] = useState('');
  const [filteredKennels, setFilteredKennels] = useState<Kennel[]>([]);
  const [addNewMode, setAddNewMode] = useState(false);
  const [newKennelName, setNewKennelName] = useState('');
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getKennels()
      .then(res => setKennels(res))
      .catch(() => setKennels([]));
  }, []);

  useEffect(() => {
    const filtered = kennels.filter(k =>
      k.name.toLowerCase().includes(kennelQuery.toLowerCase())
    );
    setFilteredKennels(filtered);
  }, [kennelQuery, kennels]);

  const handleSelectKennel = (kennel: string) => {
    setKennelQuery(kennel);
    setFilteredKennels([]);
  };

  const onRegister = async (e: React.FocusEvent) => {
    e.preventDefault();
    setError('')

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <form onSubmit={onRegister} className="space-y-4">
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

          {/* Kennel Search/Selection */}
          {!addNewMode && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search kennel"
                className="w-full p-2 border rounded"
                value={kennelQuery}
                onChange={(e) => setKennelQuery(e.target.value)}
              />
              {kennelQuery && (
                <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow text-sm max-h-40 overflow-y-auto">
                  {filteredKennels.map((kennel) => (
                    <li
                      key={kennel.name}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelectKennel(kennel.name)}
                    >
                      {kennel.name}
                    </li>
                  ))}
                  {filteredKennels.length === 0 && (
                    <li
                      className="px-3 py-2 text-blue-600 cursor-pointer hover:underline"
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
              className="w-full p-2 border rounded"
              value={newKennelName}
              onChange={(e) => setNewKennelName(e.target.value)}
              required
            />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Account created successfully! Redirecting to login in 5 seconds...
          </div>
        )}

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
