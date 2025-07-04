import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import pdiService from '../../services/pdiService';
import { useAuth } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { userService } from "../../services/userService";
import { formatDate } from '../../utils/Dictionary';
import { toast } from 'react-toastify';
import { validarPdiCompleto, validarDuracaoMinima } from '../../services/pdiValidationService';
import ModerationService from '../../services/moderation.service';

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
    const [fieldErrors, setFieldErrors] = useState({});

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
        setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    const handleMarcoChange = (e) => {
        const { name, value } = e.target;
        setCurrentMarco(prevData => ({
            ...prevData,
            [name]: value
        }));
        setFieldErrors(prev => ({
            ...prev,
            [`currentMarco${name.charAt(0).toUpperCase() + name.slice(1)}`]: undefined
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
        if (!validateFields()) {
            toast.error('Verifique os campos destacados e tente novamente.');
            return;
        }
        toast.dismiss();
        setStep('milestones');
    };

    const handleAddMarco = () => {
        const erros = {};
        if (!currentMarco.titulo || currentMarco.titulo.trim().length < 3) {
            erros.currentMarcoTitulo = 'Título do marco deve ter pelo menos 3 caracteres.';
        }
        if (!currentMarco.descricao || currentMarco.descricao.trim().length < 5) {
            erros.currentMarcoDescricao = 'Descrição do marco deve ter pelo menos 5 caracteres.';
        }
        if (!currentMarco.dtFinal) {
            erros.currentMarcoDtFinal = 'Data final do marco é obrigatória.';
        }
        if (currentMarco.dtFinal && formData.dtInicio && formData.dtFim) {
            const dataMarco = new Date(currentMarco.dtFinal);
            const inicio = new Date(formData.dtInicio);
            const fim = new Date(formData.dtFim);
            if (dataMarco < inicio || dataMarco > fim) {
                erros.currentMarcoDtFinal = 'Data do marco deve estar dentro do período do PDI.';
            }
        }
        setFieldErrors(prev => ({ ...prev, ...erros }));
        if (Object.keys(erros).length > 0) {
            toast.error('Verifique os campos destacados do marco e tente novamente.');
            return;
        }
        toast.dismiss();
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
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`marco_titulo_${index}`];
            delete newErrors[`marco_descricao_${index}`];
            delete newErrors[`marco_dtFinal_${index}`];
            return newErrors;
        });
    };

    const validateFields = () => {
        const erros = {};
        if (!formData.colaboradorId) {
            erros.colaboradorId = 'Colaborador é obrigatório.';
        }
        if (!formData.titulo || formData.titulo.trim().length < 5) {
            erros.titulo = 'Título deve ter pelo menos 5 caracteres.';
        }
        if (!formData.descricao || formData.descricao.trim().length < 10) {
            erros.descricao = 'Descrição deve ter pelo menos 10 caracteres.';
        }
        if (!formData.dtInicio) {
            erros.dtInicio = 'Data de início é obrigatória.';
        }
        if (!formData.dtFim) {
            erros.dtFim = 'Data de término é obrigatória.';
        }
        if (formData.dtInicio && formData.dtFim && !validarDuracaoMinima(formData.dtInicio, formData.dtFim)) {
            erros.dtFim = 'O PDI deve ter pelo menos 1 mês de duração.';
        }
        formData.marcos.forEach((marco, idx) => {
            if (!marco.titulo || marco.titulo.trim().length < 3) {
                erros[`marco_titulo_${idx}`] = 'Título do marco deve ter pelo menos 3 caracteres.';
            }
            if (!marco.descricao || marco.descricao.trim().length < 5) {
                erros[`marco_descricao_${idx}`] = 'Descrição do marco deve ter pelo menos 5 caracteres.';
            }
            if (!marco.dtFinal) {
                erros[`marco_dtFinal_${idx}`] = 'Data final do marco é obrigatória.';
            }
            if (marco.dtFinal && formData.dtInicio && formData.dtFim) {
                const dataMarco = new Date(marco.dtFinal);
                const inicio = new Date(formData.dtInicio);
                const fim = new Date(formData.dtFim);
                if (dataMarco < inicio || dataMarco > fim) {
                    erros[`marco_dtFinal_${idx}`] = 'Data do marco deve estar dentro do período do PDI.';
                }
            }
        });
        setFieldErrors(erros);
        return Object.keys(erros).length === 0;
    };

    const handleSavePdi = async () => {
        if (!validateFields()) {
            toast.error('Verifique os campos destacados e tente novamente.');
            return;
        }
        if (currentMarco.titulo || currentMarco.descricao || currentMarco.dtFinal) {
            const erros = {};
            if (!currentMarco.titulo || currentMarco.titulo.trim().length < 3) {
                erros.currentMarcoTitulo = 'Título do marco deve ter pelo menos 3 caracteres.';
            }
            if (!currentMarco.descricao || currentMarco.descricao.trim().length < 5) {
                erros.currentMarcoDescricao = 'Descrição do marco deve ter pelo menos 5 caracteres.';
            }
            if (!currentMarco.dtFinal) {
                erros.currentMarcoDtFinal = 'Data final do marco é obrigatória.';
            }
            if (currentMarco.dtFinal && formData.dtInicio && formData.dtFim) {
                const dataMarco = new Date(currentMarco.dtFinal);
                const inicio = new Date(formData.dtInicio);
                const fim = new Date(formData.dtFim);
                if (dataMarco < inicio || dataMarco > fim) {
                    erros.currentMarcoDtFinal = 'Data do marco deve estar dentro do período do PDI.';
                }
            }
            setFieldErrors(prev => ({ ...prev, ...erros }));
            if (Object.keys(erros).length > 0) {
                toast.error('Finalize ou corrija o marco em edição antes de salvar o PDI.');
                return;
            }
        }
        const erros = validarPdiCompleto(formData);
        if (erros.length > 0) {
            toast.error(erros.join('\n'));
            return;
        }
        if (!formData.marcos || formData.marcos.length === 0) {
            toast.error('Por favor, adicione pelo menos um marco.');
            return;
        }
        try {
            toast.info('Validando conteúdo do PDI...', { autoClose: 2000 });
            const textoModeracao = `Título: ${formData.titulo}\nDescrição: ${formData.descricao}`;
            const moderationResult = await ModerationService.moderarTexto(textoModeracao);
            if (moderationResult === 'OFENSIVO') {
                toast.error('O conteúdo do PDI contém linguagem inadequada. Por favor, revise o texto.');
                return;
            }
        } catch (err) {
            toast.error('Erro ao validar conteúdo do PDI. Tente novamente.');
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
            toast.success('PDI criado com sucesso!');
            await new Promise(resolve => setTimeout(resolve, 1500));
            onSuccess(newPdi);
            handleClose();
        } catch (err) {
            toast.error('Erro ao criar o PDI. Verifique os dados e tente novamente.');
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
        onClose();
    };

    if (!isOpen) return null;

    console.log('Final rendering - colaboradoresList:', colaboradoresList);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
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
                                {fieldErrors.colaboradorId && <div className="text-red-500 text-xs mt-1">{fieldErrors.colaboradorId}</div>}
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
                            {fieldErrors.titulo && <div className="text-red-500 text-xs mt-1">{fieldErrors.titulo}</div>}
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
                            {fieldErrors.descricao && <div className="text-red-500 text-xs mt-1">{fieldErrors.descricao}</div>}
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
                                {fieldErrors.dtInicio && <div className="text-red-500 text-xs mt-1">{fieldErrors.dtInicio}</div>}
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
                                {fieldErrors.dtFim && <div className="text-red-500 text-xs mt-1">{fieldErrors.dtFim}</div>}
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
                                    {fieldErrors.currentMarcoTitulo && <div className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoTitulo}</div>}
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
                                    {fieldErrors.currentMarcoDescricao && <div className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoDescricao}</div>}
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
                                    {fieldErrors.currentMarcoDtFinal && <div className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoDtFinal}</div>}
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
                                            {fieldErrors[`marco_titulo_${index}`] && <div className="text-red-500 text-xs mt-1">{fieldErrors[`marco_titulo_${index}`]}</div>}
                                            <p className="text-sm text-gray-600">{marco.descricao}</p>
                                            {fieldErrors[`marco_descricao_${index}`] && <div className="text-red-500 text-xs mt-1">{fieldErrors[`marco_descricao_${index}`]}</div>}
                                            <p className="text-xs text-gray-500">
                                                Data Final: {formatDate(marco.dtFinal)}
                                            </p>
                                            {fieldErrors[`marco_dtFinal_${index}`] && <div className="text-red-500 text-xs mt-1">{fieldErrors[`marco_dtFinal_${index}`]}</div>}
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