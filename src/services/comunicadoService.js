import api from './api';

export const comunicadoService = {

  createComunicado: async (comunicadoData) => {
    const response = await api.post('/comunicados', comunicadoData);
    return response.data;
  },

  getComunicados: async (keycloakId, titulo, page, size) => {
    const response = await api.get('/comunicados', { params: { keycloakId, titulo, page, size } });
    return response.data;
  },

  deleteComunicado: async (id) => {
    const response = await api.delete(`/comunicados/${id}`);
    return response.data;
  },

  confirmarLeitura: async (id, keycloakId) => {
    const response = await api.post(`/comunicados/confirmar-leitura`, { 
      comunicadoId: parseInt(id), 
      keycloakId: keycloakId.toString() 
    });
    return response.data;
  }
}; 