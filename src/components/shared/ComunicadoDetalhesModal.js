import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return 'Data inválida';
  const [datePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const safeDate = new Date(`${year}-${month}-${day}`);
  return isNaN(safeDate.getTime()) ? 'Data inválida' : safeDate.toLocaleDateString('pt-BR');
};

export default function ComunicadoDetalhesModal({ open, onClose, comunicado }) {
  if (!open || !comunicado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{comunicado.titulo}</h2>
        
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <span>Publicado em: {formatDate(comunicado.dataPublicacao)}</span>
        </div>

        <div className="space-y-4 mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{comunicado.descricao}</p>
        </div>

        <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Detalhes</h3>
            <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center">
                    <span className="font-medium w-24">Público:</span>
                    {comunicado.apenasGestores ? (
                        <Badge variant="outline">Apenas Gestores</Badge>
                    ) : (
                        <Badge variant="outline">Todos</Badge>
                    )}
                </div>
                <div className="flex items-start">
                    <span className="font-medium w-24 mt-1">Setores:</span>
                    <div className="flex flex-wrap gap-1">
                        {comunicado.setores?.length > 0
                        ? comunicado.setores.map(setor => <Badge key={setor} variant="secondary">{setor}</Badge>)
                        : <Badge variant="secondary">Todos os setores</Badge>}
                    </div>
                </div>
            </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </div>
    </div>
  );
} 