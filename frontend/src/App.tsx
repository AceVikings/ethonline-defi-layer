import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AppPage from './pages/AppPage';
import AuthCallback from './pages/AuthCallback';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/app" element={<AppPage />} />
          <Route path="/workflow/new" element={<WorkflowBuilderPage />} />
          <Route path="/workflow/:id" element={<WorkflowBuilderPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
