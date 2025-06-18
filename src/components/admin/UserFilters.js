import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { userService } from '../../services/userService';
import CenteredToast from '../ui/CenteredToast';

const STATUS = [
  { value: '', label: 'Todos' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' }
];

const UserFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    tipoUsuario: '',
    setor: '',
    status: ''
  });
  const [setores, setSetores] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (msg, type = 'error') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const loadFilterOptions = async () => {
    try {
      console.log('Iniciando carregamento dos filtros...');
      const [setoresResponse, tiposResponse] = await Promise.all([
        userService.getSetores(),
        userService.getTiposUsuario()
      ]);
      
      console.log('Resposta completa dos setores:', JSON.stringify(setoresResponse, null, 2));
      console.log('Resposta completa dos tipos:', JSON.stringify(tiposResponse, null, 2));
      
      // Verificar se a resposta tem a estrutura esperada
      if (!setoresResponse || !Array.isArray(setoresResponse)) {
        console.error('Resposta dos setores inválida:', setoresResponse);
        setSetores([]);
      } else {
        setSetores(setoresResponse);
      }
      
      // Verificar se a resposta tem a estrutura esperada
      if (!tiposResponse?.stats || !Array.isArray(tiposResponse.stats)) {
        console.error('Resposta dos tipos inválida:', tiposResponse);
        setTiposUsuario([]);
      } else {
        const tipos = tiposResponse.stats.map(item => item.tipoUsuario);
        console.log('Tipos processados:', tipos);
        setTiposUsuario(tipos);
      }
      
      console.log('Setores após setState:', setoresResponse);
      console.log('Tipos após setState:', tiposResponse?.stats?.map(item => item.tipoUsuario) || []);
    } catch (err) {
      console.error('Erro detalhado ao carregar opções dos filtros:', err);
      showToast('Erro ao carregar opções dos filtros');
    }
  };

  useEffect(() => {
    console.log('Componente UserFilters montado');
    loadFilterOptions();
  }, []);

  const handleFilterChange = (field, value) => {
    console.log('Filtro alterado:', field, value);
    const newFilters = { ...filters, [field]: value };
    console.log('Novos filtros:', newFilters);
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <>
      <CenteredToast 
        open={toastOpen} 
        message={toastMsg} 
        type={toastType} 
        onClose={() => setToastOpen(false)} 
      />
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </>
  );
};

export default UserFilters; 