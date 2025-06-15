import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import EsqueceuSenha from './components/auth/EsqueceuSenha';
import VerificarCodigo from './components/auth/VerificarCodigo';
import RedefinirSenha from './components/auth/RedefinirSenha';
import UserDashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import GestorDashboard from './pages/gestor/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Layout from './components/shared/Layout';
import Perfil from './pages/Perfil';
import './styles/globals.css';

// Componente para proteger rotas
const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
    <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/auth/verificar-codigo" element={<VerificarCodigo />} />
          <Route path="/auth/redefinir-senha" element={<RedefinirSenha />} />
          
          {/* Rotas protegidas com Layout como pai */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<UserDashboard />} />
            <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/usuarios" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
            <Route path="gestor" element={<ProtectedRoute role="gestor"><GestorDashboard /></ProtectedRoute>} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </Router>
  );
}

export default App;
