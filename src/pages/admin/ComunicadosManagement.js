import React, { useState, useEffect } from 'react';
import { comunicadoService } from '../../services/comunicadoService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PlusCircle, Edit, Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import ComunicadoModal from '../../components/admin/ComunicadoModal';
import ComunicadoDetalhesModal from '../../components/shared/ComunicadoDetalhesModal';
import { Tooltip } from 'react-tooltip';
import PopoverSetores from '../../components/ui/PopoverSetores';
import ComunicadoCard from '../../components/shared/ComunicadoCard';

const ComunicadosManagement = () => {
  const { user } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState(null);
  const [viewingComunicado, setViewingComunicado] = useState(null);
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(5);
  const [totalComunicados, setTotalComunicados] = useState(0);
  const [filtroLeitura, setFiltroLeitura] = useState('todos'); // 'todos', 'nao_lidos', 'lidos'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [comunicadoToDelete, setComunicadoToDelete] = useState(null);

  const loadComunicados = async (buscaValor = '', page = 0) => {
    try {
      setLoading(true);
      if (page === 0) {
        setCurrentPage(0);
      }
      const data = await comunicadoService.getComunicados(user.sub, buscaValor, page, pageSize);
      const pageObj = data.content || {};
      setComunicados(Array.isArray(pageObj.content) ? pageObj.content : []);
      setTotalPages(pageObj.totalPages || 0);
      setTotalComunicados(pageObj.totalElements || 0);
    } catch (err) {
      setError('Erro ao carregar comunicados.');
      toast.error('Erro ao carregar comunicados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.sub) {
      loadComunicados('', 0);
    }
  }, [user]);

  const handleDelete = async (id) => {
    const comunicado = comunicados.find(c => c.id === id);
    setComunicadoToDelete(comunicado);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!comunicadoToDelete) return;
    
    try {
      await comunicadoService.deleteComunicado(comunicadoToDelete.id);
      toast.success('Comunicado excluído com sucesso!');
      loadComunicados(busca, currentPage);
    } catch (err) {
      toast.error('Erro ao excluir comunicado.');
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setComunicadoToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setComunicadoToDelete(null);
  };

  const handleCreate = () => {
    setEditingComunicado(null);
    setShowModal(true);
  };

  const handleEdit = (comunicado) => {
    setEditingComunicado(comunicado);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComunicado(null);
  };

  const handleSave = () => {
    handleCloseModal();
    loadComunicados();
  };

  const handleViewDetails = (comunicado) => {
    setViewingComunicado(comunicado);
  };

  const handleLeituraConfirmada = () => {
    loadComunicados(busca, currentPage);
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'Data inválida';
    }
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const safeDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(safeDate.getTime())) {
      return 'Data inválida';
    }
    return safeDate.toLocaleDateString('pt-BR');
  };

  // Filtrar comunicados baseado no filtro de leitura (igual ao Comunicados.js)
  const comunicadosFiltrados = comunicados.filter(comunicado => {
    if (filtroLeitura === 'nao_lidos') return !comunicado.lido;
    if (filtroLeitura === 'lidos') return comunicado.lido;
    return true; // 'todos'
  });

  // Paginação igual ao FeedbackManagement
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

    // Calcular o total exibido na página
    const startIdx = currentPage * pageSize + 1;
    const endIdx = Math.min((currentPage + 1) * pageSize, totalComunicados);

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Mostrando {endIdx - startIdx + 1} de {totalComunicados} comunicados
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              loadComunicados(busca, newPage);
            }}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {startPage > 0 && (
            <>
              <button
                onClick={() => {
                  setCurrentPage(0);
                  loadComunicados(busca, 0);
                }}
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
              onClick={() => {
                setCurrentPage(page);
                loadComunicados(busca, page);
              }}
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
                onClick={() => {
                  setCurrentPage(totalPages - 1);
                  loadComunicados(busca, totalPages - 1);
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => {
              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              loadComunicados(busca, newPage);
            }}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>
          <p className="text-gray-500 text-sm">Fique por dentro dos comunicados importantes da empresa</p>
        </div>
        <Button onClick={handleCreate} className="self-end">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Comunicado
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex w-full">
          <input
            type="text"
            placeholder="Buscar comunicado por título ou categoria..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && loadComunicados(busca, 0)}
          />
          <button
            onClick={() => loadComunicados(busca, 0)}
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
        <div className="text-center py-8">
          {filtroLeitura === 'nao_lidos' && 'Nenhum comunicado não lido encontrado.'}
          {filtroLeitura === 'lidos' && 'Nenhum comunicado lido encontrado.'}
          {filtroLeitura === 'todos' && 'Nenhum comunicado encontrado.'}
        </div>
      ) : (
        <>
        <div className="space-y-4">
          {comunicadosFiltrados.map(comunicado => (
            <ComunicadoCard
              key={comunicado.id}
              comunicado={comunicado}
              onView={() => handleViewDetails(comunicado)}
              onDelete={() => handleDelete(comunicado.id)}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
        {/* Paginação */}
        {comunicados.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            {renderPagination()}
          </div>
        )}
        </>
      )}

      <ComunicadoModal
        open={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        comunicado={editingComunicado}
      />

      <ComunicadoDetalhesModal
        open={!!viewingComunicado}
        onClose={() => setViewingComunicado(null)}
        comunicado={viewingComunicado}
        onLeituraConfirmada={handleLeituraConfirmada}
      />

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-fade-in-down">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Excluir Comunicado
            </h3>
            <p className="text-sm text-gray-500 text-center mb-2">
              Tem certeza que deseja excluir este comunicado?
            </p>
            {comunicadoToDelete && (
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {comunicadoToDelete.titulo}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelDelete}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComunicadosManagement; 