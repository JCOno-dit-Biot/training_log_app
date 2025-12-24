import { Route, Routes } from 'react-router-dom';

import Layout from '@shared/ui/Layout';
import ActivityFeed from '@pages/ActivityFeed';
import LoginPage from '@pages/LoginPage';
import MyKennelPage from '@pages/MyKennelPage';
// import RegisterPage from './pages/RegisterPage' the registration is disabled for now
import { RequireAuth } from '@/app/auth/require-auth';
import AnalyticsPage from '@/pages/AnalyticsPage';
import WeightsPage from '@/pages/WeightPage';

import { AfterAuthWarmup } from './auth/warmup';
import { AuthProvider } from './providers/auth-provider';
import { ReactQueryProvider } from './providers/react-query';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen">
      <ReactQueryProvider>
        <AuthProvider>
          <AfterAuthWarmup />
          <Routes>
            <Route path="/" element={<LoginPage />} />
            {/* <Route path="/register" element={<RegisterPage />} /> */}
            <Route element={<RequireAuth />}>
              {/* Protected route with shared layout */}
              <Route
                path="/kennel"
                element={
                  <Layout>
                    <MyKennelPage />
                  </Layout>
                }
              />
              <Route
                path="/activities"
                element={
                  <Layout>
                    <ActivityFeed />
                  </Layout>
                }
              />
              <Route path="/weight" element={<Layout><WeightsPage />
              </Layout>} />
              <Route path="analytics" element={<Layout><AnalyticsPage />
              </Layout>} />
            </Route>
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </div>
  );
}
