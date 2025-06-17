import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// Ícones (exemplo, pode precisar ajustar os caminhos ou usar lucide-react se disponível)
import { Calendar, FileText, Users, TrendingUp, Search } from 'lucide-react'; // Presumindo que lucide-react está instalado

const MeuPDIsOverview = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Meus PDIs</h1>
                <div className="flex space-x-4">
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" /> Informações Detalhadas
                    </Button>
                    <Button>
                        <span className="text-xl mr-1 mb-0.5">+</span> Novo PDI
                    </Button>
                </div>
            </div>

            <p className="text-gray-600">Visualize e gerencie todos os Planos de Desenvolvimento Individual</p>

            { }
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PDIs Ativos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">+12 novos este trimestre</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PDIs Concluídos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">+8 no último mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">58%</div>
                        <p className="text-xs text-muted-foreground">+5% comparado ao trimestre anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Colaboradores com PDI</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">74% do total de colaboradores</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seção de Filtros */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtros</h2>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full md:w-auto">
                        <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">Departamento</label>
                        {/* Substituir por componente Select real se necessário */}
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
                                {/* Adicionar outros departamentos aqui */}
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
                                <SelectItem value="ativos">Ativos</SelectItem>
                                <SelectItem value="concluidos">Concluídos</SelectItem>
                                <SelectItem value="atrasados">Atrasados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="hidden sm:block">
                        <nav className="flex space-x-4" aria-label="Tabs">
                            {/* Substituir por componente de Tabs real se necessário */}
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-blue-600 bg-blue-100">Ativos</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">Concluídos</button>
                            <button className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700">Atrasados</button>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Lista de PDIs (a ser implementada) */}
            <div className="space-y-6">
                {/* Aqui viriam os componentes de Card para cada PDI da lista */}
                <p className="text-gray-600 text-center">Lista de PDIs virá aqui...</p>
                {/* Exemplo de como um item da lista pode parecer (usaremos um componente dedicado depois) */}
                {/*
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">MS</div>
              <div>
                <h3 className="text-lg font-semibold">Maria Santos</h3>
                <p className="text-sm text-gray-600">Desenvolvedora Front-end • TI</p>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Ativo</span>
          </div>
          <h4 className="text-md font-semibold mb-2">Especialização em React e Next.js</h4>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Início: 15/01/2023</span>
            <span>Término: 15/07/2023</span>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Progresso</label>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-600 text-right mt-1">65%</p>
          </div>
          <div className="text-right">
            <Link to="/meu-pdi/algum-id-do-pdi" className="text-blue-600 hover:underline">Visualizar</Link>
          </div>
        </div>
        */}
            </div>
        </div>
    );
};

export default MeuPDIsOverview; 