import api from './api';

class RelatorioService {
    async downloadRelatorioUsuarios() {
        try {
            const response = await api.get('/api/relatorios/usuarios', {
                responseType: 'blob'
            });
            
            // Criar um link para download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_usuarios.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    async downloadRelatorioPDI() {
        try {
            const response = await api.get('/api/relatorios/pdi', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_pdi.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    async downloadRelatorioComunicados() {
        try {
            const response = await api.get('/api/relatorios/comunicados', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_comunicados.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }

    async downloadRelatorioFeedback() {
        try {
            const response = await api.get('/api/relatorios/feedback', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'relatorio_feedback.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}

export default new RelatorioService(); 