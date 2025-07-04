import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
const CLIENT_ID = 'pointer';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async login(username, password) {
    try {
      console.log('Tentando login com:', { username, API_URL: this.api.defaults.baseURL });
      
      const response = await this.api.post('/token', {
        username,
        password
      });

      console.log('Resposta do servidor:', response.data);

      const { access_token, refresh_token, expires_in } = response.data.content;
      
      if (!access_token) {
        console.error('Token não recebido na resposta:', response.data);
        throw new Error('Token não recebido do servidor');
      }
      
      this.setTokens(access_token, refresh_token, expires_in);
      
      const userInfo = this.decodeToken(access_token);
      console.log('Token decodificado:', userInfo); // Debug

      if (!this.validateUserRoles(userInfo)) {
        console.error('Roles inválidas para o usuário:', userInfo);
        throw new Error('Usuário não possui permissão para acessar o sistema');
      }

      return userInfo;
    } catch (error) {
      console.error('Erro detalhado no login:', error);
      throw this.handleError(error);
    }
  }

  setTokens(accessToken, refreshToken, expiresIn) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expires', Date.now() + (expiresIn * 1000));
  }

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  validateUserRoles(userInfo) {
    if (!userInfo || !userInfo.realm_access || !userInfo.realm_access.roles) {
      console.error('Token não contém roles:', userInfo);
      return false;
    }

    const validRoles = ['admin', 'colaborador', 'gestor'];
    const userRoles = userInfo.realm_access.roles;
    console.log('Roles do usuário:', userRoles); // Debug

    const hasValidRole = userRoles.some(role => validRoles.includes(role));
    if (!hasValidRole) {
      console.error('Usuário não possui roles válidas:', userRoles);
    }
    return hasValidRole;
  }

  getUserRole() {
    const token = this.getToken();
    if (!token) {
      console.log('Nenhum token encontrado');
      return null;
    }

    const userInfo = this.decodeToken(token);
    if (!userInfo || !userInfo.realm_access || !userInfo.realm_access.roles) {
      console.error('Token inválido ou sem roles:', userInfo);
      return null;
    }

    const roles = userInfo.realm_access.roles;
    console.log('Roles disponíveis:', roles); // Debug

    // Prioridade de roles: admin > gestor > colaborador
    if (roles.includes('admin')) {
      console.log('Role selecionada: admin');
      return 'admin';
    }
    if (roles.includes('gestor')) {
      console.log('Role selecionada: gestor');
      return 'gestor';
    }
    if (roles.includes('colaborador')) {
      console.log('Role selecionada: colaborador');
      return 'colaborador';
    }
    
    console.error('Nenhuma role válida encontrada');
    return null;
  }

  isTokenExpired() {
    const expiresAt = localStorage.getItem('token_expires');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires');
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const userInfo = this.decodeToken(token);
      if (!userInfo || !userInfo.realm_access || !userInfo.realm_access.roles) {
        console.error('Token inválido ou sem roles:', userInfo);
        return false;
      }

      if (this.isTokenExpired()) {
        console.log('Token expirado');
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.logout();
      return false;
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'Erro no servidor';
      if (error.response.status === 401) {
        this.logout();
      }
      return new Error(message);
    } else if (error.request) {
      return new Error('Não foi possível conectar ao servidor');
    } else {
      return new Error('Erro ao processar a requisição');
    }
  }

  async forgotPassword(email) {
    const response = await api.post('/api/usuarios/esqueceu-senha', { email });
    return response.data.content;
  }

  async verifyCode(email, code) {
    const response = await api.post('/api/usuarios/verificar-codigo', { email, code });
    return response.data.content;
  }

  async resetPassword(email, password) {
    const response = await api.post('/api/usuarios/redefinir-senha', { email, password });
    return response.data.content;
  }
}

export const authService = new AuthService(); 