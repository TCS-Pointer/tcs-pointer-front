import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Eye, Trash2, CheckCircle, AlertTriangle, Paperclip } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { comunicadoService } from '../../services/comunicadoService';
import { toast } from 'react-toastify';

export default function ComunicadoCard({ comunicado, onView, onDelete, isAdmin, onLeituraConfirmada }) {
  const { user } = useAuth();
  const [lido, setLido] = useState(comunicado?.lido);
  const [loading, setLoading] = useState(false);
  
  const setores = comunicado.categorias || comunicado.setores || [];
  const mostrarSetores = setores.slice(0, 2);
  const temMaisSetores = setores.length > 2;

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return '';
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const safeDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(safeDate.getTime())) return '';
    return safeDate.toLocaleDateString('pt-BR');
  };

  // Função para extrair a primeira URL de imagem de um HTML
  const extractFirstImageUrl = (html) => {
    if (!html || typeof html !== 'string') return null;
    // Regex para pegar links diretos de imagem
    const match = html.match(/https?:\/\/[^\s"'>]+\.(jpg|jpeg|png|gif|webp)/i);
    return match ? match[0] : null;
  };

  const handleConfirmarLeitura = async () => {
    setLoading(true);
    try {
      await comunicadoService.confirmarLeitura(comunicado.id, user?.sub);
      setLido(true);
      toast.success('Comunicado marcado como lido!');
      if (onLeituraConfirmada) onLeituraConfirmada();
    } catch (error) {
      toast.error('Erro ao marcar como lido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const descricaoHtml = comunicado.descricao || comunicado.mensagem;
  const imageUrl = extractFirstImageUrl(descricaoHtml);
  
  // Remove a URL da imagem do HTML se encontrou uma
  const descricaoSemImagem = imageUrl 
    ? descricaoHtml.replace(imageUrl, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : descricaoHtml;

  // Função para truncar texto por caracteres
  const truncateText = (text, maxChars = 150) => {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanText.length <= maxChars) return cleanText;
    return cleanText.substring(0, maxChars) + '...';
  };

  const textoOriginal = imageUrl ? descricaoSemImagem : descricaoHtml;
  const textoLimpo = textoOriginal ? textoOriginal.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const textoTruncado = truncateText(textoLimpo, 150);
  const isTruncated = textoLimpo.length > 150;

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow transition flex flex-col gap-2">
      <div className="flex justify-between items-start mb-1">
        <div className="flex gap-2 flex-wrap">
          {comunicado.apenasGestores && (
            <Badge className="bg-orange-100 text-orange-700 border-none hover:bg-orange-100">Somente gestores</Badge>
          )}
          {!comunicado.apenasGestores && (
            <Badge className="bg-green-100 text-green-700 border-none hover:bg-green-100">Comunicado geral</Badge>
          )}
          {mostrarSetores.map((cat, idx) => (
            <Badge key={cat + idx} variant="secondary">{cat}</Badge>
          ))}
          {temMaisSetores && (
            <div className="relative group">
              <Badge variant="secondary" className="cursor-pointer">
                +{setores.length - 2}
              </Badge>
              {/* Tooltip com todos os setores */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {setores.slice(2).join(', ')}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
          {imageUrl && (
            <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100 flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              Contém imagem
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1 min-w-[80px] text-right">{formatDate(comunicado.dataPublicacao)}</div>
      </div>
      <div className="font-bold text-lg leading-tight mb-1">{comunicado.titulo}</div>
      <div className="text-gray-600 text-base mb-2 break-words overflow-hidden">
        <div className="leading-relaxed">
          {textoTruncado}
        </div>
        {isTruncated && (
          <div className="text-xs text-gray-400 mt-1 italic">
            Para visualizar o conteúdo completo, clique em "Visualizar"
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className={`flex items-center gap-1 text-sm ${lido ? 'text-green-600' : 'text-yellow-600'}`}>
          {lido ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {lido ? 'Visualizado' : 'Não visualizado'}
        </span>
        <div className="flex-1" />
        <button
          className="flex items-center gap-1 text-sm text-gray-700 hover:underline"
          onClick={onView}
        >
          <Eye className="h-4 w-4" /> Visualizar
        </button>
        {isAdmin && (
          <button
            className="flex items-center gap-1 text-sm text-red-600 hover:underline ml-2"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" /> Excluir
          </button>
        )}
      </div>
    </div>
  );
}
