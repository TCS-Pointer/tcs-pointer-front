import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import pdiService from '../../services/pdiService';
import CreatePdiModal from '../../components/admin/CreatePdiModal';
import { useAuth } from '../../contexts/AuthContext';
import { dictionary, formatDate } from '../../utils/Dictionary';
import { Calendar, FileText, Users, TrendingUp, Search, Eye } from 'lucide-react';
import PdiDetalhesModal from '../../components/admin/PdiDetalhesModal';

const AllPDIs = () => {
    const { user } = useAuth();
    const [pdis, setPdis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('todos');
    const [selectedStatus, setSelectedStatus] = useState('ATIVO');
    const [selectedPdi, setSelectedPdi] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPdis = async () => {
        try {
            setLoading(true);
            const data = await pdiService.getAllPdis();
            setPdis(data);

            const uniqueDepartments = [...new Set(data.map(pdi => pdi.destinatario?.setor).filter(Boolean))];
            const departmentOptions = uniqueDepartments.map(dept => ({
                value: dept,
                label: dept
            }));
            setDepartments(departmentOptions);
        } catch (err) {
            setError('Erro ao carregar a lista de PDIs.');
            console.error('Erro ao buscar PDIs:', err);
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

    const filteredPdis = React.useMemo(() => {
        let filtered = pdis;

        if (selectedDepartment !== 'todos') {
            filtered = filtered.filter(pdi => pdi.destinatario?.setor === selectedDepartment);
        }

        if (selectedStatus === 'ATIVO') {
            filtered = filtered.filter(pdi => pdi.status === 'ATIVO' || pdi.status === 'EM_ANDAMENTO');
        } else {
            filtered = filtered.filter(pdi => pdi.status === selectedStatus);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(pdi => {
                const matchesTitle = pdi.titulo.toLowerCase().includes(lowerCaseQuery);
                const matchesDescription = pdi.descricao.toLowerCase().includes(lowerCaseQuery);
                const matchesDestinatarioName = pdi.destinatario?.nome?.toLowerCase().includes(lowerCaseQuery);
                const matchesDestinatarioEmail = pdi.destinatario?.email?.toLowerCase().includes(lowerCaseQuery);
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
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Informações Detalhadas
                    </Button>
                    <Button onClick={handleOpenCreateModal}>
                        <span className="text-xl mr-1 mb-0.5">+</span> Novo PDI
                    </Button>
                </div>
            </div>
            <p className="text-gray-600">Visualize e gerencie todos os Planos de Desenvolvimento Individual</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PDIs Ativos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pdis.filter(p => p.status === 'ATIVO' || p.status === 'EM_ANDAMENTO').length}</div>
                        <p className="text-xs text-muted-foreground">+Novos este trimestre (Implementar cálculo)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PDIs Concluídos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pdis.filter(p => p.status === 'CONCLUIDO').length}</div>
                        <p className="text-xs text-muted-foreground">+Novos no último mês (Implementar cálculo)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            const totalPDIs = pdis.length;
                            const pdisConcluidos = pdis.filter(p => p.status === 'CONCLUIDO').length;
                            const taxaConclusao = totalPDIs > 0 ? Math.round((pdisConcluidos / totalPDIs) * 100) : 0;
                            return (
                                <>
                                    <div className="text-2xl font-bold">{taxaConclusao}%</div>
                                    <p className="text-xs text-muted-foreground">
                                        {pdisConcluidos} de {totalPDIs} PDIs concluídos
                                    </p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Colaboradores com PDI</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Set(pdis.map(p => p.idDestinatario)).size}</div>
                        <p className="text-xs text-muted-foreground">% do total de colaboradores (Implementar cálculo)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
                        <select
                            id="departamento"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="todos">Todos os departamentos</option>
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
                        const totalMarcos = pdi.marcos ? pdi.marcos.length : 0;
                        const concluidos = pdi.marcos ? pdi.marcos.filter(m => m.status === 'CONCLUIDO' || m.status === 'Concluído').length : 0;
                        const progresso = totalMarcos > 0 ? Math.round((concluidos / totalMarcos) * 100) : 0;
                        return (
                            <div key={pdi.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                            {pdi.destinatario?.nome ? pdi.destinatario.nome.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{pdi.destinatario?.nome || 'Usuário não encontrado'}</h3>
                                            <p className="text-sm text-gray-600">
                                                {pdi.destinatario?.cargo} • {pdi.destinatario?.setor}
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
                                        onClick={() => setSelectedPdi(pdi)}
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
                onClose={() => setSelectedPdi(null)}
                pdi={selectedPdi}
                onUpdate={fetchPdis}
            />
        </div>
    );
};

export default AllPDIs;