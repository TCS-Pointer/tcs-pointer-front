import React, { useState, useEffect } from 'react';
import { comunicadoService } from '../../services/comunicadoService';
import { userService } from '../../services/userService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'react-toastify';

export default function ComunicadoModal({ open, onClose, onSave, comunicado }) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    setores: [],
    apenasGestores: false,
  });
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = comunicado !== null;

  useEffect(() => {
    // Carregar setores disponíveis
    const loadSetores = async () => {
      try {
        const response = await userService.getSetores();
        setSetoresDisponiveis(response || []);
      } catch (error) {
        toast.error('Erro ao carregar setores.');
      }
    };

    if (open) {
      loadSetores();
      if (isEditing) {
        setForm({
          titulo: comunicado.titulo || '',
          descricao: comunicado.descricao || '',
          setores: comunicado.setores || [],
          apenasGestores: comunicado.apenasGestores || false,
        });
      } else {
        // Resetar form para criação
        setForm({
          titulo: '',
          descricao: '',
          setores: [],
          apenasGestores: false,
        });
      }
      setErrors({});
    }
  }, [open, comunicado, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSetorChange = (setor) => {
    setForm((prev) => {
      const newSetores = prev.setores.includes(setor)
        ? prev.setores.filter((s) => s !== setor)
        : [...prev.setores, setor];
      return { ...prev, setores: newSetores };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = 'O título é obrigatório.';
    if (!form.descricao.trim()) newErrors.descricao = 'A descrição é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }
    setIsLoading(true);
    try {
      if (isEditing) {
        await comunicadoService.updateComunicado(comunicado.id, form);
        toast.success('Comunicado atualizado com sucesso!');
      } else {
        await comunicadoService.createComunicado(form);
        toast.success('Comunicado criado com sucesso!');
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar comunicado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Comunicado' : 'Criar Novo Comunicado'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input name="titulo" value={form.titulo} onChange={handleChange} />
            {errors.titulo && <span className="text-red-500 text-xs">{errors.titulo}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <Textarea name="descricao" value={form.descricao} onChange={handleChange} rows={5} />
            {errors.descricao && <span className="text-red-500 text-xs">{errors.descricao}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Setores de Destino</label>
            <p className="text-xs text-gray-500 mb-2">Se nenhum setor for selecionado, o comunicado será enviado para todos.</p>
            <div className="grid grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
              {setoresDisponiveis.map(setor => (
                <label key={setor} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.setores.includes(setor)}
                    onChange={() => handleSetorChange(setor)}
                  />
                  <span>{setor}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" name="apenasGestores" checked={form.apenasGestores} onChange={handleChange} id="apenasGestores" />
            <label htmlFor="apenasGestores" className="text-sm font-medium">Enviar apenas para Gestores</label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 