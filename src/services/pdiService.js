import api from './api';

const pdiService = {
    getAllPdis: async () => {
        try {
            const response = await api.get('/pdi');
            return response.data.content;
        } catch (error) {
            throw error;
        }
    },

    createPdi: async (pdiData) => {
        try {
            const response = await api.post('/pdi', pdiData);
            return response.data.content;
        } catch (error) {
            throw error;
        }
    },
    getUsersByDepartment: async (userId) => {
        try {
            const response = await api.get(`/api/usuarios/setor/${userId}`);
            if (response.data && response.data.content) {
                return response.data.content;
            }
            return [];
        } catch (error) {
            throw error;
        }
    },
    updateMarco: async (marcoId, marcoData) => {
        try {
            const response = await api.put(`/marco-pdi/${marcoId}`, marcoData);
            return response.data.content;
        } catch (error) {
            throw error;
        }
    },
    getAllPdisSimples: async () => {
        const response = await api.get('/pdi/listagem-simples');
        return response.data;
    },
    getPdiById: async (id) => {
        const response = await api.get(`/pdi/${id}`);
        return response.data.content || response.data;
    },
    getPdisByDestinatario: async (idUsuario) => {
        const response = await api.get(`/pdi/destinatario/${idUsuario}`);
        return response.data.content || response.data;
    },
};

export default pdiService; 