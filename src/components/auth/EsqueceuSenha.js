import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import passwordService from '../../services/password.service';
import pointerIcon from '../../components/ico/image.png';
const schema = z.object({
  email: z.string().min(1, 'O email é obrigatório').email('Digite um email válido'),
});

const EsqueceuSenha = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async ({ email }) => {
    setLoading(true);
    setError(null);
    try {
      await passwordService.forgotPassword(email);
      navigate('/auth/verificar-codigo', { state: { email } });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email não encontrado');
      } else {
        setError('Ocorreu um erro ao enviar o código. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center items-center mb-8">
          <img src={pointerIcon} alt="Pointer Icon" className="h-12 mr-2" />
          <h1 className="text-2xl font-bold text-blue-900">Pointer</h1>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Recuperação de Senha</h1>
        <p className="text-center text-gray-600 mb-6">Informe seu email para receber um código de recuperação</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="seu.email@empresa.com"
              disabled={loading}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Código'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
          >
            ← Voltar para o login
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">© 2025 Pointer. Todos os direitos reservados.</div>
      </div>
    </div>
  );
};

export default EsqueceuSenha; 