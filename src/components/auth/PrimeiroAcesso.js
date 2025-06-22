import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import passwordService from '../../services/password.service';
import { toast } from 'react-toastify';

const PrimeiroAcesso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    novaSenha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  // Extrair token da URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      navigate('/login', { replace: true });
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  // Validação em tempo real
  useEffect(() => {
    const newErrors = {};

    // Validação da nova senha
    if (formData.novaSenha && formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (formData.confirmarSenha && formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (formData.novaSenha.length < 6) {
      newErrors.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await passwordService.primeiroAcesso(token, formData.novaSenha);
      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Erro no primeiro acesso:', error);
      let errorMessage = 'Erro ao definir nova senha';
      
      if (error.response?.status === 400) {
        errorMessage = 'Token inválido ou expirado';
      } else if (error.response?.status === 401) {
        errorMessage = 'Token expirado. Solicite um novo link';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.novaSenha.length >= 6 && 
                     formData.novaSenha === formData.confirmarSenha &&
                     formData.novaSenha && 
                     formData.confirmarSenha;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Senha definida com sucesso!
              </h2>
              <p className="text-gray-600 mb-4">
                Você será redirecionado para a página de login em alguns segundos...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Primeiro Acesso
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Defina sua nova senha para acessar o sistema
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <label htmlFor="novaSenha" className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  id="novaSenha"
                  name="novaSenha"
                  type={showPassword ? "text" : "password"}
                  value={formData.novaSenha}
                  onChange={handleInputChange}
                  placeholder="Digite sua nova senha"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md pr-10 ${
                    errors.novaSenha ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.novaSenha && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.novaSenha}
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  placeholder="Confirme sua nova senha"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md pr-10 ${
                    errors.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmarSenha && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            {/* Botão de Submit */}
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                !isFormValid || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500'
              }`}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Definindo senha...
                </>
              ) : (
                'Definir Senha'
              )}
            </button>

            {/* Link para voltar ao login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                disabled={loading}
              >
                Voltar para o login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimeiroAcesso; 