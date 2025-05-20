import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import passwordService from '../../services/password.service';
import pointerIcon from '../../components/ico/image.png';
const schema = z.object({
  code: z.string().min(1, 'O código é obrigatório'),
});

const VerificarCodigo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [resending, setResending] = useState(false);

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const onSubmit = async ({ code }) => {
    setLoading(true);
    setError(null);
    try {
      await passwordService.verifyCode(email, code);
      navigate('/auth/redefinir-senha', { state: { email } });
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Código inválido');
      } else {
        setError('Ocorreu um erro ao verificar o código. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await passwordService.forgotPassword(email);
      setResendTimer(60);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email não encontrado');
      } else {
        setError('Ocorreu um erro ao reenviar o código. Tente novamente.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center items-center mb-8">
          <img src={pointerIcon} alt="Pointer Icon" className="h-12 mr-2" />
          <h1 className="text-2xl font-bold text-blue-900">Pointer</h1>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Verificação de Código</h1>
        <p className="text-center text-gray-600 mb-6">
          Digite o código de verificação enviado para <br />
          <span className="font-medium">{email}</span>
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Verificação</label>
            <input
              type="text"
              {...register('code')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite o código recebido"
              disabled={loading}
            />
            {errors.code && <span className="text-red-500 text-sm">{errors.code.message}</span>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar Código'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || resending}
            className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            {resendTimer > 0 ? `Reenviar código (${resendTimer}s)` : 'Reenviar código'}
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate('/auth/esqueceu-senha')}
            className="text-sm text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
          >
            ← Voltar para recuperação de senha
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">© 2025 Pointer. Todos os direitos reservados.</div>
      </div>
    </div>
  );
};

export default VerificarCodigo; 