import api from './api';

export const comunicadoService = {
  // ADMIN, GESTOR, COLABORADOR
  getComunicados: async (keycloakId) => {
    const response = await api.get('/comunicados', { params: { keycloakId } });
    return response.data;
  },

  // ADMIN, GESTOR, COLABORADOR
  getComunicadosPorSetor: async (setor, keycloakId) => {
    const response = await api.get(`/comunicados/setor/${setor}`, { params: { keycloakId } });
    return response.data;
  },

  // ADMIN, GESTOR, COLABORADOR
  getComunicadoPorId: async (id, keycloakId) => {
    const response = await api.get(`/comunicados/${id}`, { params: { keycloakId } });
    return response.data;
  },
  
  // GESTOR, ADMIN
  getComunicadosGestores: async (keycloakId) => {
    const response = await api.get('/comunicados/gestores', { params: { keycloakId } });
    return response.data;
  },

  // ADMIN
  createComunicado: async (comunicadoData) => {
    const response = await api.post('/comunicados', comunicadoData);
    return response.data;
  },

  // ADMIN
  updateComunicado: async (id, comunicadoData) => {
    const response = await api.put(`/comunicados/${id}`, comunicadoData);
    return response.data;
  },

  // ADMIN
  deleteComunicado: async (id) => {
    const response = await api.delete(`/comunicados/${id}`);
    return response.data;
  },
}; 