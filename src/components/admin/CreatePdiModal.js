import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import pdiService from '../../services/pdiService';
import { useAuth } from '../../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { userService } from "../../services/userService";
import { formatDate } from '../../utils/Dictionary';
import { toast } from 'react-toastify';
import { validarPdiCompleto, validarDuracaoMinima } from '../../services/pdiValidationService';

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
            toast.error("É necessário adicionar pelo menos um marco ao PDI.");
            return;
        }

        setLoading(true);
        setError(null);

        const pdiData = {
            ...formData,
            gestorId: idUsuario,
            status: 'ATIVO',
        };

        try {
            await pdiService.createPdi(pdiData);
            toast.success('PDI criado com sucesso!');
            handleClose();
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erro ao criar o PDI.';
            setError(errorMessage);
            toast.error(`Erro: ${errorMessage}`);
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
        setCurrentMarco({
            titulo: '',
            descricao: '',
            dtFinal: '',
        });
        setLoading(false);
        setError(null);
        setMarcoError(null);
        setFieldErrors({});
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col relative animate-fade-in-down">
                
                <header className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {step === 'basicInfo' ? 'Criar Novo Plano de Desenvolvimento' : 'Adicionar Marcos ao PDI'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </header>

                <div className="p-8 overflow-y-auto flex-grow">
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                            <p className="font-bold">Erro</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 'basicInfo' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="colaboradorId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Colaborador
                                    </label>
                                    {usersLoading ? <p>Carregando colaboradores...</p> :
                                     usersError ? <p className="text-red-500">{usersError}</p> :
                                     <select
                                         id="colaboradorId"
                                         name="colaboradorId"
                                         value={formData.colaboradorId}
                                         onChange={handleChange}
                                         className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.colaboradorId ? 'border-red-500' : 'border-gray-300'}`}
                                     >
                                         <option value="">Selecione um Colaborador</option>
                                         {colaboradoresList.map(user => (
                                             <option key={user.id} value={user.id}>{user.nome}</option>
                                         ))}
                                     </select>
                                    }
                                    {fieldErrors.colaboradorId && <p className="text-red-500 text-xs mt-1">{fieldErrors.colaboradorId}</p>}
                                </div>
                                <div>
                                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Título do PDI
                                    </label>
                                    <input
                                        type="text"
                                        id="titulo"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.titulo ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.titulo && <p className="text-red-500 text-xs mt-1">{fieldErrors.titulo}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    id="descricao"
                                    name="descricao"
                                    rows="4"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.descricao ? 'border-red-500' : 'border-gray-300'}`}
                                ></textarea>
                                {fieldErrors.descricao && <p className="text-red-500 text-xs mt-1">{fieldErrors.descricao}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="dtInicio" className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Início
                                    </label>
                                    <input
                                        type="date"
                                        id="dtInicio"
                                        name="dtInicio"
                                        min={today}
                                        value={formData.dtInicio}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.dtInicio ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.dtInicio && <p className="text-red-500 text-xs mt-1">{fieldErrors.dtInicio}</p>}
                                </div>
                                <div>
                                    <label htmlFor="dtFim" className="block text-sm font-medium text-gray-700 mb-1">
                                        Data de Término
                                    </label>
                                    <input
                                        type="date"
                                        id="dtFim"
                                        name="dtFim"
                                        min={formData.dtInicio || today}
                                        value={formData.dtFim}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.dtFim ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {fieldErrors.dtFim && <p className="text-red-500 text-xs mt-1">{fieldErrors.dtFim}</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Formulário de marcos (step 2)
                        <div className="space-y-6">
                            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Novo Marco</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                    <div className="md:col-span-1">
                                        <label htmlFor="marcoTitulo" className="block text-sm font-medium text-gray-700 mb-1">
                                            Título do Marco
                                        </label>
                                        <input
                                            type="text"
                                            id="marcoTitulo"
                                            name="titulo"
                                            value={currentMarco.titulo}
                                            onChange={handleMarcoChange}
                                            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.currentMarcoTitulo ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {fieldErrors.currentMarcoTitulo && <p className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoTitulo}</p>}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label htmlFor="marcoDtFinal" className="block text-sm font-medium text-gray-700 mb-1">
                                            Data Final
                                        </label>
                                        <input
                                            type="date"
                                            id="marcoDtFinal"
                                            name="dtFinal"
                                            value={currentMarco.dtFinal}
                                            onChange={handleMarcoChange}
                                            min={formData.dtInicio}
                                            max={formData.dtFim}
                                            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.currentMarcoDtFinal ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {fieldErrors.currentMarcoDtFinal && <p className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoDtFinal}</p>}
                                    </div>
                                    <div className="md:col-span-1 flex items-end">
                                        <Button onClick={handleAddMarco} className="w-full" disabled={loading}>
                                            Adicionar Marco
                                        </Button>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label htmlFor="marcoDescricao" className="block text-sm font-medium text-gray-700 mb-1">
                                            Descrição do Marco
                                        </label>
                                        <textarea
                                            id="marcoDescricao"
                                            name="descricao"
                                            rows="3"
                                            value={currentMarco.descricao}
                                            onChange={handleMarcoChange}
                                            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all ${fieldErrors.currentMarcoDescricao ? 'border-red-500' : 'border-gray-300'}`}
                                        ></textarea>
                                        {fieldErrors.currentMarcoDescricao && <p className="text-red-500 text-xs mt-1">{fieldErrors.currentMarcoDescricao}</p>}
                                    </div>
                                </div>
                                {marcoError && (
                                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mt-4 rounded-md">
                                        <p>{marcoError}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Marcos Adicionados</h3>
                                {formData.marcos.length === 0 ? (
                                    <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">Nenhum marco adicionado ainda.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-4">
                                        {formData.marcos.map((marco, index) => (
                                            <li key={index} className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-900">{marco.titulo}</p>
                                                    <p className="text-sm text-gray-600">{marco.descricao}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Data Final: {formatDate(marco.dtFinal)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMarco(index)}
                                                    className="text-red-500 hover:text-red-700 ml-4 p-2 rounded-full hover:bg-red-100 transition-colors"
                                                    disabled={loading}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <Button
                        variant="ghost"
                        onClick={step === 'basicInfo' ? handleClose : () => setStep('basicInfo')}
                        disabled={loading}
                    >
                        {step === 'basicInfo' ? 'Cancelar' : 'Voltar'}
                    </Button>
                    <Button
                        onClick={step === 'basicInfo' ? handleNextStep : handleSavePdi}
                        disabled={loading}
                        className="ml-4"
                    >
                        {loading ? 'Salvando...' : (step === 'basicInfo' ? 'Avançar' : 'Salvar PDI')}
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export default CreatePdiModal; 