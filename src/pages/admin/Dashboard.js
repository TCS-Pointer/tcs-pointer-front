import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/user/StatCard';

// Componente para os comunicados recentes
const CommunicationItem = ({ title, date, author }) => (
  <div className="border-b border-gray-100 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-gray-100 p-2 rounded-full">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{title}</p>
          <p className="text-xs text-gray-500">Visualizado por {author}</p>
        </div>
      </div>
      <span className="text-xs text-gray-500">{date}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.nome || 'Administrador'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Bem-vindo ao seu dashboard administrativo. Aqui você pode gerenciar usuários e acompanhar o desenvolvimento da equipe.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Usuários"
          value="0"
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
        />
        <StatCard
          title="Feedbacks Enviados"
          value="0"
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>}
        />
        <StatCard
          title="PDIs Ativos"
          value="0"
          color="yellow"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>}
        />
        <StatCard
          title="Média de Progresso"
          value="0%"
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedbacks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Feedbacks Enviados</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            {/* Lista de feedbacks será preenchida com dados reais */}
          </div>
        </div>

        {/* PDIs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">PDIs em Andamento</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {/* Lista de PDIs será preenchida com dados reais */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 