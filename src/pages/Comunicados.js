import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { comunicadoService } from '../services/comunicadoService';
import ComunicadoCard from '../components/shared/ComunicadoCard';
import ComunicadoDetalhesModal from '../components/shared/ComunicadoDetalhesModal';
import { Search } from 'lucide-react';

const Comunicados = () => {
  const { user } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [viewingComunicado, setViewingComunicado] = useState(null);
  const [filtroLeitura, setFiltroLeitura] = useState('todos'); // 'todos', 'nao_lidos', 'lidos'

  const loadComunicados = async (buscaValor = '') => {
    try {
      setLoading(true);
      const data = await comunicadoService.getComunicados(user.sub, buscaValor);
      const pageObj = data.content || {};
      setComunicados(Array.isArray(pageObj.content) ? pageObj.content : []);
    } catch (err) {
      setError('Erro ao carregar comunicados.');
      setComunicados([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar comunicados baseado no filtro de leitura
  const comunicadosFiltrados = comunicados.filter(comunicado => {
    if (filtroLeitura === 'nao_lidos') return !comunicado.lido;
    if (filtroLeitura === 'lidos') return comunicado.lido;
    return true; // 'todos'
  });

  const handleViewDetails = (comunicado) => {
    setViewingComunicado(comunicado);
  };

  const handleLeituraConfirmada = () => {
    loadComunicados(busca);
  };

  useEffect(() => {
    if (user?.sub) {
      loadComunicados();
    }
  }, [user]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex flex-col gap-1 mt-8 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
        <p className="text-gray-500 text-sm">Fique por dentro dos comunicados importantes da empresa</p>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex w-full">
        <input
          type="text"
          placeholder="Buscar comunicado por título ou categoria..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={busca}
          onChange={e => setBusca(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && loadComunicados(busca)}
          />
          <button
            onClick={() => loadComunicados(busca)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-md transition-colors flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Buscar
          </button>
        </div>
      </div>
      
      {/* Filtros de leitura */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setFiltroLeitura('todos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            filtroLeitura === 'todos'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroLeitura('nao_lidos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            filtroLeitura === 'nao_lidos'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Não Lidos
        </button>
        <button
          onClick={() => setFiltroLeitura('lidos')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            filtroLeitura === 'lidos'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Lidos
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : comunicadosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <svg width="80" height="80" fill="none" viewBox="0 0 80 80">
            <rect width="80" height="80" rx="16" fill="#F3F4F6"/>
            <rect x="20" y="28" width="40" height="24" rx="4" fill="#E0E7EF" stroke="#A0AEC0" strokeWidth="2"/>
            <path d="M20 28l20 16 20-16" stroke="#A0AEC0" strokeWidth="2" fill="none"/>
          </svg>
          <div className="mt-4 text-xl font-semibold text-gray-700">
            {filtroLeitura === 'nao_lidos' && 'Nenhum comunicado não lido encontrado.'}
            {filtroLeitura === 'lidos' && 'Nenhum comunicado lido encontrado.'}
            {filtroLeitura === 'todos' && 'Nenhum comunicado encontrado.'}
          </div>
          <div className="text-gray-400 text-base mt-1">
            {filtroLeitura === 'nao_lidos' && 'Parabéns! Você está em dia com os comunicados.'}
            {filtroLeitura === 'lidos' && 'Você ainda não leu nenhum comunicado.'}
            {filtroLeitura === 'todos' && 'Fique atento, novos comunicados podem aparecer aqui!'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {comunicadosFiltrados.map(comunicado => (
            <ComunicadoCard
              key={comunicado.id}
              comunicado={comunicado}
              onView={() => handleViewDetails(comunicado)}
              isAdmin={false}
              onLeituraConfirmada={handleLeituraConfirmada}
            />
          ))}
        </div>
      )}

      <ComunicadoDetalhesModal
        open={!!viewingComunicado}
        onClose={() => setViewingComunicado(null)}
        comunicado={viewingComunicado}
        onLeituraConfirmada={handleLeituraConfirmada}
      />
    </div>
  );
};

export default Comunicados;
