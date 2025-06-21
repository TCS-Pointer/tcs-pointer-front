/**
 * Verifica se a data final é pelo menos 1 mês após a data inicial.
 * @param {string} dtInicio - Data de início (YYYY-MM-DD)
 * @param {string} dtFim - Data de término (YYYY-MM-DD)
 * @returns {boolean}
 */
export function validarDuracaoMinima(dtInicio, dtFim) {
    if (!dtInicio || !dtFim) return false;
    const inicio = new Date(dtInicio);
    const fim = new Date(dtFim);
    const umMesDepois = new Date(inicio);
    umMesDepois.setMonth(inicio.getMonth() + 1);
    return fim >= umMesDepois;
}

/**
 * Verifica se todas as datas dos marcos estão dentro do período do PDI.
 * @param {string} dtInicio - Data de início do PDI
 * @param {string} dtFim - Data de término do PDI
 * @param {Array} marcos - Lista de marcos com campo dtFinal
 * @returns {boolean}
 */
export function validarDatasMarcos(dtInicio, dtFim, marcos) {
    if (!dtInicio || !dtFim || !Array.isArray(marcos)) return false;
    const inicio = new Date(dtInicio);
    const fim = new Date(dtFim);
    return marcos.every(marco => {
        if (!marco.dtFinal) return false;
        const dataMarco = new Date(marco.dtFinal);
        return dataMarco >= inicio && dataMarco <= fim;
    });
}

/**
 * Valida campos obrigatórios e tamanhos mínimos/máximos.
 * @param {object} pdi - Objeto do PDI
 * @returns {Array} - Lista de erros encontrados
 */
export function validarCamposObrigatorios(pdi) {
    const erros = [];
    if (!pdi.colaboradorId) erros.push('Colaborador é obrigatório.');
    if (!pdi.titulo || pdi.titulo.trim().length < 5) erros.push('Título deve ter pelo menos 5 caracteres.');
    if (!pdi.descricao || pdi.descricao.trim().length < 10) erros.push('Descrição deve ter pelo menos 10 caracteres.');
    if (!pdi.dtInicio) erros.push('Data de início é obrigatória.');
    if (!pdi.dtFim) erros.push('Data de término é obrigatória.');
    if (!Array.isArray(pdi.marcos) || pdi.marcos.length === 0) erros.push('Adicione pelo menos um marco.');
    if (Array.isArray(pdi.marcos)) {
        pdi.marcos.forEach((marco, idx) => {
            if (!marco.titulo || marco.titulo.trim().length < 3) erros.push(`Título do marco #${idx + 1} deve ter pelo menos 3 caracteres.`);
            if (!marco.descricao || marco.descricao.trim().length < 5) erros.push(`Descrição do marco #${idx + 1} deve ter pelo menos 5 caracteres.`);
            if (!marco.dtFinal) erros.push(`Data final do marco #${idx + 1} é obrigatória.`);
        });
    }
    return erros;
}

/**
 * Validação completa do PDI
 * @param {object} pdi - Objeto do PDI
 * @returns {Array} - Lista de erros encontrados
 */
export function validarPdiCompleto(pdi) {
    const erros = validarCamposObrigatorios(pdi);
    if (pdi.dtInicio && pdi.dtFim && !validarDuracaoMinima(pdi.dtInicio, pdi.dtFim)) {
        erros.push('O PDI deve ter pelo menos 1 mês de duração.');
    }
    if (pdi.dtInicio && pdi.dtFim && Array.isArray(pdi.marcos) && !validarDatasMarcos(pdi.dtInicio, pdi.dtFim, pdi.marcos)) {
        erros.push('As datas dos marcos devem estar dentro do período do PDI.');
    }
    return erros;
} 