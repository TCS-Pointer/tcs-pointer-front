import api from './api';

export const userService = {
  
  getUsers: async (page = 0, filters = {}) => {
    try {
      const response = await api.get('/usuarios', {
        params: {
          page,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Buscar um usuário específico
  getUserById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },
  getUserByEmail: async (email) => {
    const response = await api.get(`/usuarios/${email}`);
    return response.data;
  },

  // Criar um novo usuário
  createUser: async (userData) => {
    const response = await api.post('/usuarios', userData);
    return response.data;
  },

  // Atualizar um usuário
  updateUser: async (id, userData) => {
    const response = await api.put(`/usuarios/atualizar-usuario/${id}`, userData);
    return response.data;
  },


  updateUserStatus: async (email) => {
    const response = await api.post(`/usuarios/alterar-status`,  {email: email});
    return response.data;
  },

  verifyEmail: async (email) => {
    return await api.get(`/usuarios/verificar-email/${email}`);  
  },

};  