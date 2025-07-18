import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import pdiService from '../../services/pdiService';
import CreatePdiModal from '../../components/admin/CreatePdiModal';
import { useAuth } from '../../contexts/AuthContext';
import { dictionary, formatDate } from '../../utils/Dictionary';
import { Calendar, FileText, Users, TrendingUp, Search, Eye } from 'lucide-react';
import PdiDetalhesModal from '../../components/admin/PdiDetalhesModal';
import { userService } from "../../services/userService";

function getUserRoles() {
    const token = localStorage.getItem('access_token');
    if (!token) return [];
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.realm_access?.roles || [];
    } catch (e) {
        return [];
    }
}

function getUserIdFromToken() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.sub;
    } catch (e) {
        return null;
    }
}

function getUserSetorFromToken() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.setor || null; // ajuste conforme o campo do seu token
    } catch (e) {
        return null;
    }
}

const AllPDIs = () => {
    const { user } = useAuth();
    const [pdis, setPdis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('todos');
    const [selectedStatus, setSelectedStatus] = useState('ATIVO');
    const [selectedPdiId, setSelectedPdiId] = useState(null);
    const [selectedPdi, setSelectedPdi] = useState(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPdis = async () => {
        try {
            setLoading(true);
            const roles = getUserRoles();
            let data = [];
            if (roles.includes('admin')) {
                data = await pdiService.getAllPdisSimples();
            } else if (roles.includes('gestor')) {
                // Buscar setor do gestor
                let setorGestor = user?.setor;
                if (!setorGestor) {
                    // Buscar pelo usuário se não tiver no contexto
                    const keycloakId = getUserIdFromToken();
                    const usuario = await userService.getUserByKeycloakId(keycloakId);
                    setorGestor = usuario.setor;
                }
                data = await pdiService.getAllPdisSimples();
                data = data.filter(pdi => (pdi.setorDestinatario || pdi.destinatario?.setor) === setorGestor);
            } else if (roles.includes('colaborador')) {
                let userId = user?.id;
                if (!userId) {
                    const keycloakId = getUserIdFromToken();
                    const usuario = await userService.getUserByKeycloakId(keycloakId);
                    userId = usuario.id;
                }
                const response = await pdiService.getPdisByDestinatario(userId);
                data = response.content || response;
            }
            setPdis(data);
            const uniqueDepartments = [...new Set(data.map(
                pdi => pdi.setorDestinatario || pdi.destinatario?.setor
            ).filter(Boolean))];
            const departmentOptions = uniqueDepartments.map(dept => ({
                value: dept,
                label: dept
            }));
            setDepartments(departmentOptions);
        } catch (err) {
            setError('Erro ao carregar a lista de PDIs.');
            setPdis([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPdis();
    }, []);

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    };

    const handlePdiCreatedSuccess = (newPdi) => {
        console.log('Novo PDI criado com sucesso:', newPdi);
        handleCloseCreateModal();
        fetchPdis();
    };

    const handleVisualizarPdi = async (pdiId) => {
        setLoadingDetalhe(true);
        setSelectedPdiId(pdiId);
        try {
            const pdiCompleto = await pdiService.getPdiById(pdiId);
            setSelectedPdi(pdiCompleto);
        } catch (err) {
            setSelectedPdi(null);
        } finally {
            setLoadingDetalhe(false);
        }
    };

    const handleCloseDetalhes = () => {
        setSelectedPdi(null);
        setSelectedPdiId(null);
    };

    const filteredPdis = React.useMemo(() => {
        let filtered = pdis;

        if (selectedDepartment !== 'todos') {
            filtered = filtered.filter(pdi => (pdi.setorDestinatario || pdi.destinatario?.setor) === selectedDepartment);
        }

        if (selectedStatus === 'ATIVO') {
            filtered = filtered.filter(pdi => pdi.status === 'ATIVO' || pdi.status === 'EM_ANDAMENTO');
        } else {
            filtered = filtered.filter(pdi => pdi.status === selectedStatus);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(pdi => {
                const matchesTitle = (pdi.titulo || '').toLowerCase().includes(lowerCaseQuery);
                const matchesDescription = (pdi.descricao || '').toLowerCase().includes(lowerCaseQuery);
                const matchesDestinatarioName = (pdi.nomeDestinatario || pdi.destinatario?.nome || '').toLowerCase().includes(lowerCaseQuery);
                const matchesDestinatarioEmail = (pdi.emailDestinatario || pdi.destinatario?.email || '').toLowerCase().includes(lowerCaseQuery);
                return matchesTitle || matchesDescription || matchesDestinatarioName || matchesDestinatarioEmail;
            });
        }

        return filtered;
    }, [pdis, selectedDepartment, selectedStatus, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Todos os PDIs</h1>
                <div className="flex space-x-4">
                    <Button onClick={handleOpenCreateModal}>
                        <span className="text-xl mr-1 mb-0.5">+</span> Novo PDI
                    </Button>
                </div>
            </div>
            <p className="text-gray-600">Visualize e gerencie todos os Planos de Desenvolvimento Individual</p>
            <div className="flex gap-4">
                <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-gray-500 text-sm">PDIs Ativos</div>
                            <div className="text-3xl font-bold">{pdis.filter(p => p.status === 'ATIVO' || p.status === 'EM_ANDAMENTO').length}</div>
                        </div>
                        <div className="bg-blue-100 rounded-full p-2">
                            <Calendar className="text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-gray-500 text-sm">PDIs Concluídos</div>
                            <div className="text-3xl font-bold">{pdis.filter(p => p.status === 'CONCLUIDO').length}</div>
                        </div>
                        <div className="bg-green-100 rounded-full p-2">
                            <FileText className="text-green-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-gray-500 text-sm">Taxa de Conclusão</div>
                            <div className="text-3xl font-bold">
                                {(() => {
                                    const totalPDIs = pdis.length;
                                    const pdisConcluidos = pdis.filter(p => p.status === 'CONCLUIDO').length;
                                    const taxaConclusao = totalPDIs > 0 ? Math.round((pdisConcluidos / totalPDIs) * 100) : 0;
                                    return `${taxaConclusao}%`;
                                })()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {(() => {
                                    const totalPDIs = pdis.length;
                                    const pdisConcluidos = pdis.filter(p => p.status === 'CONCLUIDO').length;
                                    return `${pdisConcluidos} de ${totalPDIs} PDIs concluídos`;
                                })()}
                            </div>
                        </div>
                        <div className="bg-yellow-100 rounded-full p-2">
                            <TrendingUp className="text-yellow-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex-1 min-w-[220px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-gray-500 text-sm">Colaboradores com PDI</div>
                            <div className="text-3xl font-bold">{new Set(pdis.map(p => p.idDestinatario)).size}</div>
                        </div>
                        <div className="bg-purple-100 rounded-full p-2">
                            <Users className="text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Setor</label>
                        <select
                            id="departamento"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="todos">Todos os Setores</option>
                            {departments.map((dept) => (
                                <option key={dept.value} value={dept.value}>
                                    {dept.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full md:w-auto">
                        <label htmlFor="busca" className="block text-sm font-medium text-gray-700">Busca</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                type="text"
                                name="busca"
                                id="busca"
                                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Filtrar PDI por nome, email, descrição..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <div className="sm:hidden">
                        <label htmlFor="tabs" className="sr-only">Select a tab</label>
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Ativos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativos">{dictionary['ATIVO']}</SelectItem>
                                <SelectItem value="concluidos">{dictionary['CONCLUIDO']}</SelectItem>
                                <SelectItem value="atrasados">{dictionary['ATRASADO']}</SelectItem>
                                <SelectItem value="pendente">{dictionary['PENDENTE']}</SelectItem>
                                <SelectItem value="cancelados">{dictionary['CANCELADO']}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="hidden sm:block">
                        <nav className="flex space-x-4" aria-label="Tabs">
                            <button
                                onClick={() => setSelectedStatus('ATIVO')}
                                className={`px-3 py-2 font-medium text-sm rounded-md ${selectedStatus === 'ATIVO'
                                    ? 'text-blue-600 bg-blue-100'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {dictionary['ATIVO']}
                            </button>
                            <button
                                onClick={() => setSelectedStatus('CONCLUIDO')}
                                className={`px-3 py-2 font-medium text-sm rounded-md ${selectedStatus === 'CONCLUIDO'
                                    ? 'text-blue-600 bg-blue-100'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {dictionary['CONCLUIDO']}
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
            {loading && <p className="text-center text-gray-600">Carregando PDIs...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}
            {!loading && !error && filteredPdis.length === 0 && (
                <p className="text-center text-gray-600">Nenhum PDI encontrado.</p>
            )}
            {!loading && !error && filteredPdis.length > 0 && (
                <div className="space-y-6">
                    {filteredPdis.map(pdi => {
                        const nomeDestinatario = pdi.nomeDestinatario || pdi.destinatario?.nome;
                        const cargoDestinatario = pdi.cargoDestinatario || pdi.destinatario?.cargo;
                        const setorDestinatario = pdi.setorDestinatario || pdi.destinatario?.setor;
                        const totalMarcos = pdi.totalMarcos !== undefined ? pdi.totalMarcos : (pdi.marcos ? pdi.marcos.length : 0);
                        const marcosConcluidos = pdi.marcosConcluidos !== undefined
                            ? pdi.marcosConcluidos
                            : (pdi.marcos ? pdi.marcos.filter(m => m.status === 'CONCLUIDO' || m.status === 'Concluído').length : 0);
                        const progresso = totalMarcos > 0 ? Math.round((marcosConcluidos / totalMarcos) * 100) : 0;
                        return (
                            <div key={pdi.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {nomeDestinatario ? nomeDestinatario.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{nomeDestinatario || 'Usuário não encontrado'}</h3>
                                            <p className="text-sm text-gray-600">
                                                {cargoDestinatario} • {setorDestinatario}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${pdi.status === 'ATIVO' || pdi.status === 'EM_ANDAMENTO' ? 'bg-green-100 text-green-800' :
                                            pdi.status === 'CONCLUIDO' ? 'bg-blue-100 text-blue-800' :
                                                pdi.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                                                    pdi.status === 'CANCELADO' ? 'bg-yellow-100 text-yellow-800' :
                                                        pdi.status === 'PENDENTE' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                            {dictionary[pdi.status] || pdi.status}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold mb-4">{pdi.titulo}</h4>
                                <div className="flex justify-between text-sm text-gray-600 mb-4">
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Início</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatDate(pdi.dtInicio)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs mb-1">Término</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatDate(pdi.dtFim)}</span>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Progresso</label>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progresso}%` }}></div>
                                    </div>
                                    <p className="text-sm text-gray-600 text-right mt-1">{progresso}%</p>
                                </div>
                                <div className="text-right">
                                    <button
                                        className="text-blue-600 hover:underline inline-flex items-center justify-end"
                                        onClick={() => handleVisualizarPdi(pdi.id)}
                                    >
                                        <Eye className="mr-1 h-4 w-4" /> Visualizar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showCreateModal && (
                <CreatePdiModal
                    isOpen={showCreateModal}
                    onClose={handleCloseCreateModal}
                    onSuccess={handlePdiCreatedSuccess}
                    userId={user?.id}
                />
            )}

            <PdiDetalhesModal
                isOpen={!!selectedPdi}
                onClose={handleCloseDetalhes}
                pdi={selectedPdi}
                onUpdate={fetchPdis}
            />
            {loadingDetalhe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <p className="text-lg font-semibold">Carregando detalhes do PDI...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllPDIs;