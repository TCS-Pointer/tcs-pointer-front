import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import pdiService from '../../services/pdiService'; // Importando o serviço de PDI
import { userService } from '../../services/userService';
import CreatePdiModal from './CreatePdiModal'; // Importando o modal
import { useAuth } from '../../contexts/AuthContext';
import { dictionary, formatDate } from '../../utils/Dictionary'; // Importando dictionary e formatDate

// Ícones (exemplo, pode precisar ajustar os caminhos ou usar lucide-react se disponível)
import { Calendar, FileText, Users, TrendingUp, Search, Eye } from 'lucide-react'; // Adicionado ícone Eye

const AllPDIs = () => {
    const { user } = useAuth();
    const [pdis, setPdis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false); // Estado para controlar o modal
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('todos');
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    // Mover a função fetchPdis para fora do useEffect
    const fetchPdis = async () => {
        try {
            setLoading(true);
            const data = await pdiService.getAllPdis();
            setPdis(data);
        } catch (err) {
            setError('Erro ao carregar a lista de PDIs.');
            console.error('Erro ao buscar PDIs:', err);
            setPdis([]);
        } finally {
            setLoading(false);
        }
    };

    // Função para buscar usuários do departamento
    const fetchDepartments = async () => {
        if (!user?.id) return;

        setLoadingDepartments(true);
        try {
            const users = await pdiService.getUsersByDepartment(user.id);
            // Criar um Set de departamentos únicos (strings)
            const uniqueDepartmentStrings = [...new Set(users.map(user => user.setor))];
            // Transformar em array de objetos { value: string, label: string }
            const departmentObjects = uniqueDepartmentStrings.map(dept => ({
                value: dept,
                label: dept
            }));
            setDepartments(departmentObjects); // Define o estado com o novo formato
        } catch (err) {
            console.error('Erro ao buscar departamentos:', err);
        } finally {
            setLoadingDepartments(false);
        }
    };

    useEffect(() => {
        fetchPdis();
        fetchDepartments();
    }, [user?.id]); // Array de dependências vazio para rodar apenas uma vez ao montar

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        // Opcional: recarregar a lista de PDIs após fechar o modal caso um novo PDI tenha sido criado com sucesso
        // fetchPdis();
    };

    const handlePdiCreatedSuccess = (newPdi) => {
        // Lógica a ser executada após a criação bem-sucedida de um PDI
        console.log('Novo PDI criado com sucesso:', newPdi);
        handleCloseCreateModal(); // Fechar o modal
        fetchPdis(); // Recarregar a lista de PDIs - agora acessível
    };

    // Função para filtrar PDIs baseado no departamento e status selecionados
    const filteredPdis = React.useMemo(() => {
        let filtered = pdis;

        // Filtro por departamento
        if (selectedDepartment !== 'todos') {
            filtered = filtered.filter(pdi => pdi.destinatario?.setor === selectedDepartment);
        }

        // Filtro por status
        if (selectedStatus === 'ATIVO') {
            filtered = filtered.filter(pdi => pdi.status === 'ATIVO' || pdi.status === 'EM_ANDAMENTO');
        } else {
            filtered = filtered.filter(pdi => pdi.status === selectedStatus);
        }

        return filtered;
    }, [pdis, selectedDepartment, selectedStatus]);

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

            {/* Seção de Estatísticas/Cards - Pode precisar de dados reais da API */}
            {/* Por enquanto, mantemos os valores fixos ou podemos calcular a partir da lista de PDIs */}
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
                        {/* Calcular colaboradores únicos com PDI (Implementar cálculo) */}
                        <div className="text-2xl font-bold">{new Set(pdis.map(p => p.idDestinatario)).size}</div>
                        <p className="text-xs text-muted-foreground">% do total de colaboradores (Implementar cálculo)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção de Filtros */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
                        <Select
                            value={selectedDepartment}
                            onValueChange={setSelectedDepartment}
                            disabled={loadingDepartments}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                {departments.map((dept, index) => (
                                    <SelectItem key={index} value={dept.value}>
                                        {dept.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                                placeholder="Buscar PDI ou colaborador..."
                            />
                        </div>
                    </div>
                </div>
                {/* Tabs de Status */}
                <div className="mt-6">
                    <div className="sm:hidden">
                        <label htmlFor="tabs" className="sr-only">Select a tab</label>
                        {/* Substituir por componente Select real se necessário */}
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
                            {/* Substituir por componente de Tabs real se necessário */}
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-blue-600 bg-blue-100">{dictionary['ATIVO']}</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">{dictionary['CONCLUIDO']}</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">{dictionary['ATRASADO']}</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">{dictionary['PENDENTE']}</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">{dictionary['CANCELADO']}</button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Lista de PDIs */}
            {loading && <p className="text-center text-gray-600">Carregando PDIs...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}
            {!loading && !error && filteredPdis.length === 0 && (
                <p className="text-center text-gray-600">Nenhum PDI encontrado.</p>
            )}
            {!loading && !error && filteredPdis.length > 0 && (
                <div className="space-y-6">
                    {filteredPdis.map(pdi => (
                        <div key={pdi.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {pdi.destinatario ? pdi.destinatario.nome.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{pdi.destinatario ? pdi.destinatario.nome : 'Usuário não encontrado'}</h3>
                                        <p className="text-sm text-gray-600">{pdi.destinatario ? `${pdi.destinatario.cargo} • ${pdi.destinatario.setor}` : 'Cargo • Departamento'}</p>
                                    </div>
                                </div>
                                {/* Status do PDI */}
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
                            {/* Título e descrição do PDI */}
                            <h4 className="text-md font-semibold mb-2">{pdi.titulo}</h4>
                            {/* Datas do PDI */}
                            <div className="flex justify-between text-sm text-gray-600 mb-4">
                                <span>Início: {formatDate(pdi.dataInicio)}</span>
                                <span>Término: {formatDate(pdi.dataFim)}</span>
                            </div>
                            {/* Barra de Progresso (Calculo a partir dos marcos - Implementar) */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Progresso</label>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    {/* Calcular e definir o width da barra de progresso */}
                                    {/* Exemplo: style={{ width: '65%' }} */}
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div> {/* Placeholder */}
                                </div>
                                <p className="text-sm text-gray-600 text-right mt-1">0%</p> {/* Placeholder */}
                            </div>
                            {/* Link para Visualizar PDI individual */}
                            <div className="text-right">
                                {/* Link para a página do PDI individual. Precisamos de uma rota para isso. */}
                                <Link to={`/all-pdi/${pdi.id}`} className="text-blue-600 hover:underline flex items-center justify-end">
                                    <Eye className="mr-1 h-4 w-4" /> Visualizar
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Renderiza o modal APENAS quando showCreateModal for true */}
            {showCreateModal && (
                <CreatePdiModal
                    isOpen={showCreateModal}
                    onClose={handleCloseCreateModal}
                    onSuccess={handlePdiCreatedSuccess}
                />
            )}
        </div>
    );
};

export default AllPDIs;