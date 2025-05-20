import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && !user.roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/auth/verificar-codigo" element={<VerificarCodigo />} />
          <Route path="/auth/redefinir-senha" element={<RedefinirSenha />} />
          
          {/* Rotas protegidas dentro do Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Rotas de Usuário */}
            <Route path="/" element={<UserDashboard />} />
            
            {/* Rotas de Admin */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Rotas de Gestor */}
            <Route path="/gestor" element={
              <ProtectedRoute role="gestor">
                <GestorDashboard />
              </ProtectedRoute>
            } />
            {/* Perfil do usuário */}
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Rota padrão - redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
