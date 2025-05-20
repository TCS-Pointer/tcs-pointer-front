import React, { useState, useEffect, useCallback } from 'react';
import dados from '../../dados.json';
import { userService } from '../../services/userService';
import debounce from 'lodash/debounce';
import Toast from '../ui/Toast';


export default function UserModal({ open, onClose, onSave, mode = 'create', user = {} }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cargo: '',
    setor: '',
    tipoUsuario: 'COLABORADOR',
    status: 'ATIVO',
  });

  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [emailStatus, setEmailStatus] = useState({
    isValid: false,
    isAvailable: false,
    isChecking: false
  });

  useEffect(() => {
    if (form.setor) {
      const setorObj = dados.setores.find(s => s.setor === form.setor);
      setCargosDisponiveis(setorObj ? setorObj.cargos : []);
    } else {
      setCargosDisponiveis([]);
    }
  }, [form.setor]);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user && user.id) {
        setForm({
          nome: user.nome || '',
          email: user.email || '',
          cargo: user.cargo || '',
          setor: user.setor || '',
          tipoUsuario: user.perfil || 'COLABORADOR',
          status: user.status || 'ATIVO',
        });
      } else if (mode === 'create') {
        setForm({
          nome: '',
          email: '',
          cargo: '',
          setor: '',
          tipoUsuario: 'COLABORADOR',
          status: 'ATIVO',
        });
      }
    }
    // eslint-disable-next-line
  }, [open, mode, user?.id]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const debouncedCheckEmail = useCallback(
    debounce(async (email) => {
      if (!validateEmail(email)) {
        setEmailStatus({ isValid: false, isAvailable: false, isChecking: false });
        return;
      }

      setEmailStatus(prev => ({ ...prev, isChecking: true }));

      try {
        const response = await userService.verifyEmail(email);
        setEmailStatus({
          isValid: true,
          isAvailable: response.status === 200,
          isChecking: false
        });
      } catch (error) {
        setEmailStatus({
          isValid: true,
          isAvailable: false,
          isChecking: false
        });
      }
    }, 500),
    []
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'setor' ? { cargo: '' } : {})
    }));

    if (name === 'email') {
      debouncedCheckEmail(value);
    }
  };

  const validateForm = () => {
    const requiredFields = {
      nome: 'Nome',
      email: 'Email',
      cargo: 'Cargo',
      setor: 'Setor',
      tipoUsuario: 'Tipo de Usuário',
      status: 'Status'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field] || form[field].trim() === '') {
        setToast({
          message: `O campo ${label} é obrigatório`,
          type: 'error'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!validateForm()) {
      return;
    }

    // Verifica se o nome é composto
    const nomeComposto = form.nome.trim().includes(' ');
    if (!nomeComposto) {
      setToast({
        message: 'Por favor, insira o nome completo do usuário',
        type: 'error'
      });
      return;
    }

    // Verifica se o email é válido e disponível
    if (!emailStatus.isValid || !emailStatus.isAvailable) {
      setToast({
        message: 'Por favor, insira um email válido e não cadastrado',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.createUser(form);
      setToast({
        message: 'Usuário cadastrado com sucesso!',
        type: 'success'
      });
      
      // Aguarda 1.5s para mostrar o toast de sucesso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fecha o modal e chama o callback
      onClose();
      onSave(form);
    } catch (error) {
      setToast({
        message: 'Erro ao cadastrar usuário. Por favor, tente novamente.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
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
          <h2 className="text-2xl font-bold text-center mb-1">
            {mode === 'edit' ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
          </h2>
          <p className="text-gray-500 text-center text-sm">
            {mode === 'edit' ? 'Atualize os dados do usuário no formulário abaixo.' : 'Preencha os dados abaixo para adicionar um novo usuário ao sistema.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

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
                className={`border rounded px-3 py-2 w-full ${
                  emailStatus.isChecking ? 'border-yellow-400' :
                  emailStatus.isValid && emailStatus.isAvailable ? 'border-green-500' :
                  emailStatus.isValid && !emailStatus.isAvailable ? 'border-red-500' : ''
                }`}
                required
              />
              {emailStatus.isChecking && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                </div>
              )}
            </div>
            {emailStatus.isChecking && (
              <span className="text-yellow-500 text-xs mt-1">Verificando disponibilidade...</span>
            )}
            {emailStatus.isValid && emailStatus.isAvailable && (
              <span className="text-green-500 text-xs mt-1">✓ Email disponível</span>
            )}
            {emailStatus.isValid && !emailStatus.isAvailable && (
              <span className="text-red-500 text-xs mt-1">✗ Email já cadastrado</span>
            )}
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
            >
              <option value="">Selecione um setor</option>
              {dados.setores.map((s) => (
                <option key={s.setor} value={s.setor}>{s.setor}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border rounded px-3 py-2"
              required
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          {mode === 'create' && (
            <div className="col-span-2 mt-2">
              <p className="text-sm text-gray-500 italic">* A senha será enviada automaticamente para o e-mail cadastrado</p>
            </div>
          )}
        </form>
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
                {mode === 'create' ? 'Cadastrando...' : 'Salvando...'}
              </span>
            ) : (
              mode === 'create' ? 'Cadastrar' : 'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 