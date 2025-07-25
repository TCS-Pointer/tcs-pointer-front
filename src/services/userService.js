import api from './api';

export const userService = {

  getUsers: async (page = 0, filters = {}) => {
    try {
      const response = await api.get('/api/usuarios', {
        params: {
          page,
          size: 10,
          ...(filters.nome && { nome: filters.nome }),
          ...(filters.status && { status: filters.status }),
          ...(filters.setor && { setor: filters.setor }),
          ...(filters.tipoUsuario && { tipoUsuario: filters.tipoUsuario })
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
  getUserByKeycloakId: async (keycloakId) => {
    const response = await api.get(`/api/usuarios/${keycloakId}`);
    return response.data.content;
  },

  // Criar um novo usuário
  createUser: async (userData) => {
    const response = await api.post('/api/usuarios', userData);
    return response.data.content;
  },

  // Atualizar um usuário
  updateUser: async (id, userData) => {
    const response = await api.put(`/api/usuarios/${id}`, userData);
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
      throw error;
    }
  },

  // Buscar tipos de usuário disponíveis
  getTiposUsuario: async () => {
    try {
      const response = await api.get('/api/usuarios/estatisticas/tipos');
      return response.data.content || [];
    } catch (error) {
      throw error;
    }
  },

  // Buscar setores e cargos da API
  getSetoresECargos: async () => {
    try {
      const response = await api.get('/api/setor-cargo');
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },

  // Solicitar redefinição de senha
  sendPasswordResetRequest: async (email) => {
    try {
      const response = await api.post('/api/usuarios/primeiro-acesso/reenviar', {
        email: email
      });
      return response.data.content;
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuários para feedback (sem paginação)
  listarUsuariosFeedback: async (keycloakId) => {
    try {
      const response = await api.post('/api/usuarios/listar-usuarios-feedback', { keycloakId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};
export async function getUsuarioByKeycloakId(keycloakId) {
  const response = await api.get(`/api/usuarios/${keycloakId}`);
  return response.data.content;
}  
