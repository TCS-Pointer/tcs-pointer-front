import api from './api';

export const userService = {

  getUsers: async (page = 0, filters = {}) => {
    try {
      const response = await api.get('/api/usuarios', {
        params: {
          page,
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
    const response = await api.get(`/api/usuarios/id/${id}`);
    return response.data.content;
  },
  getUserByEmail: async (email) => {
    const response = await api.get(`/api/usuarios/${email}`);
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


  updateUserStatus: async (email) => {
    const response = await api.post(`/api/usuarios/alterar-status`, { email: email });
    return response.data.content;
  },

  verifyEmail: async (email) => {
    return await api.get(`/api/usuarios/verificar-email/${email}`);
  },

};

export async function getUsuarioByKeycloakId(keycloakId) {
  const response = await api.get(`/api/usuarios/keycloak/${keycloakId}`);
  console.log('Resposta da API do ID do usuário:', response.data);
  return response.data.content; // ajuste conforme a resposta da sua API
}  