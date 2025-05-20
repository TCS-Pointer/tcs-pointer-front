import React, { useState, useEffect, useCallback } from 'react';
import dados from '../../dados.json';
import { userService } from '../../services/userService';
import debounce from 'lodash/debounce';
import Toast from '../ui/Toast';

export default function UserEditModal({ open, onClose, onSave, user }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cargo: '',
    setor: '',
    tipoUsuario: 'COLABORADOR',
    status: 'ATIVO',
  });

  const [cargosDisponiveis, setCargosDisponiveis] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (form.setor) {
      const setorObj = dados.setores.find(s => s.setor === form.setor);
      setCargosDisponiveis(setorObj ? setorObj.cargos : []);
    } else {
      setCargosDisponiveis([]);
    }
  }, [form.setor]);

  useEffect(() => {
    if (open && user) {
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        cargo: user.cargo || '',
        setor: user.setor || '',
        tipoUsuario: user.tipoUsuario || 'COLABORADOR',
        status: user.status || 'ATIVO',
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
    if (!validateForm()) return;
    const nomeComposto = form.nome.trim().includes(' ');
    if (!nomeComposto) {
      setToast({ message: 'Por favor, insira o nome completo do usuário', type: 'error' });
      return;
    }
    setIsLoading(true);
    try {
      await userService.updateUser(user.id, form);
      setToast({ message: 'Usuário atualizado com sucesso!', type: 'success' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
      onSave(form);
    } catch (error) {
      setToast({ message: 'Erro ao atualizar usuário. Por favor, tente novamente.', type: 'error' });
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
                className={`border rounded px-3 py-2 w-full bg-gray-50`}
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