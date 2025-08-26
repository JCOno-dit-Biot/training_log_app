import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ActivityFeed from './pages/ActivityFeed';
import MyKennelPage from './pages/MyKennelPage';
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
          {/* <Route path="/register" element={<RegisterPage />} /> */}
           {/* Protected route with shared layout */}
          <Route path="/kennel" element={<PrivateRoute><Layout><MyKennelPage /></Layout></PrivateRoute>} />
         
          <Route path="/activities" element={<PrivateRoute><Layout><ActivityFeed /></Layout></PrivateRoute>} />
          {/* <Route path="/weight" element={<WeightPage />} />  */}
        </Routes>
    </div>
  );
}