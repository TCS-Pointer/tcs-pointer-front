import api from './api';

const pdiService = {
    getAllPdis: async () => {
        try {
            // Assumindo que a rota para listar todos os PDIs para Admin/Gestor é '/pdi'
            const response = await api.get('/pdi');
            return response.data.content; // Retorna apenas a lista de PDIs
        } catch (error) {
            console.error('Erro ao buscar todos os PDIs:', error);
            throw error; // Rejeita a promessa para que o componente possa tratar o erro
        }
    },

    createPdi: async (pdiData) => {
        try {
            // Assumindo que a rota para criar um PDI é '/pdi'
            const response = await api.post('/pdi', pdiData);
            return response.data.content; // Retorna o PDI criado
        } catch (error) {
            console.error('Erro ao criar PDI:', error);
            throw error; // Rejeita a promessa para que o componente possa tratar o erro
        }
    },

    // Função atualizada para buscar usuários por ID do usuário
    getUsersByDepartment: async (userId) => {
        try {
            console.log(`pdiService: Iniciando busca de usuários do setor para ID: ${userId}`);
            const response = await api.get(`/api/usuarios/setor/${userId}`);
            console.log(`pdiService: Resposta da API para usuários do setor (ID ${userId}):`, response.data);
            
            // Verifica se a resposta tem a estrutura esperada
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
            return response.data.content; // Assumindo que a API retorna o marco atualizado dentro de 'content'
        } catch (error) {
            console.error(`Erro ao atualizar marco ID ${marcoId}:`, error);
            throw error; // Rejeita a promessa para que o componente possa tratar o erro
        }
    },

    // Futuramente, podemos adicionar outras funções aqui, como getPdiById, updatePdi, deletePdi, etc.
};

export default pdiService; 