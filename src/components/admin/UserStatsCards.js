import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { Users, User, Key, Shield } from 'lucide-react';

const tipoLabels = {
  'COLABORADOR': 'Colaboradores',
  'GESTOR': 'Gestores',
  'ADMIN': 'Administradores'
};

const tipoIcons = {
  'COLABORADOR': <User className="text-green-400" />, 
  'GESTOR': <Key className="text-yellow-500" />, 
  'ADMIN': <Shield className="text-purple-400" />
};

export default function UserStatsCards({ refreshKey }) {
  const [stats, setStats] = useState([]);
  const [sum, setSum] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await userService.getTiposUsuario();
        setStats(res.stats || []);
        setSum(res.sum || 0);
      } catch (e) {
        setStats([]);
        setSum(0);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const getPercent = (total) => sum ? Math.round((total / sum) * 100) : 0;

  return (
    <div className="flex gap-4">
      <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-500 text-sm">Total de Usuários</div>
            <div className="text-3xl font-bold">{sum}</div>
            <div className="text-xs text-gray-400 mt-1">Usuários Ativos</div>
          </div>
          <div className="bg-blue-100 rounded-full p-2">
            <Users className="text-blue-400" />
          </div>
        </div>
      </div>
      {['COLABORADOR', 'GESTOR', 'ADMIN'].map(tipo => {
        const stat = stats.find(s => s.tipoUsuario === tipo) || { total: 0 };
        return (
          <div key={tipo} className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-gray-500 text-sm">{tipoLabels[tipo]}</div>
                <div className="text-3xl font-bold">{stat.total}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {getPercent(stat.total)}% do total de usuários
                </div>
              </div>
              <div className="bg-gray-100 rounded-full p-2">
                {tipoIcons[tipo]}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 