import { Route, Routes } from 'react-router-dom';

// import RegisterPage from './pages/RegisterPage' the registration is disabled for now
import { RequireAuth } from '@app/auth/require-auth';
import Layout from '@shared/ui/Layout';
import ActivityFeed from '@pages/ActivityFeed';
import LoginPage from '@pages/LoginPage';
import MyKennelPage from '@pages/MyKennelPage';

import { AfterAuthWarmup } from './auth/warmup';
import { AuthProvider } from './providers/auth-provider';
import { ReactQueryProvider } from './providers/react-query';

import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
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
              {/* <Route path="/weight" element={<WeightPage />} />  */}
            </Route>
          </Routes>
        </AuthProvider>
      </ReactQueryProvider>
    </div>
  );
}
