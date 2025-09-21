import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ActivityFeed from './pages/ActivityFeed';
import MyKennelPage from './pages/MyKennelPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'
import { RequireAuth } from './functions/auth/RequireAuth';
import Layout from './components/Layout';

import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          <Route element={<RequireAuth />}>
           {/* Protected route with shared layout */}
            <Route path="/kennel" element={<Layout><MyKennelPage /></Layout>} />
            <Route path="/activities" element={<Layout><ActivityFeed /></Layout>} />
            {/* <Route path="/weight" element={<WeightPage />} />  */}
          </Route>
        </Routes>
    </div>
  );
}