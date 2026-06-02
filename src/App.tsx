import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { useReminders } from "@/hooks/useReminders";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import Habits from "@/pages/Habits";
import CalendarPage from "@/pages/CalendarPage";
import Stats from "@/pages/Stats";

function AppShell({ children }: { children: React.ReactNode }) {
  useReminders();
  return <AppLayout>{children}</AppLayout>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
              <Route path="/" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
              <Route path="/tarefas" element={<ProtectedRoute><AppShell><Tasks /></AppShell></ProtectedRoute>} />
              <Route path="/habitos" element={<ProtectedRoute><AppShell><Habits /></AppShell></ProtectedRoute>} />
              <Route path="/calendario" element={<ProtectedRoute><AppShell><CalendarPage /></AppShell></ProtectedRoute>} />
              <Route path="/estatisticas" element={<ProtectedRoute><AppShell><Stats /></AppShell></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
