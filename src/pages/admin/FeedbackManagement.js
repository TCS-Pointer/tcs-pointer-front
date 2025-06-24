import React, { useEffect, useState, useRef } from 'react';
import FeedbackService from '../../services/FeedbackService';
import FeedbackCard from '../../components/shared/FeedbackCard';
import { ThumbsUp, MessageCircle, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white rounded-xl shadow flex flex-row items-center justify-between p-6 min-w-[220px]">
    <div>
      <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
    <div className={`rounded-full p-3 flex items-center justify-center bg-gray-100 ${color}`}>
      {icon}
    </div>
  </div>
);

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [positiveFeedbacks, setPositiveFeedbacks] = useState(0);
  const [construtivoFeedbacks, setConstrutivoFeedbacks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const debounceTimeout = useRef(null);

  // Buscar estatísticas de feedbacks
  const fetchStats = async () => {
    try {
      const statsResponse = await FeedbackService.getFeedbackStats();
      const stats = statsResponse.content?.stats || [];
      const totalGeral = statsResponse.content?.totalGeral || 0;
      setTotalFeedbacks(totalGeral);
      setPositiveFeedbacks(stats.find(s => s.tipoFeedback === 'POSITIVO')?.total || 0);
      setConstrutivoFeedbacks(stats.find(s => s.tipoFeedback === 'CONSTRUTIVO')?.total || 0);
    } catch (error) {
      setTotalFeedbacks(0);
      setPositiveFeedbacks(0);
      setConstrutivoFeedbacks(0);
    }
  };

  const fetchFeedbacks = async (page = 0, keyword = '') => {
    setLoading(true);
    try {
      const response = await FeedbackService.getAllFeedbacks(page, keyword);
      const data = response.content || {};
      const feedbackList = data.content || [];
      setFeedbacks(feedbackList);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      setFeedbacks([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para searchKeyword
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(0); // Sempre volta para a primeira página ao buscar
    }, 1000);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchKeyword]);

  // Buscar feedbacks e stats quando currentPage ou debouncedKeyword mudarem
  useEffect(() => {
    fetchFeedbacks(currentPage, debouncedKeyword);
  }, [currentPage, debouncedKeyword]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setDebouncedKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Mostrando {feedbacks.length} de {totalFeedbacks} feedbacks
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {startPage > 0 && (
            <>
              <button
                onClick={() => handlePageChange(0)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 1 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page + 1}
            </button>
          ))}

          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </div>
    );
  };

  // Calcular percentuais
  const percentPositivo = totalFeedbacks > 0 ? Math.round((positiveFeedbacks / totalFeedbacks) * 100) : 0;
  const percentConstrutivo = totalFeedbacks > 0 ? Math.round((construtivoFeedbacks / totalFeedbacks) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Todos os Feedbacks</h1>
        <p className="text-gray-600">Visualize e gerencie todos os feedbacks da organização.</p>
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar feedbacks..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Cards de resumo estilizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total de Feedbacks"
          value={totalFeedbacks}
          subtitle="Feedbacks cadastrados"
          icon={<MessageCircle className="w-7 h-7 text-blue-400" />}
          color=""
        />
        <StatCard
          title="Feedbacks Positivos"
          value={positiveFeedbacks}
          subtitle={`${percentPositivo}% do total de feedbacks`}
          icon={<ThumbsUp className="w-7 h-7 text-green-500" />}
          color=""
        />
        <StatCard
          title="Feedbacks Construtivos"
          value={construtivoFeedbacks}
          subtitle={`${percentConstrutivo}% do total de feedbacks`}
          icon={<AlertTriangle className="w-7 h-7 text-yellow-500" />}
          color=""
        />
      </div>

      {/* Lista de feedbacks */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Feedbacks</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Carregando feedbacks...</span>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">Nenhum feedback encontrado.</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {feedbacks.map(fb => (
                <FeedbackCard key={fb.id} feedback={fb} autor={fb.autor} destinatario={fb.destinatario} />
              ))}
            </div>
          )}
        </div>

        {/* Paginação */}
        {!loading && feedbacks.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackManagement;
