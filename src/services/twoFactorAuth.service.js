import api from './api';

const twoFactorAuthService = {
  // Verifica o código 2FA enviado pelo usuário
  verify: async ({ email, code }) => {
    const response = await api.post('/api/2fa/verify', { email, code });
    return response.data;
  },


  setupTwoFactor: async ({ keycloakId }) => {
    const response = await api.post(`/api/2fa/setup/${keycloakId}`);
    return response.data;
  },

  /**
   * Verifica o status do 2FA para um usuário
   */
  getTwoFactorStatus: async ({ keycloakId }) => {
    const response = await api.get(`/api/2fa/status/${keycloakId}`);
    return response.data;
  },

  /**
   * Ativa 2FA após verificação inicial
   */
  activateTwoFactor: async ({ keycloakId, email, code }) => {
    const response = await api.post(`/api/2fa/activate/${keycloakId}`, { email, code });
    return response.data;
  },

  /**
   * Desabilita 2FA para um usuário
   */
  disableTwoFactor: async ({ keycloakId }) => {
    const response = await api.delete(`/api/2fa/disable/${keycloakId}`);
    return response.data;
  }
};

export default twoFactorAuthService; 