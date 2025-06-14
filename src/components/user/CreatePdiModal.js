import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import pdiService from '../../services/pdiService';
import { useAuth } from '../../contexts/AuthContext'; // Importando o contexto de autenticação
import { jwtDecode } from 'jwt-decode';
import { getUsuarioByKeycloakId } from "../../services/userService";
import { formatDate } from '../../utils/Dictionary';

const CreatePdiModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth(); // Obtendo o usuário atual do contexto
    const [step, setStep] = useState('basicInfo'); // 'basicInfo' or 'milestones'
    const [formData, setFormData] = useState({
        colaboradorId: undefined,
        titulo: '',
        descricao: '',
        dataInicio: '',
        dataFim: '',
        marcos: [], // Adicionado array para marcos
    });
    const [currentMarco, setCurrentMarco] = useState({ // Estado para o marco sendo adicionado
        titulo: '',
        descricao: '',
        dtFinal: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marcoError, setMarcoError] = useState(null); // Erro específico para marcos

    // Estados para armazenar as listas de usuários e a lista completa recebida da API
    const [allUsers, setAllUsers] = useState([]); // Novo estado para a lista completa
    const [colaboradoresList, setColaboradoresList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false); // Estado para carregamento de usuários
    const [usersError, setUsersError] = useState(null); // Estado para erro no carregamento de usuários

    const [idUsuario, setIdUsuario] = useState(null);

    useEffect(() => {
        if (isOpen && user?.id) { // Verifica se o modal está aberto e se temos o ID do usuário
            console.log('Modal is open, fetching users for user:', user.id);
            const fetchUsers = async () => {
                setUsersLoading(true);
                setUsersError(null);
                try {
                    const users = await pdiService.getUsersByDepartment(user.id);
                    console.log('Users fetched for user:', users);
                    setAllUsers(users);
                } catch (err) {
                    setUsersError('Erro ao carregar a lista de usuários.');
                    console.error('Erro ao buscar usuários:', err);
                } finally {
                    setUsersLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isOpen, user?.id]); // Dependência no ID do usuário

    // Efeito para filtrar usuários quando allUsers mudar
    useEffect(() => {
        console.log('allUsers state updated:', allUsers);
        if (allUsers.length > 0) {
            // Filtrando usuários baseado no tipoUsuario - agora só colaboradores
            const cols = allUsers.filter(user => user.tipoUsuario === 'COLABORADOR');
            console.log('Filtered colaboradoresList:', cols);
            setColaboradoresList(cols); // ESSENCIAL!
        } else {
            setColaboradoresList([]);
        }
    }, [allUsers]);

    useEffect(() => {
        async function fetchIdUsuario() {
            const token = localStorage.getItem('access_token');
            const keycloakId = token ? jwtDecode(token).sub : null;
            if (keycloakId) {
                try {
                    const usuario = await getUsuarioByKeycloakId(keycloakId);
                    setIdUsuario(usuario.id); // agora sim, INT do banco!
                } catch (e) {
                    setIdUsuario(null);
                    console.error('Erro ao buscar usuário pelo keycloakId:', e);
                }
            }
        }
        if (isOpen) fetchIdUsuario();
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleMarcoChange = (e) => {
        const { name, value } = e.target;
        setCurrentMarco(prevData => ({
            ...prevData,
            [name]: value
        }));
        setMarcoError(null); // Limpa erro ao digitar
    };

    const handleSelectChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleNextStep = () => {
        // Basic validation for the first step
        if (!formData.colaboradorId || !formData.titulo || !formData.descricao || !formData.dataInicio || !formData.dataFim) {
            setError('Por favor, preencha todos os campos das informações básicas.');
            return;
        }
        setError(null); // Limpa erro se a validação passar
        setStep('milestones'); // Avança para a próxima etapa
    };

    const handleAddMarco = () => {
        if (!currentMarco.titulo || !currentMarco.descricao || !currentMarco.dtFinal) {
            setMarcoError('Por favor, preencha todos os campos do marco.');
            return;
        }
        setMarcoError(null);
        setFormData(prevData => ({
            ...prevData,
            marcos: [...prevData.marcos, { ...currentMarco, status: 'PENDENTE' }] // Adiciona marco com status inicial
        }));
        setCurrentMarco({ titulo: '', descricao: '', dtFinal: '' }); // Limpa os campos do marco
    };

    const handleRemoveMarco = (index) => {
        setFormData(prevData => ({
            ...prevData,
            marcos: prevData.marcos.filter((_, i) => i !== index)
        }));
    };

    const handleSavePdi = async () => {
        // Opcional: validação final antes de salvar o PDI completo
        if (!formData.marcos || formData.marcos.length === 0) {
            // Podemos exigir pelo menos um marco, ou permitir PDI sem marcos iniciais
            // setError('Por favor, adicione pelo menos um marco.');
            // return;
        }

        setLoading(true);
        setError(null);
        try {
            const pdiData = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                dataInicio: formData.dataInicio,
                dataFim: formData.dataFim,
                idUsuario,
                idDestinatario: Number(formData.colaboradorId),
                status: 'EM_ANDAMENTO',
                marcos: formData.marcos.map(marco => ({
                    titulo: marco.titulo,
                    descricao: marco.descricao,
                    dtFinal: marco.dtFinal,
                    status: marco.status || 'PENDENTE'
                }))
            };
            console.log('Enviando PDI:', pdiData);
            const newPdi = await pdiService.createPdi(pdiData);
            console.log('PDI criado com sucesso:', newPdi);
            onSuccess(newPdi); // Chamar a função de sucesso passada como prop
            handleClose(); // Fechar o modal após sucesso
        } catch (err) {
            setError('Erro ao criar o PDI. Verifique os dados e tente novamente.');
            console.error('Erro na criação do PDI:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('basicInfo'); // Reinicia para a primeira etapa ao fechar
        setFormData({
            colaboradorId: undefined,
            titulo: '',
            descricao: '',
            dataInicio: '',
            dataFim: '',
            marcos: [],
        });
        setCurrentMarco({ titulo: '', descricao: '', dtFinal: '' });
        setError(null);
        setMarcoError(null);
        setUsersError(null); // Limpa erro de usuários ao fechar
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    console.log('Final rendering - colaboradoresList:', colaboradoresList); // Log final antes de renderizar

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Novo Plano de Desenvolvimento</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        className={`flex-1 text-center py-2 px-4 ${step === 'basicInfo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setStep('basicInfo')}
                        disabled={loading || usersLoading} // Desabilita enquanto salva ou carrega usuários
                    >
                        Informações Básicas
                    </button>
                    <button
                        className={`flex-1 text-center py-2 px-4 ${step === 'milestones' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setStep('milestones')}
                        disabled={loading || usersLoading || !formData.colaboradorId || !formData.titulo || !formData.descricao || !formData.dataInicio || !formData.dataFim} // Desabilita se informações básicas estiverem incompletas ou salvando/carregando
                    >
                        Marcos e Etapas
                    </button>
                </div>

                {/* Content */}
                {usersLoading && <p className="text-center text-gray-600">Carregando usuários...</p>}
                {usersError && <p className="text-center text-red-600">{usersError}</p>}

                {!usersLoading && !usersError && step === 'basicInfo' && (
                    <div>
                        <p className="text-gray-600 mb-4">Preencha as informações básicas do Plano de Desenvolvimento Individual.</p>

                        <div className="grid grid-cols-1 gap-4 mb-4">
                            <div>
                                <label htmlFor="colaboradorId" className="block text-sm font-medium text-gray-700">Colaborador</label>
                                <select
                                    value={formData.colaboradorId}
                                    onChange={e => handleSelectChange('colaboradorId', e.target.value)}
                                    disabled={loading || usersLoading}
                                >
                                    <option value="">Selecione o colaborador</option>
                                    {colaboradoresList.map(colaborador => (
                                        <option key={colaborador.id} value={colaborador.id}>
                                            {colaborador.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título do PDI</label>
                            <input
                                type="text"
                                name="titulo"
                                id="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Ex: Desenvolvimento de Habilidades de Liderança"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descrição e Objetivos</label>
                            <textarea
                                name="descricao"
                                id="descricao"
                                rows="3"
                                value={formData.descricao}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Descreva os objetivos e metas deste PDI..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label htmlFor="dataInicio" className="block text-sm font-medium text-gray-700">Data de Início</label>
                                {/* Usando input type date básico por enquanto */}
                                <input
                                    type="date"
                                    name="dataInicio"
                                    id="dataInicio"
                                    value={formData.dataInicio}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="dataFim" className="block text-sm font-medium text-gray-700">Data de Término</label>
                                {/* Usando input type date básico por enquanto */}
                                <input
                                    type="date"
                                    name="dataFim"
                                    id="dataFim"
                                    value={formData.dataFim}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        {/* Footer buttons */}
                        <div className="flex justify-end space-x-4">
                            <Button variant="outline" onClick={handleClose} disabled={loading || usersLoading}>Cancelar</Button>
                            <Button onClick={handleNextStep} disabled={loading || usersLoading || !!error}>
                                Próximo: Marcos e Etapas
                            </Button>
                        </div>
                    </div>
                )}

                {!usersLoading && !usersError && step === 'milestones' && (
                    <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Marcos e Etapas</h4>
                        <p className="text-gray-600 mb-4">Detalhe os marcos e etapas para este PDI.</p>

                        {/* Formulário para adicionar novo marco */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h5 className="font-semibold text-gray-700 mb-2">Adicionar Novo Marco</h5>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="marcoTitulo" className="block text-sm font-medium text-gray-700">Título do Marco</label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        id="marcoTitulo"
                                        value={currentMarco.titulo}
                                        onChange={handleMarcoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Ex: Concluir curso de React"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="marcoDescricao" className="block text-sm font-medium text-gray-700">Descrição do Marco</label>
                                    <textarea
                                        name="descricao"
                                        id="marcoDescricao"
                                        rows="2"
                                        value={currentMarco.descricao}
                                        onChange={handleMarcoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Descreva as atividades para este marco..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="marcoDtFinal" className="block text-sm font-medium text-gray-700">Data Final do Marco</label>
                                    <input
                                        type="date"
                                        name="dtFinal"
                                        id="marcoDtFinal"
                                        value={currentMarco.dtFinal}
                                        onChange={handleMarcoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                                {marcoError && <p className="text-red-500 text-sm">{marcoError}</p>}
                                <Button onClick={handleAddMarco} className="w-full" disabled={loading}>Adicionar Marco</Button>
                            </div>
                        </div>

                        {/* Lista de Marcos adicionados */}
                        {formData.marcos.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="font-semibold text-gray-700">Marcos Adicionados</h5>
                                {formData.marcos.map((marco, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{marco.titulo}</p>
                                            <p className="text-sm text-gray-600">{marco.descricao}</p>
                                            <p className="text-xs text-gray-500">
                                                Data Final: {formatDate(marco.dtFinal)}
                                            </p>
                                        </div>
                                        <button onClick={() => handleRemoveMarco(index)} className="text-red-500 hover:text-red-700 text-sm" disabled={loading}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                        {/* Botões de navegação e salvar */}
                        <div className="flex justify-between space-x-4 mt-6">
                            <Button variant="outline" onClick={() => setStep('basicInfo')} disabled={loading || usersLoading}>Voltar</Button>
                            <Button onClick={handleSavePdi} disabled={loading || usersLoading || formData.marcos.length === 0}>
                                {loading ? 'Salvando PDI...' : 'Salvar PDI Completo'}
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CreatePdiModal; 