import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import twoFactorAuthService from '../../services/twoFactorAuth.service';

export default function TwoFactorAuth({ onSuccess, onBack, email }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await twoFactorAuthService.verify({ email, code });
      toast.success(response?.message || 'Código 2FA válido!');
      onSuccess(response);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Código inválido ou erro ao verificar 2FA';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Autenticação em 2 Fatores</h2>
        <p className="mb-4 text-center text-gray-600">Digite o código do seu aplicativo de autenticação</p>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Código 2FA"
          value={code}
          onChange={e => setCode(e.target.value)}
          required
        />
        {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
        <button
          type="button"
          onClick={handleBack}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
          disabled={loading}
        >
          Voltar para o login
        </button>
      </form>
    </div>
  );
} 