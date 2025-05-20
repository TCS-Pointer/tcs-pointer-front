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
      },
      withCredentials: true
    });

    // Interceptor para adicionar token em todas as requisições
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async login(email, senha) {
    try {
      const loginData = {
        clientId: CLIENT_ID,
        username: email,
        password: senha,
        grantType: 'password'
      };

      const response = await this.api.post('/token', loginData);
      const token = response.data.access_token;
      localStorage.setItem('token', token);

      return this.decodeToken(token);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));

      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.sub,
        email: payload.email,
        nome: payload.name,
        roles: payload.realm_access?.roles || []
      };
    } catch (error) {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  getToken() {
    return localStorage.getItem('token');
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
    const response = await api.post('/esqueceu-senha', { email });
    return response.data;
  }

  async verifyCode(email, code) {
    const response = await api.post('/auth/verify-code', { email, code });
    return response.data;
  }

  async resetPassword(email, password) {
    const response = await api.post('/auth/reset-password', { email, password });
    return response.data;
  }
}

export const authService = new AuthService(); 