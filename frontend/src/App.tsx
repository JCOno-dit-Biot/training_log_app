import { Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';

import DashboardPage from './pages/DashboardPage';
import DogsPage from './pages/DogsPage';
import RunnersPage from './pages/RunnersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'
import PrivateRoute from './components/PrivateRoutes';
import Layout from './components/Layout';

import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
           {/* Protected route with shared layout */}
          <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
          <Route path="/dogs" element={<PrivateRoute><Layout><DogsPage /></Layout></PrivateRoute>} />
          <Route path="/runners" element={<PrivateRoute><Layout><RunnersPage /></Layout></PrivateRoute>} />
          {/* <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/weight" element={<WeightPage />} />  */}
        </Routes>
    </div>
  );
}