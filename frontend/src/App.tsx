import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CreateBetPage from './pages/CreateBetPage';
import TrustmanResponsePage from './pages/TrustmanResponsePage';

// Custom theme for AlcoBet
const theme = createTheme({
  colors: {
    brand: [
      '#e8f2ff',
      '#b3d9ff',
      '#7cc0ff',
      '#46a7ff',
      '#0f8eff',
      '#2563eb', // Primary blue
      '#1d4ed8',
      '#1e40af',
      '#1e3a8a',
      '#1e3a8a',
    ],
  },
  primaryColor: 'brand',
  primaryShade: 5,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications />
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-bet"
                  element={
                    <ProtectedRoute>
                      <CreateBetPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/trustman/response/:token" element={<TrustmanResponsePage />} />
                {/* Catch all route - redirect to home */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;