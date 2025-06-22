import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

export default function UserEditModal({ open, onClose, onSave, user }) {
  const { user: loggedUser } = useAuth();
  const [form, setForm] = useState({
    nome: '',
    email: '',
    tipoUsuario: 'COLABORADOR',
    setor: '',
    cargo: '',
  });

  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [isLoadingSetores, setIsLoadingSetores] = useState(false);

  useEffect(() => {
    const loadSetoresECargos = async () => {
      setIsLoadingSetores(true);
      try {
        const data = await userService.getSetoresECargos();
        setSetoresDisponiveis(data.setores || []);
      } catch (error) {
        console.error('Erro ao carregar setores e cargos:', error);
        toast.error('Erro ao carregar setores e cargos. Tente novamente.');
      } finally {
        setIsLoadingSetores(false);
      }
    };

    if (open) {
      loadSetoresECargos();
    }
  }, [open]);

  useEffect(() => {
    if (form.setor) {
      const setorObj = setoresDisponiveis.find(s => s.setor === form.setor);
      setCargosDisponiveis(setorObj ? setorObj.cargos : []);
    } else {
      setCargosDisponiveis([]);
    }
  }, [form.setor, setoresDisponiveis]);

  useEffect(() => {
    if (open && user) {
      console.log('Dados do usuário recebidos no modal:', user);
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        tipoUsuario: user.tipoUsuario || 'COLABORADOR',
        setor: user.setor || '',
        cargo: user.cargo || '',
      });
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'setor' ? { cargo: '' } : {})
    }));
  };

  const validateForm = () => {
    const requiredFields = {
      nome: 'Nome',
      email: 'Email',
      tipoUsuario: 'Tipo de Usuário',
      setor: 'Setor',
      cargo: 'Cargo'
    };
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field] || form[field].trim() === '') {
        toast.error(`O campo ${label} é obrigatório`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const nomeComposto = form.nome.trim().includes(' ');
    if (!nomeComposto) {
      toast.error('Por favor, insira o nome completo do usuário');
      return;
    }
    
    // Verifica se o keycloakId existe
    if (!user.keycloakId) {
      toast.error('ID do usuário não encontrado. Tente novamente.');
      return;
    }
    
    setIsLoading(true);
    try {
      // Envia apenas os campos editáveis
      const dadosParaEnviar = {
        nome: form.nome,
        tipoUsuario: form.tipoUsuario,
        setor: form.setor,
        cargo: form.cargo
      };
      
      await userService.updateUser(user.keycloakId, dadosParaEnviar);
      toast.success('Usuário atualizado com sucesso!');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
      onSave(form);
    } catch (error) {
      toast.error('Erro ao atualizar usuário. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!form.email) {
      toast.error('Email do usuário não encontrado');
      return;
    }

    setIsSendingPasswordReset(true);
    try {
      await userService.sendPasswordResetRequest(form.email);
      toast.success('Solicitação de redefinição de senha enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      toast.error('Erro ao solicitar redefinição de senha. Tente novamente.');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          disabled={isLoading}
        >
          &times;
        </button>
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center mb-2">
            <span className="text-2xl font-bold text-white">
              {form.nome
                ? form.nome
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : <span className="opacity-50">?</span>
              }
            </span>
          </div>
          <h2 className="text-2xl font-bold text-center mb-1">Editar Usuário</h2>
          <p className="text-gray-500 text-center text-sm">Atualize os dados do usuário no formulário abaixo.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Nome Completo</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Cargo</label>
            <select
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
              disabled={!form.setor}
            >
              <option value="">Selecione um cargo</option>
              {cargosDisponiveis.map((cargo) => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">E-mail</label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full bg-gray-50"
                required
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Tipo de Usuário</label>
            <select
              name="tipoUsuario"
              value={form.tipoUsuario}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="GESTOR">Gestor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Setor</label>
            <select
              name="setor"
              value={form.setor}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
              disabled={isLoadingSetores}
            >
              <option value="">
                {isLoadingSetores ? 'Carregando setores...' : 'Selecione um setor'}
              </option>
              {setoresDisponiveis.map((s) => (
                <option key={s.setor} value={s.setor}>{s.setor}</option>
              ))}
            </select>
          </div>
        </form>
        
        {/* Botão de redefinição de senha */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Redefinição de Senha</h3>
              <p className="text-sm text-gray-600">Envie um email para o usuário redefinir sua senha</p>
            </div>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSendingPasswordReset || !form.email}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isSendingPasswordReset || !form.email
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {isSendingPasswordReset ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Solicitar Redefinição'
              )}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-8">
          <button
            type="button"
            className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </span>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 