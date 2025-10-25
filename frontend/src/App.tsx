import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomToaster } from "./lib/toast";
import { NotificationProvider, TransactionPopupProvider } from "@blockscout/app-sdk";
import LandingPage from "./pages/LandingPage";
import AppPage from "./pages/AppPage";
import AuthCallback from "./pages/AuthCallback";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TransactionPopupProvider>
          <BrowserRouter>
            <CustomToaster />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/workflow/:id" element={<WorkflowBuilderPage />} />
            </Routes>
          </BrowserRouter>
        </TransactionPopupProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
