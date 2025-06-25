import api from './api';

const pdiService = {
    getAllPdis: async () => {
        try {
            const response = await api.get('/pdi');
            return response.data.content;
        } catch (error) {
            console.error('Erro ao buscar todos os PDIs:', error);
            throw error;
        }
    },

    createPdi: async (pdiData) => {
        try {
            const response = await api.post('/pdi', pdiData);
            return response.data.content;
        } catch (error) {
            console.error('Erro ao criar PDI:', error);
            throw error;
        }
    },
    getUsersByDepartment: async (userId) => {
        try {
            console.log(`pdiService: Iniciando busca de usuários do setor para ID: ${userId}`);
            const response = await api.get(`/api/usuarios/setor/${userId}`);
            console.log(`pdiService: Resposta da API para usuários do setor (ID ${userId}):`, response.data);
            if (response.data && response.data.content) {
                console.log(`pdiService: Total de usuários encontrados no setor: ${response.data.content.length}`);
                return response.data.content;
            }
            console.warn('pdiService: Resposta da API não contém a estrutura esperada:', response.data);
            return [];
        } catch (error) {
            console.error(`pdiService: Erro ao buscar usuários do setor (ID ${userId}):`, error);
            throw error;
        }
    },
    updateMarco: async (marcoId, marcoData) => {
        try {
            const response = await api.put(`/marco-pdi/${marcoId}`, marcoData);
            return response.data.content;
        } catch (error) {
            console.error(`Erro ao atualizar marco ID ${marcoId}:`, error);
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