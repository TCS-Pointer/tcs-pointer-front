import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import debounce from 'lodash/debounce';
import { toast } from 'react-toastify';

export default function UserCreateModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cargo: '',
    setor: '',
    tipoUsuario: 'COLABORADOR',
    status: 'ATIVO',
  });

  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSetores, setIsLoadingSetores] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    isValid: false,
    isAvailable: false,
    isChecking: false
  });
  const [errors, setErrors] = useState({});

  // Carregar setores e cargos da API
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
    if (open) {
      setForm({
        nome: '',
        email: '',
        cargo: '',
        setor: '',
        tipoUsuario: 'COLABORADOR',
        status: 'ATIVO',
      });
      setCargosDisponiveis([]);
      setEmailStatus({ isValid: false, isAvailable: false, isChecking: false });
      setErrors({});
    }
  }, [open]);

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
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nome.trim()) {
      newErrors.nome = 'O campo Nome Completo é obrigatório.';
    } else if (form.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Por favor, insira o nome completo (nome e sobrenome).';
    }

    if (!form.email.trim()) {
      newErrors.email = 'O campo E-mail é obrigatório.';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'O formato do e-mail é inválido.';
    } else if (!emailStatus.isAvailable) {
      newErrors.email = 'Este e-mail já está cadastrado ou é inválido.';
    }

    if (!form.setor) newErrors.setor = 'É obrigatório selecionar um setor.';
    if (!form.cargo) newErrors.cargo = 'É obrigatório selecionar um cargo.';
    if (!form.tipoUsuario) newErrors.tipoUsuario = 'É obrigatório selecionar um tipo de usuário.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await userService.createUser(form);
      await new Promise(resolve => setTimeout(resolve, 100)); 
      onClose();
      onSave(form);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar usuário. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
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
          <h2 className="text-2xl font-bold text-center mb-1">Adicionar Novo Usuário</h2>
          <p className="text-gray-500 text-center text-sm">Preencha os dados abaixo para adicionar um novo usuário ao sistema.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className={`border rounded px-3 py-2 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.nome && <span className="text-red-500 text-xs mt-1">{errors.nome}</span>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Cargo <span className="text-red-500">*</span>
            </label>
            <select
              name="cargo"
              value={form.cargo}
              onChange={handleChange}
              className={`border rounded px-3 py-2 ${errors.cargo ? 'border-red-500' : 'border-gray-300'}`}
              disabled={!form.setor}
            >
              <option value="">Selecione um cargo</option>
              {cargosDisponiveis.map((cargo) => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
            {errors.cargo && <span className="text-red-500 text-xs mt-1">{errors.cargo}</span>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full ${
                  errors.email ? 'border-red-500' :
                  emailStatus.isChecking ? 'border-yellow-400' :
                  emailStatus.isValid && emailStatus.isAvailable ? 'border-green-500' :
                  emailStatus.isValid && !emailStatus.isAvailable ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {emailStatus.isChecking && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                </div>
              )}
            </div>
            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
            {!errors.email && emailStatus.isChecking && (
              <span className="text-yellow-500 text-xs mt-1">Verificando disponibilidade...</span>
            )}
            {!errors.email && emailStatus.isValid && emailStatus.isAvailable && (
              <span className="text-green-500 text-xs mt-1">✓ Email disponível</span>
            )}
            {!errors.email && emailStatus.isValid && !emailStatus.isAvailable && form.email && (
              <span className="text-red-500 text-xs mt-1">✗ Email já cadastrado</span>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Tipo de Usuário <span className="text-red-500">*</span>
            </label>
            <select
              name="tipoUsuario"
              value={form.tipoUsuario}
              onChange={handleChange}
              className={`border rounded px-3 py-2 ${errors.tipoUsuario ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="COLABORADOR">Colaborador</option>
              <option value="GESTOR">Gestor</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.tipoUsuario && <span className="text-red-500 text-xs mt-1">{errors.tipoUsuario}</span>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Setor <span className="text-red-500">*</span>
            </label>
            <select
              name="setor"
              value={form.setor}
              onChange={handleChange}
              className={`border rounded px-3 py-2 ${errors.setor ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isLoadingSetores}
            >
              <option value="">
                {isLoadingSetores ? 'Carregando setores...' : 'Selecione um setor'}
              </option>
              {setoresDisponiveis.map((s) => (
                <option key={s.setor} value={s.setor}>{s.setor}</option>
              ))}
            </select>
            {errors.setor && <span className="text-red-500 text-xs mt-1">{errors.setor}</span>}
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
          <div className="col-span-2 mt-2">
            <p className="text-sm text-gray-500 italic">* A senha será enviada automaticamente para o e-mail cadastrado</p>
          </div>
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
            disabled={isLoading || emailStatus.isChecking}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cadastrando...
              </span>
            ) : (
              'Cadastrar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 