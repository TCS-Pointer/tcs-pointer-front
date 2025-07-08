import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeAuth = () => {
    try {
      if (authService.isAuthenticated()) {
        const userInfo = authService.decodeToken(authService.getToken());
        const userRole = authService.getUserRole();
        
        if (userInfo && userRole) {
          setUser({ ...userInfo, role: userRole });
        } else {
          authService.logout();
          setUser(null);
        }
      }
    } catch (err) {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const userInfo = await authService.login(username, password);
      const userRole = authService.getUserRole();
      
      if (!userRole) {
        throw new Error('Usuário não possui permissão para acessar o sistema');
      }
      
      setUser({ ...userInfo, role: userRole });
      return { userInfo, role: userRole };
    } catch (err) {
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    getUserRole: authService.getUserRole,
    initializeAuth
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 