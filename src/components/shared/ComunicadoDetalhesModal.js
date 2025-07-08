import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { comunicadoService } from '../../services/comunicadoService';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return 'Data inválida';
  const [datePart] = dateString.split(' ');
  const [day, month, year] = datePart.split('/');
  const safeDate = new Date(`${year}-${month}-${day}`);
  return isNaN(safeDate.getTime()) ? 'Data inválida' : safeDate.toLocaleDateString('pt-BR');
};

export default function ComunicadoDetalhesModal({ open, onClose, comunicado, onLeituraConfirmada }) {
  const { user } = useAuth();
  const [lido, setLido] = useState(comunicado?.lido);
  const [loading, setLoading] = useState(false);

  // Atualizar estado lido quando comunicado mudar
  React.useEffect(() => {
    setLido(comunicado?.lido);
  }, [comunicado?.lido]);

  if (!open || !comunicado) return null;

  const handleConfirmarLeitura = async () => {
    setLoading(true);
    try {
      await comunicadoService.confirmarLeitura(comunicado.id, user?.sub.toString());
      setLido(true);
      toast.success('Comunicado marcado como visualizado!');
      if (onLeituraConfirmada) onLeituraConfirmada();
      onClose();
    } catch (error) {
      toast.error('Erro ao marcar como visualizado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Extrair primeira imagem do HTML, se houver
  const extractFirstImageUrl = (html) => {
    if (!html || typeof html !== 'string') return null;
    const match = html.match(/https?:\/\/[^\s"'>]+\.(jpg|jpeg|png|gif|webp)/i);
    return match ? match[0] : null;
  };
  
  const descricaoHtml = comunicado.descricao || comunicado.mensagem;
  const imageUrl = extractFirstImageUrl(descricaoHtml);
  
  // Remove a URL da imagem do HTML se encontrou uma
  const descricaoSemImagem = imageUrl 
    ? descricaoHtml.replace(imageUrl, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : descricaoHtml;

  // Cálculo de visualizações
  const quantidadeLeitores = comunicado.quantidadeLeitores ?? 0;
  const totalDestinatarios = comunicado.totalDestinatarios ?? 0;
  const percentual = totalDestinatarios > 0 ? Math.round((quantidadeLeitores / totalDestinatarios) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-down">
        {/* Header fixo */}
        <div className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          <div className="flex justify-between items-start mb-2">
            <div>
              <Badge className={comunicado.apenasGestores ? 'bg-orange-100 text-orange-700 border-none hover:bg-orange-100' : 'bg-green-100 text-green-700 border-none hover:bg-green-100'}>
                {comunicado.apenasGestores ? 'Somente gestores' : 'Comunicado geral'}
              </Badge>
            </div>
            <div className="text-xs text-gray-400 min-w-[80px] text-right">{formatDate(comunicado.dataPublicacao)}</div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900 break-words overflow-wrap-anywhere pr-8">{comunicado.titulo}</h2>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="mb-6 break-words overflow-wrap-anywhere">
            {imageUrl && (
              <div className="flex justify-center mb-4">
                <img src={imageUrl} alt="Imagem do comunicado" className="max-h-48 max-w-full rounded border" style={{objectFit: 'contain'}} />
              </div>
            )}
            {descricaoSemImagem && (
              <div className="text-gray-700 text-base leading-relaxed break-words overflow-wrap-anywhere" dangerouslySetInnerHTML={{ __html: imageUrl ? descricaoSemImagem : descricaoHtml }} />
            )}
          </div>
          
          <div className="border-t pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="font-medium">Setores:</span>
              <div className="flex flex-wrap gap-1">
                {comunicado.setores?.length > 0
                  ? comunicado.setores.map(setor => <Badge key={setor} variant="secondary">{setor}</Badge>)
                  : <Badge variant="secondary">Todos os setores</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer fixo */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              {user?.role === 'admin' ? (
                <span>
                  <Eye className="h-4 w-4 inline mr-1" /> Visualizações: {quantidadeLeitores}
                  {totalDestinatarios > 0 && (
                    <>/{totalDestinatarios} ({percentual}%)</>
                  )}
                </span>
              ) : lido ? (
                <span className="text-green-600 font-medium">Você já visualizou esse comunicado</span>
              ) : null}
            </div>
            <div className="flex gap-2 justify-end">
              {!lido && (
                <Button
                  type="button"
                  onClick={handleConfirmarLeitura}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {loading ? 'Salvando...' : 'Marcar como visualizado'}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 