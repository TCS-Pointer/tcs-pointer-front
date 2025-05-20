import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import passwordService from '../services/password.service';

const requisitos = [
  {
    label: 'Pelo menos 8 caracteres',
    valid: senha => senha.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    valid: senha => /[A-Z]/.test(senha),
  },
  {
    label: 'Pelo menos um número',
    valid: senha => /[0-9]/.test(senha),
  },
  {
    label: 'Pelo menos um caractere especial',
    valid: senha => /[^A-Za-z0-9]/.test(senha),
  },
];

function validarSenha(senha) {
  return requisitos.every(req => req.valid(senha));
}

const Perfil = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('info');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.email) {
        setLoading(true);
        try {
          const data = await userService.getUserByEmail(user.email);
          setUserData(data);
        } catch (err) {
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [user?.email]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!novaSenha || !confirmarSenha) {
      setMsg({ type: 'error', text: 'Preencha todos os campos.' });
      return;
    }
    if (!validarSenha(novaSenha)) {
      setMsg({ type: 'error', text: 'A senha não atende aos requisitos.' });
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setMsg({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    try {
      await passwordService.resetPassword(userData.email, novaSenha);
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      setMsg({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Meu Perfil</h1>
      <p className="text-gray-500 mb-6">Visualize e gerencie suas informações pessoais</p>
      <div className="bg-gray-100 rounded mb-6 flex">
        <button
          className={`px-6 py-2 rounded-t transition-colors text-sm font-medium ${tab === 'info' ? 'bg-white text-blue-700' : 'text-gray-600'}`}
          onClick={() => setTab('info')}
        >
          Informações Pessoais
        </button>
        <button
          className={`px-6 py-2 rounded-t transition-colors text-sm font-medium ${tab === 'senha' ? 'bg-white text-blue-700' : 'text-gray-600'}`}
          onClick={() => setTab('senha')}
        >
          Alterar Senha
        </button>
      </div>
      {tab === 'info' && (
        <div className="bg-white rounded shadow p-8">
          <div className="flex items-center mb-6">
            <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow mr-8">
              {userData?.nome
                ? userData.nome
                    .split(' ')
                    .filter(Boolean)
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'U'}
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-900">{userData?.nome || 'Usuário'}</div>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                {userData?.tipoUsuario === 'ADMIN' ? 'Administrador' : userData?.tipoUsuario === 'GESTOR' ? 'Gestor' : 'Colaborador'}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Email</span>
              <span className="text-gray-600">{userData?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Departamento</span>
              <span className="text-gray-600">{userData?.setor || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Cargo</span>
              <span className="text-gray-600">{userData?.cargo || '-'}</span>
            </div>
          </div>
        </div>
      )}
      {tab === 'senha' && (
        <div className="bg-white rounded shadow p-8">
          <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <span className="font-medium text-gray-700 block mb-2">Requisitos de senha:</span>
            <ul className="list-none pl-0 space-y-1 text-sm">
              {requisitos.map((req, i) => {
                const ok = req.valid(novaSenha);
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`font-bold ${ok ? 'text-green-600' : 'text-red-600'}`}>{ok ? '✔' : '✖'}</span>
                    <span className={ok ? 'text-green-700' : 'text-red-700'}>{req.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium mb-1">Nova Senha</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
              />
            </div>
            {msg && (
              <div className={`text-sm mb-2 ${msg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{msg.text}</div>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold mt-2"
            >
              Alterar Senha
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Perfil; 