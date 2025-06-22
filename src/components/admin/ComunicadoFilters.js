import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const PUBLICO_ALVO = [
  { value: 'todos', label: 'Todos os Públicos' },
  { value: 'gestores', label: 'Apenas para Gestores' }
];

const ComunicadoFilters = ({ onFilterChange, availableSectors, disabled }) => {
  const [filters, setFilters] = useState({
    publico: 'todos',
    setor: ''
  });

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    
    if (field === 'publico' && value === 'gestores') {
      newFilters.setor = '';
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="publico" className="text-sm font-medium">Público Alvo</label>
            <select
              id="publico"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.publico}
              onChange={(e) => handleFilterChange('publico', e.target.value)}
              disabled={disabled}
            >
              {PUBLICO_ALVO.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="setor" className="text-sm font-medium">Setor</label>
            <select
              id="setor"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.setor}
              onChange={(e) => handleFilterChange('setor', e.target.value)}
              disabled={disabled || filters.publico === 'gestores'}
            >
              <option value="">Todos os Setores</option>
              {availableSectors.map(setor => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComunicadoFilters; 