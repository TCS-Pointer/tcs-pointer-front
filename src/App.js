import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import EsqueceuSenha from './components/auth/EsqueceuSenha';
import VerificarCodigo from './components/auth/VerificarCodigo';
import RedefinirSenha from './components/auth/RedefinirSenha';
import PrimeiroAcesso from './components/auth/PrimeiroAcesso';
import UserDashboard from './pages/user/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import GestorDashboard from './pages/gestor/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Layout from './components/shared/Layout';
import Perfil from './pages/Perfil';
import Unauthorized from './components/Unauthorized';
import AllPDIs from './pages/admin/AllPDIs';
import MeuPDIsOverview from './pages/user/MeuPDIsOverview';
import ToastProvider from './components/ui/ToastProvider';
import Oops from './components/Oops';
import './styles/globals.css';
import ComunicadosManagement from './pages/admin/ComunicadosManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import MeuFeedback from './pages/MeuFeedback';
import Comunicados from './pages/Comunicados';

// Componente para proteger rotas
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Unauthorized />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastProvider />
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/auth/verificar-codigo" element={<VerificarCodigo />} />
          <Route path="/auth/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rotas protegidas dentro do Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Rotas de Usuário */}
            <Route index element={<UserDashboard />} />
            <Route path="feedbacks" element={<UserDashboard />} />
            <Route path="comunicados" element={<Comunicados />} />
            <Route path="meu-pdi" element={<AllPDIs />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="pdi" element={<AllPDIs />} />

            {/* Rotas de Admin */}
            <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
            <Route path="admin/comunicados" element={<ProtectedRoute role="admin"><ComunicadosManagement /></ProtectedRoute>} />
            <Route path="admin/feedbacks" element={<ProtectedRoute role="admin"><FeedbackManagement /></ProtectedRoute>} />
            <Route path="admin/relatorios" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Rotas de Gestor */}
            <Route path="gestor" element={<ProtectedRoute role="gestor"><GestorDashboard /></ProtectedRoute>} />

            {/* Rota para páginas não encontradas dentro do layout */}
            <Route path="*" element={<Oops />} />
            <Route path="/meus-feedbacks" element={<MeuFeedback />} />
          </Route>

          {/* Rota padrão - redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
