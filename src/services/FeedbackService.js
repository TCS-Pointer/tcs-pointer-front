import api from './api';

const FeedbackService = {
    getAllFeedbacks: async (page, keyword) => {
        const response = await api.get(`/api/feedback/all?page=${page}&keyword=${keyword}`);
        return response.data;
    },

    createFeedback: async (feedbackData) => {
        const response = await api.post('/api/feedback/novo', feedbackData);
        return response.data;
    },

    getFeedbackEnviadosByUserId: async (keycloakId, page, keyword) => {
        const response = await api.get(`/api/feedback/enviados?keycloakId=${keycloakId}&page=${page}&keyword=${keyword}`);
        return response.data;
    },

    getFeedbackRecebidosByUserId: async (keycloakId, page, keyword) => {
        const response = await api.get(`/api/feedback/recebidos?keycloakId=${keycloakId}&page=${page}&keyword=${keyword}`);
        return response.data;
    },

    getFeedbackStats: async () => {
        const response = await api.get('/api/feedback/stats');
        return response.data;
    }
}

export default FeedbackService;