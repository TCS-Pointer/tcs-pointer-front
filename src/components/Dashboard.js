import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8" />
              <span className="ml-2 text-xl font-semibold">Pointer</span>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Olá, {user?.nome || 'Usuário'}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Dashboard</h1>
            <p className="text-gray-600">
              Esta é a página principal do sistema. Aqui você poderá ver todas as informações relevantes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 