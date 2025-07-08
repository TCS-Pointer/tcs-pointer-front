import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const STATUS = [
  { value: '', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' }
];

const UserFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    nome: '',
    tipoUsuario: '',
    setor: '',
    status: ''
  });
  const [setores, setSetores] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);

  const loadFilterOptions = async () => {
    try {
      const [setoresResponse, tiposResponse] = await Promise.all([
        userService.getSetores(),
        userService.getTiposUsuario()
      ]);
      
      // Verificar se a resposta tem a estrutura esperada
      if (!setoresResponse || !Array.isArray(setoresResponse)) {
        setSetores([]);
      } else {
        setSetores(setoresResponse);
      }
      
      // Verificar se a resposta tem a estrutura esperada
      if (!tiposResponse?.stats || !Array.isArray(tiposResponse.stats)) {
        setTiposUsuario([]);
      } else {
        const tipos = tiposResponse.stats.map(item => item.tipoUsuario);
        setTiposUsuario(tipos);
      }
      
    } catch (err) {
      toast.error('Erro ao carregar opções dos filtros');
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Campo de busca por nome */}
          <div className="flex flex-col gap-2">
            <label htmlFor="nome" className="text-sm font-medium">Buscar por Nome</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="nome"
                type="text"
                placeholder="Digite o nome..."
                className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.nome}
                onChange={(e) => handleFilterChange('nome', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="tipoUsuario" className="text-sm font-medium">Tipo de Usuário</label>
            <select
              id="tipoUsuario"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filters.tipoUsuario}
              onChange={(e) => handleFilterChange('tipoUsuario', e.target.value)}
            >
              <option value="">Todos</option>
              {tiposUsuario.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo === 'ADMIN' ? 'Administrador' : 
                   tipo === 'GESTOR' ? 'Gestor' : 'Colaborador'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="setor" className="text-sm font-medium">Setor</label>
            <select
              id="setor"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filters.setor}
              onChange={(e) => handleFilterChange('setor', e.target.value)}
            >
              <option value="">Todos</option>
              {setores.map(setor => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {STATUS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserFilters; 