import React, { useState, useEffect, useRef } from "react";
import { useAuth } from '../contexts/AuthContext';
import FeedbackService from "../services/FeedbackService";
import FeedbackCard from "../components/shared/FeedbackCard";
import NovoFeedbackModal from "../components/shared/NovoFeedbackModal";

const TABS = [
  { key: "recebidos", label: "Feedbacks Recebidos" },
  { key: "enviados", label: "Feedbacks Enviados" },
];

export default function MeuFeedback() {
  const { user } = useAuth();
  const keycloakId = user?.sub;

  const [activeTab, setActiveTab] = useState("recebidos");
  const [feedbacks, setFeedbacks] = useState([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const debounceTimeout = useRef(null);
  const [showNovoFeedback, setShowNovoFeedback] = useState(false);

  // Busca feedbacks conforme aba, página e busca
  const fetchFeedbacks = async (page = 0, keyword = "") => {
    if (!keycloakId) return;
    setLoading(true);
    try {
      let response;
      if (activeTab === "recebidos") {
        response = await FeedbackService.getFeedbackRecebidosByUserId(keycloakId, page, keyword);
      } else {
        response = await FeedbackService.getFeedbackEnviadosByUserId(keycloakId, page, keyword);
      }
      const data = response.content || {};
      const feedbackList = data.content || [];
      setFeedbacks(feedbackList);
      setTotalFeedbacks(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      setFeedbacks([]);
      setTotalFeedbacks(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para busca
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(0);
    }, 1000);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchKeyword]);

  // Buscar feedbacks quando aba, página ou busca mudarem
  useEffect(() => {
    fetchFeedbacks(currentPage, debouncedKeyword);
    // eslint-disable-next-line
  }, [activeTab, currentPage, debouncedKeyword, keycloakId]);

  const handlePageChange = (newPage) => setCurrentPage(newPage);

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
              {startPage > 1 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === page
                  ? "text-white bg-blue-600 border border-blue-600"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page + 1}
            </button>
          ))}
          {endPage < totalPages - 1 && (
            <>
              {endPage < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <NovoFeedbackModal 
        open={showNovoFeedback} 
        onClose={() => setShowNovoFeedback(false)} 
        onSubmit={() => {
          setShowNovoFeedback(false);
          fetchFeedbacks(0, debouncedKeyword);
        }}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Feedbacks</h1>
          <p className="text-gray-500">Visualize e gerencie seus feedbacks recebidos e enviados</p>
        </div>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition"
          onClick={() => setShowNovoFeedback(true)}
        >
          + Novo Feedback
        </button>
      </div>

      {/* Busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Buscar feedback..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </form>

      {/* Abas */}
      <div className="flex mb-4 bg-gray-100 rounded-lg overflow-hidden">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(0);
              setSearchKeyword("");
              setDebouncedKeyword("");
            }}
            className={`flex-1 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de feedbacks */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">Carregando feedbacks...</span>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg">Nenhum feedback encontrado.</p>
            <p className="text-gray-400 text-sm">Envie um feedback para alguém!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.map((fb) => (
              <FeedbackCard key={fb.idFeedback} feedback={fb} />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {!loading && feedbacks.length > 0 && totalPages > 1 && (
        <div className="pt-6">{renderPagination()}</div>
      )}
    </div>
  );
} 