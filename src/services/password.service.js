import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api/usuarios';

const passwordService = {
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_URL}/api/usuarios/esqueceu-senha`, { email });
    return response.data;
  },

  verifyCode: async (email, codigo) => {
    const response = await axios.post(`${API_URL}/api/usuarios/verificar-codigo`, { email, codigo });
    return response.data;
  },

  resetPassword: async (email, senha) => {
    const response = await axios.post(`${API_URL}/api/usuarios/redefinir-senha`, { email, senha });
    return response.data;
  },

  primeiroAcesso: async (token, novaSenha) => {
    const response = await axios.post(`${API_URL}/api/usuarios/primeiro-acesso`, { token, novaSenha });
    return response.data;
  }
};

export default passwordService; 