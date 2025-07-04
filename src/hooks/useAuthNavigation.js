import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { login: authLogin, logout: authLogout } = useAuth();

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'gestor':
        navigate('/comunicados');
        break;
      case 'colaborador':
        navigate('/comunicados');
        break;
      default:
        navigate('/login');
    }
  };

  const login = async (username, password) => {
    try {
      const { role } = await authLogin(username, password);
      redirectBasedOnRole(role);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  return {
    login,
    logout,
    redirectBasedOnRole
  };
}; 