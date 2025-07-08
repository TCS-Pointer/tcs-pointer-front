import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import relatorioService from '../../services/relatorioService';
import { toast } from 'react-toastify';

const RelatorioCard = ({ title, description, icon, onDownload, loading }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-100 p-3 rounded-full">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    
    <button
      onClick={onDownload}
      disabled={loading}
      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Baixando...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Baixar Relatório</span>
        </>
      )}
    </button>
  </div>
);

const Relatorios = () => {
  const { user } = useAuth();
  const [loadingStates, setLoadingStates] = useState({
    usuarios: false,
    pdi: false,
    comunicados: false,
    feedback: false
  });

  const handleDownload = async (type) => {
    setLoadingStates(prev => ({ ...prev, [type]: true }));
    
    try {
      switch (type) {
        case 'usuarios':
          await relatorioService.downloadRelatorioUsuarios();
          break;
        case 'pdi':
          await relatorioService.downloadRelatorioPDI();
          break;
        case 'comunicados':
          await relatorioService.downloadRelatorioComunicados();
          break;
        case 'feedback':
          await relatorioService.downloadRelatorioFeedback();
          break;
        default:
          break;
      }
    } catch (error) {
      // Aqui você pode adicionar uma notificação de erro se desejar
    } finally {
      setLoadingStates(prev => ({ ...prev, [type]: false }));
    }
  };

  const relatorios = [
    {
      type: 'usuarios',
      title: 'Relatório de Usuários',
      description: 'Lista completa de todos os usuários cadastrados no sistema com suas informações básicas.',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      type: 'pdi',
      title: 'Relatório de PDIs',
      description: 'Relatório detalhado de todos os Planos de Desenvolvimento Individual (PDIs) criados.',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      type: 'comunicados',
      title: 'Relatório de Comunicados',
      description: 'Relatório de todos os comunicados enviados, incluindo visualizações e engajamento.',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      type: 'feedback',
      title: 'Relatório de Feedback',
      description: 'Relatório completo de todos os feedbacks enviados pelos usuários do sistema.',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Relatórios
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Gere e baixe relatórios detalhados sobre usuários, PDIs, comunicados e feedbacks do sistema.
        </p>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {relatorios.map((relatorio) => (
          <RelatorioCard
            key={relatorio.type}
            title={relatorio.title}
            description={relatorio.description}
            icon={relatorio.icon}
            onDownload={() => handleDownload(relatorio.type)}
            loading={loadingStates[relatorio.type]}
          />
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Informações sobre os Relatórios</h3>
            <p className="mt-1 text-sm text-blue-700">
              Todos os relatórios são gerados em formato CSV e contêm dados atualizados do sistema. 
              Os arquivos são baixados automaticamente para sua pasta de downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios; 