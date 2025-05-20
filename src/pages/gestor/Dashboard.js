import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/user/StatCard';

const GestorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {user?.nome || 'Gestor'}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Bem-vindo ao seu dashboard. Aqui você pode acompanhar o desenvolvimento da sua equipe e gerenciar feedbacks.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Membros da Equipe"
          value="0"
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
        />
        <StatCard
          title="Feedbacks Pendentes"
          value="0"
          color="yellow"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>}
        />
        <StatCard
          title="PDIs em Andamento"
          value="0"
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>}
        />
        <StatCard
          title="Média de Desempenho"
          value="0%"
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>}
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membros da Equipe */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Membros da Equipe</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Ver todos
            </button>
          </div>
          <div className="space-y-4">
            {/* Lista de membros será preenchida com dados reais */}
          </div>
        </div>

        {/* PDIs da Equipe */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">PDIs da Equipe</h2>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Ver todos
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

export default GestorDashboard; 