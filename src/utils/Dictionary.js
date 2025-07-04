// Dictionary.js - Mapeia valores de status para exibição
export const dictionary = {
  // Status do PDI
  EM_ANDAMENTO: "Em Andamento",
  ATIVO: "Ativo",
  CANCELADO: "Cancelado",
  ATRASADO: "Atrasado",
  CONCLUIDO: "Concluído",
  PENDENTE: "Pendente"
};

/**
 * Função para formatar data de yyyy-mm-dd para dd/mm/yyyy
 * @param {string} dateString - String de data no formato yyyy-mm-dd
 * @returns {string} - Data formatada como dd/mm/yyyy
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};