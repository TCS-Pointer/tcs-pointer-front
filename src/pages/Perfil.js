import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import passwordService from '../services/password.service';
import twoFactorAuthService from '../services/twoFactorAuth.service';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
  // 2FA
  const [twoFAStatus, setTwoFAStatus] = useState(null);
  const [loading2FA, setLoading2FA] = useState(false);
  const [setup2FA, setSetup2FA] = useState(null); // { qrCodeUrl, secretKey }
  const [code2FA, setCode2FA] = useState('');
  const [msg2FA, setMsg2FA] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.sub) {
        setLoading(true);
        try {
          const data = await userService.getUserByKeycloakId(user.sub);
          setUserData(data);
        } catch (err) {
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUser();
  }, [user?.sub]);

  // Buscar status do 2FA
  useEffect(() => {
    async function fetch2FA() {
      if (user?.sub) {
        setLoading2FA(true);
        try {
          const res = await twoFactorAuthService.getTwoFactorStatus({ keycloakId: user.sub });
          setTwoFAStatus(res.content);
        } catch (e) {
          setTwoFAStatus(null);
        } finally {
          setLoading2FA(false);
        }
      }
    }
    if (tab === '2fa') fetch2FA();
  }, [tab, user?.sub]);

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
      await passwordService.resetPassword(userData?.email, novaSenha);
      setMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      setMsg({ type: 'error', text: 'Erro ao alterar senha. Tente novamente.' });
    }
  };

  // Iniciar setup
  const handleSetup2FA = async () => {
    setMsg2FA(null);
    setSetup2FA(null);
    setCode2FA('');
    setLoading2FA(true);
    try {
      const res = await twoFactorAuthService.setupTwoFactor({ keycloakId: user.sub });
      setSetup2FA(res.content);
    } catch (e) {
      setMsg2FA({ type: 'error', text: 'Erro ao iniciar configuração do 2FA.' });
    } finally {
      setLoading2FA(false);
    }
  };

  // Ativar 2FA
  const handleActivate2FA = async (e) => {
    e.preventDefault();
    setMsg2FA(null);
    setLoading2FA(true);
    try {
      await twoFactorAuthService.activateTwoFactor({ keycloakId: user.sub, email: userData?.email, code: parseInt(code2FA, 10) });
      setMsg2FA({ type: 'success', text: '2FA ativado com sucesso!' });
      setSetup2FA(null);
      setCode2FA('');
      const res = await twoFactorAuthService.getTwoFactorStatus({ keycloakId: user.sub });
      setTwoFAStatus(res.content);
    } catch (e) {
      setMsg2FA({ type: 'error', text: 'Erro ao ativar 2FA. Verifique o código.' });
    } finally {
      setLoading2FA(false);
    }
  };

  // Desabilitar 2FA
  const handleDisable2FA = async () => {
    setMsg2FA(null);
    setLoading2FA(true);
    try {
      await twoFactorAuthService.disableTwoFactor({ keycloakId: user.sub });
      setMsg2FA({ type: 'success', text: '2FA desabilitado com sucesso!' });
      // Atualiza status
      const res = await twoFactorAuthService.getTwoFactorStatus({ keycloakId: user.sub });
      setTwoFAStatus(res.content);
    } catch (e) {
      setMsg2FA({ type: 'error', text: 'Erro ao desabilitar 2FA.' });
    } finally {
      setLoading2FA(false);
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
        <button
          className={`px-6 py-2 rounded-t transition-colors text-sm font-medium ${tab === '2fa' ? 'bg-white text-blue-700' : 'text-gray-600'}`}
          onClick={() => setTab('2fa')}
        >
          Segurança 2FA
        </button>
        <button
          className={`px-6 py-2 rounded-t transition-colors text-sm font-medium ${tab === 'privacidade' ? 'bg-white text-blue-700' : 'text-gray-600'}`}
          onClick={() => setTab('privacidade')}
        >
          Política de Privacidade
        </button>
      </div>
      {tab === 'info' && userData && (
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
              <span className="font-medium text-gray-700">Setor</span>
              <span className="text-gray-600">{userData?.setor || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Cargo</span>
              <span className="text-gray-600">{userData?.cargo || '-'}</span>
            </div>
          </div>
        </div>
      )}
      {tab === 'senha' && userData && (
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 pr-10"
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 pr-10"
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
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
      {tab === '2fa' && (
        <div className="bg-white rounded shadow p-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="inline-block"><DevicePhoneMobileIcon className="w-7 h-7 text-blue-500 inline-block mr-1" /></span>
            Autenticação de Dois Fatores (2FA)
          </h2>
          <p className="text-gray-500 mb-6">Adicione uma camada extra de segurança à sua conta</p>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 mb-6 border">
            <span className="bg-gray-200 rounded-full p-2"><DevicePhoneMobileIcon className="w-6 h-6 text-gray-500" /></span>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Aplicativo Autenticador</div>
              <div className="text-xs text-gray-500">Use Google Authenticator ou similar</div>
              {twoFAStatus && twoFAStatus.twoFactorEnabled && (
                <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4 text-green-500" /> Ativo - Sua conta está protegida</div>
              )}
            </div>
            {/* Switch estilizado */}
            <button
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none border ${twoFAStatus && twoFAStatus.twoFactorEnabled ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-300'}`}
              onClick={twoFAStatus && twoFAStatus.twoFactorEnabled ? handleDisable2FA : (!setup2FA ? handleSetup2FA : undefined)}
              disabled={loading2FA}
              aria-checked={twoFAStatus && twoFAStatus.twoFactorEnabled}
              role="switch"
              tabIndex={0}
            >
              <span
                className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${twoFAStatus && twoFAStatus.twoFactorEnabled ? 'translate-x-5' : ''}`}
              ></span>
            </button>
          </div>
          {/* Setup/Ativo */}
          {loading2FA ? (
            <div className="flex justify-center items-center h-32">Carregando...</div>
          ) : twoFAStatus && !twoFAStatus.twoFactorEnabled && (setup2FA || twoFAStatus.twoFactorConfigured) && (
            <div className="bg-gray-50 border rounded-lg p-6 max-w-md mx-auto mb-2">
              <div className="font-semibold mb-2 flex items-center justify-between">
                <span>Configure seu aplicativo autenticador</span>
                <button
                  type="button"
                  className="text-xs text-blue-600 underline ml-2"
                  onClick={handleSetup2FA}
                  disabled={loading2FA}
                  title="Gerar novo QR Code"
                >
                  Gerar novo QR Code
                </button>
              </div>
              <ol className="text-sm text-gray-700 mb-4 list-decimal list-inside space-y-1">
                <li>Escaneie o QR Code com seu app</li>
                <li className="ml-2 text-xs text-gray-500">Ou insira manualmente: <span className="bg-gray-200 px-2 py-0.5 rounded font-mono select-all">{(setup2FA && setup2FA.secretKey) || ''}</span></li>
                <li>Digite o código de 6 dígitos</li>
              </ol>
              <div className="flex flex-col items-center mb-4">
                <img src={(setup2FA && setup2FA.qrCodeUrl) || ''} alt="QR Code 2FA" className="mb-2 w-32 h-32 border bg-white rounded" />
              </div>
              <form onSubmit={handleActivate2FA} className="flex gap-2 items-end">
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-32 text-center font-mono"
                  placeholder="000000"
                  value={code2FA}
                  onChange={e => setCode2FA(e.target.value)}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                  disabled={loading2FA}
                >
                  Verificar
                </button>
              </form>
              {msg2FA && <div className={`text-sm mt-2 ${msg2FA.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{msg2FA.text}</div>}
            </div>
          )}
          {msg2FA && (!setup2FA || (twoFAStatus && twoFAStatus.twoFactorEnabled)) && (
            <div className={`text-sm mt-2 ${msg2FA.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{msg2FA.text}</div>
          )}
        </div>
      )}
      {tab === 'privacidade' && (
        <div className="bg-white rounded shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Política de Privacidade - Pointer</h2>
          
          <div className="space-y-6 text-sm leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Quais dados coletamos e para quais finalidades?</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">1.1. Dados fornecidos pelo titular</h4>
                  <p className="text-gray-700 mb-2">Coletamos informações que você nos fornece diretamente, como:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Informações profissionais (cargo, setor)</li>
                    <li>Dados de autenticação (senhas, códigos 2FA)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">1.2. Dados coletados automaticamente</h4>
                  <p className="text-gray-700 mb-2">Durante o uso da plataforma, coletamos:</p>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Dados de uso da plataforma (PDIs, feedbacks, comunicados)</li>
                    <li>Informações de sessão e navegação</li>
                    <li>Dados de dispositivo e localização</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Como coletamos seus dados?</h3>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 mb-2">2.1. Consentimento</h4>
                <p className="text-gray-700">Coletamos dados com seu consentimento explícito, especialmente para funcionalidades opcionais como autenticação de dois fatores.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Quais são os seus direitos?</h3>
              <p className="text-gray-700 mb-3">Como titular dos dados, você possui os seguintes direitos:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li><strong>Confirmação:</strong> Solicitar confirmação da existência de tratamento</li>
                <li><strong>Acesso:</strong> Acessar seus dados pessoais</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li><strong>Anonimização:</strong> Solicitar anonimização de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Receber dados em formato estruturado</li>
                <li><strong>Eliminação:</strong> Solicitar exclusão de dados</li>
                <li><strong>Informação:</strong> Ser informado sobre compartilhamento de dados</li>
                <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Como exercer seus direitos?</h3>
              <p className="text-gray-700 mb-3">Para exercer seus direitos, entre em contato conosco através de:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>E-mail: dpo@pointer.com.br</li>
                <li>Formulário de contato na plataforma</li>
                <li>Telefone: (11) 99999-9999</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Prazo e forma de armazenamento</h3>
              <p className="text-gray-700 mb-3">Seus dados são armazenados de forma segura e mantidos pelo tempo necessário para:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Cumprimento das finalidades para as quais foram coletados</li>
                <li>Atendimento a obrigações legais</li>
                <li>Exercício de direitos em processos judiciais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Medidas de segurança</h3>
              <p className="text-gray-700 mb-3">Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
              <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                <li>Criptografia de dados sensíveis</li>
                <li>Controle de acesso rigoroso</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backup regular dos dados</li>
                <li>Treinamento da equipe em proteção de dados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Compartilhamento de dados</h3>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 mb-2">7.1. Transferência internacional</h4>
                <p className="text-gray-700">Seus dados podem ser transferidos para países que ofereçam grau de proteção adequado, conforme legislação brasileira.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies e tecnologias similares</h3>
              <p className="text-gray-700">Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma, sempre com seu consentimento.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Alterações desta política</h3>
              <p className="text-gray-700">Esta política pode ser atualizada periodicamente. Notificaremos sobre mudanças significativas através da plataforma ou e-mail.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Responsabilidade</h3>
              <p className="text-gray-700">A Pointer é responsável pelo tratamento de seus dados pessoais e está comprometida em proteger sua privacidade.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">11. Encarregado pelo tratamento de dados (DPO)</h3>
              <p className="text-gray-700 mb-3">Para questões relacionadas à proteção de dados, entre em contato com nosso DPO:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>E-mail:</strong> dpo@pointer.com.br</p>
                <p className="text-gray-700"><strong>Telefone:</strong> (11) 99999-9999</p>
                <p className="text-gray-700"><strong>Endereço:</strong> Rua Example, 123 - São Paulo/SP</p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800 text-sm">
                <strong>Última atualização:</strong> Janeiro de 2024<br/>
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </div>
          </div>
        </div>
      )}
      {!loading && !userData && (
        <div className="bg-white rounded shadow p-8 text-center text-red-600 font-semibold">
          Não foi possível carregar os dados do usuário.
        </div>
      )}
    </div>
  );
};

export default Perfil; 