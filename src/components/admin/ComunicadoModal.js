import React, { useState, useEffect } from 'react';
import { comunicadoService } from '../../services/comunicadoService';
import { userService } from '../../services/userService';
import ModerationService from "../../services/moderation.service";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-toastify';
import LexicalEditor from '../ui/LexicalEditor';
import Select from 'react-select';

export default function ComunicadoModal({ open, onClose, onSave, comunicado }) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    setores: [],
    apenasGestores: false,
  });
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = comunicado !== null;
  const MAX_DESC = 1200;

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

  // Seleção múltipla de setores
  const handleSetorChange = (setor) => {
    setForm((prev) => {
      let newSetores;
      if (setor === 'Todos') {
        // Se clicar em 'Todos', seleciona todos ou limpa todos
        newSetores = prev.setores.length === setoresDisponiveis.length ? [] : [...setoresDisponiveis];
      } else {
        newSetores = prev.setores.includes(setor)
          ? prev.setores.filter((s) => s !== setor)
          : [...prev.setores, setor];
      }
      return { ...prev, setores: newSetores };
    });
  };

  // Contador de caracteres do HTML completo
  const getDescricaoLength = () => (form.descricao || '').length;

  const validate = () => {
    const newErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = 'O título é obrigatório.';
    if (!form.descricao || form.descricao.replace(/<(.|\n)*?>/g, '').trim().length === 0) newErrors.descricao = 'O conteúdo é obrigatório.';
    if (!form.setores || form.setores.length === 0) newErrors.setores = 'Selecione pelo menos um setor.';
    if (getDescricaoLength() > MAX_DESC) newErrors.descricao = `Máximo de ${MAX_DESC} caracteres.`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    setIsModerating(true);
    try {
      // Aplicar moderação de texto
      const textoModeracao = 
        `Título: ${form.titulo}\n` +
        `Descrição: ${form.descricao}`;
      
      console.log('Iniciando moderação...', textoModeracao);
      toast.info('Validando conteúdo...', { autoClose: 2000 });
      
      const moderationResult = await ModerationService.moderarTexto(textoModeracao);
      console.log('Resultado da moderação:', moderationResult);
      
      if (moderationResult === 'OFENSIVO') {
        toast.error('O conteúdo do comunicado contém linguagem inadequada. Por favor, revise o texto.');
        return;
      }

      setIsModerating(false);
      setIsLoading(true);
      
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
      console.error('Erro completo:', error);
      if (error.message && error.message.includes('moderação')) {
        toast.error('Erro na moderação do conteúdo. Tente novamente.');
      } else {
        toast.error(error.response?.data?.message || 'Erro ao salvar comunicado.');
      }
    } finally {
      setIsModerating(false);
      setIsLoading(false);
    }
  };

  if (!open) return null;

  // Customização do react-select para mostrar só 2 badges e '+N', truncando nomes longos
  const customValueContainer = ({ children, ...props }) => {
    const values = props.getValue();
    let display = values;
    let extra = null;
    if (values.length > 2) {
      display = values.slice(0, 2);
      const extras = values.slice(2).map(v => v.label).join(', ');
      extra = (
        <span
          className="ml-1 text-xs text-gray-500 cursor-pointer"
          title={extras}
        >
          +{values.length - 2}
        </span>
      );
    }
    // Truncar nomes longos
    const truncate = (str, n = 14) => (str.length > n ? str.slice(0, n - 1) + '…' : str);
    return (
      <div className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-ellipsis w-full h-8" style={{width: 240, height: 32}}>
        {display.map((v, i) => (
          <div key={v.value} className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs max-w-[90px] overflow-hidden text-ellipsis" title={v.label}>{truncate(v.label)}</div>
        ))}
        {extra}
        {children[1]} {/* input */}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl min-w-[400px] p-8 relative animate-fade-in-down">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 col-span-1">
              <label className="block text-sm font-medium mb-1">Título <span className="text-red-500">*</span></label>
              <Input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título do comunicado" />
              {errors.titulo && <span className="text-red-500 text-xs">{errors.titulo}</span>}
            </div>
            <div className="md:col-span-3 col-span-1">
              <label className="block text-sm font-medium mb-1">Destinatários</label>
              <select
                name="apenasGestores"
                value={form.apenasGestores ? 'gestores' : 'geral'}
                onChange={e => setForm(f => ({ ...f, apenasGestores: e.target.value === 'gestores' }))}
                className="w-full border rounded px-3 py-2 min-w-[120px]"
              >
                <option value="geral">Comunicado Geral</option>
                <option value="gestores">Apenas Gestores</option>
              </select>
            </div>
            <div className="md:col-span-5 col-span-1">
              <label className="block text-sm font-medium mb-1">Setores <span className="text-red-500">*</span></label>
              <div className="w-full max-w-[300px] h-10">
                <Select
                  isMulti
                  options={setoresDisponiveis.map(s => ({ value: s, label: s }))}
                  value={form.setores.map(s => ({ value: s, label: s }))}
                  onChange={opts => setForm(prev => ({ ...prev, setores: opts.map(o => o.value) }))}
                  placeholder="Selecione os setores..."
                  classNamePrefix="react-select"
                  noOptionsMessage={() => "Nenhum setor encontrado"}
                  components={{ ValueContainer: customValueContainer }}
                  styles={{
                    control: base => ({ ...base, minHeight: 40, height: 40, width: '100%' }),
                    container: base => ({ ...base, width: '100%' }),
                    valueContainer: base => ({
                      ...base,
                      padding: '2px 8px',
                      width: 180,
                      minWidth: 0,
                      minHeight: 36,
                      height: 36,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      alignItems: 'center',
                      flexShrink: 1,
                    }),
                    indicatorsContainer: base => ({
                      ...base,
                      height: 36,
                      alignItems: 'center',
                      right: 0,
                      position: 'absolute',
                      background: 'white',
                      zIndex: 10,
                    }),
                    multiValue: base => ({ ...base, display: 'none' }),
                    menu: base => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
              {errors.setores && <span className="text-red-500 text-xs">{errors.setores}</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo do Comunicado <span className="text-red-500">*</span></label>
            <div className="bg-white border rounded-md">
              <LexicalEditor
                value={form.descricao}
                onChange={val => setForm(prev => ({ ...prev, descricao: val }))}
                placeholder="Escreva o conteúdo do comunicado."
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              {errors.descricao && <span className="text-red-500">{errors.descricao}</span>}
              <span className={getDescricaoLength() > MAX_DESC ? 'text-red-500' : 'text-gray-400'}>
                {getDescricaoLength()}/{MAX_DESC}
              </span>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading || isModerating}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || isModerating}>
              {isModerating ? 'Validando conteúdo...' : isLoading ? 'Salvando...' : isEditing ? 'Salvar' : 'Publicar Comunicado'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 