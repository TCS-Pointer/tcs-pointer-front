import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import pdiService from '../../services/pdiService';
import { useAuth } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { userService } from "../../services/userService";
import { formatDate } from '../../utils/Dictionary';
import Toast from '../ui/Toast';
import { validarPdiCompleto } from '../../services/pdiValidationService';

const CreatePdiModal = ({ isOpen, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState('basicInfo');
    const [formData, setFormData] = useState({
        colaboradorId: undefined,
        titulo: '',
        descricao: '',
        dtInicio: '',
        dtFim: '',
        marcos: [],
    });
    const [currentMarco, setCurrentMarco] = useState({
        titulo: '',
        descricao: '',
        dtFinal: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marcoError, setMarcoError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [colaboradoresList, setColaboradoresList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [toast, setToast] = useState(null);

    const [idUsuario, setIdUsuario] = useState(null);

    useEffect(() => {
        console.log('DEBUG isOpen:', isOpen, 'user:', user);
        if (isOpen && user?.sub) {
            console.log('Modal is open, fetching users for user:', user.sub);
            const fetchUsers = async () => {
                setUsersLoading(true);
                setUsersError(null);
                try {
                    const users = await pdiService.getUsersByDepartment(user.sub);
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
    }, [isOpen, user?.sub]);
    useEffect(() => {
        console.log('allUsers state updated:', allUsers);
        if (allUsers.length > 0) {
            const cols = allUsers.filter(user => user.tipoUsuario === 'COLABORADOR');
            console.log('Filtered colaboradoresList:', cols);
            setColaboradoresList(cols);
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
                    const response = await userService.getUserByKeycloakId(keycloakId);
                    setIdUsuario(response.id);
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
        setMarcoError(null);
    };

    const handleSelectChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleNextStep = () => {
        if (!formData.colaboradorId || !formData.titulo || !formData.descricao || !formData.dtInicio || !formData.dtFim) {
            setToast({ message: 'Por favor, preencha todos os campos das informações básicas.', type: 'error' });
            return;
        }
        setToast(null);
        setStep('milestones');
    };

    const handleAddMarco = () => {
        if (!currentMarco.titulo || !currentMarco.descricao || !currentMarco.dtFinal) {
            setToast({ message: 'Por favor, preencha todos os campos do marco.', type: 'error' });
            return;
        }
        setToast(null);
        setFormData(prevData => ({
            ...prevData,
            marcos: [...prevData.marcos, { ...currentMarco, status: 'PENDENTE' }]
        }));
        setCurrentMarco({ titulo: '', descricao: '', dtFinal: '' });
    };

    const handleRemoveMarco = (index) => {
        setFormData(prevData => ({
            ...prevData,
            marcos: prevData.marcos.filter((_, i) => i !== index)
        }));
    };

    const handleSavePdi = async () => {
        const erros = validarPdiCompleto(formData);
        if (erros.length > 0) {
            setToast({ message: erros.join('\n'), type: 'error' });
            return;
        }
        if (!formData.marcos || formData.marcos.length === 0) {
            setToast({ message: 'Por favor, adicione pelo menos um marco.', type: 'error' });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const pdiData = {
                titulo: formData.titulo,
                descricao: formData.descricao,
                dtInicio: formData.dtInicio,
                dtFim: formData.dtFim,
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
            setToast({ message: 'PDI criado com sucesso!', type: 'success' });
            await new Promise(resolve => setTimeout(resolve, 1500));
            onSuccess(newPdi);
            handleClose();
        } catch (err) {
            setToast({ message: 'Erro ao criar o PDI. Verifique os dados e tente novamente.', type: 'error' });
            console.error('Erro na criação do PDI:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('basicInfo');
        setFormData({
            colaboradorId: undefined,
            titulo: '',
            descricao: '',
            dtInicio: '',
            dtFim: '',
            marcos: [],
        });
        setCurrentMarco({ titulo: '', descricao: '', dtFinal: '' });
        setError(null);
        setMarcoError(null);
        setUsersError(null);
        setLoading(false);
        setToast(null);
        onClose();
    };

    if (!isOpen) return null;

    console.log('Final rendering - colaboradoresList:', colaboradoresList);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            {toast && (
                <Toast
                    message={toast.message.split('\n').map((msg, idx) => <div key={idx}>{msg}</div>)}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Novo Plano de Desenvolvimento</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <div className="flex border-b mb-4">
                    <button
                        className={`flex-1 text-center py-2 px-4 ${step === 'basicInfo' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setStep('basicInfo')}
                        disabled={loading || usersLoading}
                    >
                        Informações Básicas
                    </button>
                    <button
                        className={`flex-1 text-center py-2 px-4 ${step === 'milestones' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                        onClick={() => setStep('milestones')}
                        disabled={loading || usersLoading || !formData.colaboradorId || !formData.titulo || !formData.descricao || !formData.dtInicio || !formData.dtFim}
                    >
                        Marcos e Etapas
                    </button>
                </div>
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
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                                <label htmlFor="dtInicio" className="block text-sm font-medium text-gray-700">Data de Início</label>
                                <input
                                    type="date"
                                    name="dtInicio"
                                    id="dtInicio"
                                    value={formData.dtInicio}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="dtFim" className="block text-sm font-medium text-gray-700">Data de Término</label>
                                <input
                                    type="date"
                                    name="dtFim"
                                    id="dtFim"
                                    value={formData.dtFim}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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