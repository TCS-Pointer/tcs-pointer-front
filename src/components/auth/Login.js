import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import pointerIcon from '../ico/image.png';
import { toast } from 'react-toastify';
import TwoFactorAuth from './TwoFactorAuth';
import api from '../../services/api';

const loginSchema = z.object({
  username: z.string().min(1, 'O campo de email é obrigatório').email('Digite um email válido'),
  password: z.string().min(1, 'O campo de senha é obrigatório').min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

const Login = () => {
  const { login } = useAuthNavigation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [pending2FA, setPending2FA] = useState(null); // { token, email }
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      const role = user.role;
      switch (role) {
        case 'admin':
          navigate('/admin/comunicados');
          break;
        case 'gestor':
          navigate('/');
          break;
        case 'colaborador':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      // Chama o endpoint de login customizado
      const response = await api.post('/token', {
        username: data.username,
        password: data.password
      });
      const content = response.data.content;
      // Se 2FA estiver habilitado, guarda o token em memória
      if (content.two_factor_enabled) {
        setPending2FA({ 
          access_token: content.access_token,
          refresh_token: content.refresh_token,
          token_expires: content.token_expires,
          email: data.username 
        });
      } else {
        // Salva os tokens normalmente
        localStorage.setItem('access_token', content.access_token);
        localStorage.setItem('refresh_token', content.refresh_token);
        localStorage.setItem('token_expires', content.token_expires);
        await login(data.username, data.password); // mantém navegação e contexto
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro desconhecido';
      if (errorMessage.toLowerCase().includes('credenciais inválidas') || 
          errorMessage.toLowerCase().includes('invalid credentials') ||
          errorMessage.toLowerCase().includes('email ou senha inválidos')) {
        toast.error('Email ou senha inválidos');
      } else if (errorMessage.toLowerCase().includes('inativado') || 
                 errorMessage.toLowerCase().includes('desabilitado') ||
                 errorMessage.toLowerCase().includes('bloqueado')) {
        toast.error('Usuário inativado ou com problemas de acesso. Por favor, entre em contato com o RH.');
      } else if (errorMessage.toLowerCase().includes('não foi possível conectar') ||
                 errorMessage.toLowerCase().includes('network error') ||
                 errorMessage.toLowerCase().includes('timeout')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (errorMessage.toLowerCase().includes('erro interno do servidor') ||
                 errorMessage.toLowerCase().includes('500')) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleForgotPassword = () => {
    navigate('/auth/esqueceu-senha');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Callback após sucesso no 2FA
  const handle2FASuccess = () => {
    if (pending2FA?.access_token) {
      localStorage.setItem('access_token', pending2FA.access_token);
      localStorage.setItem('refresh_token', pending2FA.refresh_token);
      localStorage.setItem('token_expires', pending2FA.token_expires);
      setPending2FA(null);
      window.location.href = '/';
    } else {
    }
  };

  const handle2FABack = () => {
    setPending2FA(null);
    navigate('/login');
  };

  if (pending2FA) {
    return <TwoFactorAuth onSuccess={handle2FASuccess} onBack={handle2FABack} email={pending2FA.email} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-center items-center mb-8">
          <img src={pointerIcon} alt="Pointer Icon" className="h-12 mr-2" />
          <h1 className="text-2xl font-bold text-blue-900">Pointer</h1>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Acesso ao Sistema</h1>
        <p className="text-gray-600 text-center mb-8">Entre com suas credenciais para acessar o painel</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('username')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Seu email"
            />
            {errors.username && (
              <span className="text-red-500 text-sm">{errors.username.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register('password')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Entrar
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-gray-600 hover:text-gray-800 underline bg-transparent border-none cursor-pointer"
          >
            Esqueceu Senha?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 