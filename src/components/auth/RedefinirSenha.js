import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import passwordService from '../../services/password.service';
import pointerIcon from '../../components/ico/image.png';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  password: z.string().min(1, 'A senha é obrigatória').min(8, 'A senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const requisitos = [
  {
    label: 'Pelo menos 8 caracteres',
    test: senha => senha.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: senha => /[A-Z]/.test(senha),
  },
  {
    label: 'Pelo menos um número',
    test: senha => /\d/.test(senha),
  },
  {
    label: 'Pelo menos um caractere especial',
    test: senha => /[^A-Za-z0-9]/.test(senha),
  },
];

const RedefinirSenha = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await passwordService.resetPassword(email, password);
      toast.success('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('Senha inválida');
      } else {
        toast.error('Ocorreu um erro ao redefinir a senha. Tente novamente.');
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
        <h1 className="text-2xl font-bold text-center mb-2">Redefinir Senha</h1>
        <p className="text-center text-gray-600 mb-6">
          Digite sua nova senha para a conta <br />
          <span className="font-medium">{email}</span>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-gray-50 rounded-md p-4 mb-2">
            <span className="font-semibold">Requisitos de senha:</span>
            <ul className="mt-2 space-y-1">
              {requisitos.map((req, idx) => {
                const ok = req.test(senha);
                return (
                  <li key={idx} className={`flex items-center gap-2 text-sm ${ok ? 'text-green-600' : 'text-red-500'}`}>
                    {ok ? '✔️' : '❌'} {req.label}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Digite sua nova senha"
                disabled={loading}
                value={senha}
                onChange={e => {
                  setSenha(e.target.value);
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Confirme sua nova senha"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex={-1}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <span className="text-red-500 text-sm">{errors.confirmPassword.message}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
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

export default RedefinirSenha; 