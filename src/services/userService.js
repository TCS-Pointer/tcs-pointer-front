import api from './api';

export const userService = {
  
  getUsers: async (page = 0, filters = {}) => {
    try {
      const response = await api.get('/api/usuarios', {
        params: {
          page,
          size: 10,
          ...filters
        }
      });
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },


  // Buscar um usuário específico
  getUserById: async (id) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data.content;
  },
  getUserByKeycloakId: async (keycloaky) => {
    const response = await api.get(`/api/usuarios/${keycloaky}`);
    return response.data.content;
  },

  // Criar um novo usuário
  createUser: async (userData) => {
    console.log(userData);
    const response = await api.post('/api/usuarios', userData);
    return response.data.content;
  },

  // Atualizar um usuário
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/usuarios/atualizar-usuario/${id}`, userData);
    return response.data.content;
  },


  updateUserStatus: async (emailChangeStatus, emailSend) => {
    const response = await api.put(`/api/usuarios/alterar-status`,  {
      emailChangeStatus: emailChangeStatus,
      emailSend: emailSend
    });
    return response.data.content;
  },

  verifyEmail: async (email) => {
    return await api.get(`/api/usuarios/verificar-email/${email}`);  
  },

  // Buscar setores disponíveis
  getSetores: async () => {
    try {
      const response = await api.get('/api/usuarios/setores');
      return response.data.content;
    } catch (error) {
      console.error('Erro na API getSetores:', error);
      throw error;
    }
  },

  // Buscar tipos de usuário disponíveis
  getTiposUsuario: async () => {
    try {
      const response = await api.get('/api/usuarios/estatisticas/tipos');
      return response.data.content || [];
    } catch (error) {
      console.error('Erro na API getTiposUsuario:', error);
      throw error;
    }
  },

};  