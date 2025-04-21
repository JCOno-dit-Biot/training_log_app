import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import DogsPage from './pages/DogsPage';
import RunnersPage from './pages/RunnersPage';
import './App.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dogs" element={<DogsPage />} />
          <Route path="/runners" element={<RunnersPage />} />
          {/* <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/weight" element={<WeightPage />} />  */}
        </Routes>
      </div>
    </div>
  );
}