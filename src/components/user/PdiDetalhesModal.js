import React, { useState } from 'react';
import api from '../../services/api';
import { dictionary, formatDate } from "../../utils/Dictionary";
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const PdiDetalhesModal = ({ isOpen, onClose, pdi, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [marcos, setMarcos] = useState(pdi?.marcos || []);
    const [loadingMarco, setLoadingMarco] = useState(null);

    React.useEffect(() => {
        setMarcos(pdi?.marcos || []);
    }, [pdi]);

    const handleConcluirMarco = async (idMarco) => {
        if (!pdi?.id) return;
        setLoadingMarco(idMarco);
        try {
            await api.patch(`/pdi/${pdi.id}/status`, {
                idMarco,
                statusMarco: 'CONCLUIDO'
            });
            setMarcos(marcos.map(m => m.id === idMarco ? { ...m, status: 'CONCLUIDO' } : m));
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Erro ao atualizar status do marco!');
        } finally {
            setLoadingMarco(null);
        }
    };

    if (!isOpen || !pdi) return null;

    const totalMarcos = marcos.length;
    const concluidos = marcos.filter(m => m.status === 'CONCLUIDO' || m.status === 'Concluído').length;
    const progresso = totalMarcos > 0 ? Math.round((concluidos / totalMarcos) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        {pdi.destinatario?.nome ? pdi.destinatario.nome.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{pdi.destinatario?.nome}</h2>
                        <p className="text-sm text-gray-600">{pdi.destinatario?.cargo} • {pdi.destinatario?.setor}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 text-sm font-medium rounded-full ${pdi.status === 'ATIVO' || pdi.status === 'EM_ANDAMENTO' ? 'bg-green-100 text-green-800' :
                        pdi.status === 'CONCLUIDO' ? 'bg-blue-100 text-blue-800' :
                            pdi.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                                pdi.status === 'CANCELADO' ? 'bg-yellow-100 text-yellow-800' :
                                    pdi.status === 'PENDENTE' ? 'bg-gray-100 text-gray-800' :
                                        'bg-gray-100 text-gray-800'
                        }`}>
                        {dictionary[pdi.status] || pdi.status}
                    </span>
                </div>
                <h3 className="text-2xl font-bold mb-2">{pdi.titulo}</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progresso Geral</label>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progresso}%` }}></div>
                    </div>
                    <div className="text-right text-sm text-gray-700 font-semibold mt-1">{progresso}%</div>
                </div>
                <div className="flex mb-4">
                    <button
                        className={`flex-1 py-2 px-4 rounded-tl rounded-bl font-semibold ${activeTab === 'info' ? 'bg-gray-100' : 'bg-gray-200'} border border-b-0`}
                        onClick={() => setActiveTab('info')}
                    >
                        Informações
                    </button>
                    <button
                        className={`flex-1 py-2 px-4 rounded-tr rounded-br font-semibold ${activeTab === 'marcos' ? 'bg-gray-100' : 'bg-gray-200'} border border-b-0`}
                        onClick={() => setActiveTab('marcos')}
                    >
                        Marcos e Etapas
                    </button>
                </div>
                {activeTab === 'info' && (
                    <div>
                        <p className="mb-4 text-gray-700"><b>Descrição e Objetivos</b><br />{pdi.descricao}</p>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <div>
                                <b>Período</b><br />
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-500" /> Início: {formatDate(pdi.dataInicio)}</span><br />
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-500" /> Término: {formatDate(pdi.dataFim)}</span>
                            </div>
                            <div>
                                <b>Gestor Responsável</b><br />
                                <span className="inline-flex items-center gap-2"><span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-bold">MS</span>{pdi?.idUsuario}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Resumo dos Marcos</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Total de marcos: {totalMarcos}</span>
                                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Marcos concluídos: {concluidos}</span>
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /> Marcos pendentes: {totalMarcos - concluidos}</span>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'marcos' && (
                    <div className="pt-4 space-y-4">
                        {marcos.length > 0 ? (
                            marcos.map((marco, idx) => (
                                <div key={marco.id || idx} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-start mb-2 px-6 pt-4">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-semibold text-gray-800 text-base mb-1">{marco.titulo}</h4>
                                            <p className="text-sm text-gray-600 mb-1">{marco.descricao}</p>
                                            <p className="text-xs text-gray-500">Prazo: {formatDate(marco.dtFinal)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-4 mt-2 pb-4 px-6">
                                        <span className={`px-2 py-1 text-xs rounded-full ${marco.status === 'CONCLUIDO' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                            {dictionary[marco.status] || marco.status}
                                        </span>
                                        {marco.status !== 'CONCLUIDO' && (
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={false}
                                                    disabled={loadingMarco === marco.id}
                                                    onChange={() => handleConcluirMarco(marco.id)}
                                                />
                                                <span className="text-sm text-gray-700">Marcar como concluído</span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-3 text-gray-500 text-center">Nenhum marco cadastrado.</p>
                        )}
                    </div>
                )}
                <div className="flex justify-end gap-2 mt-6">
                    <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>Fechar</button>
                </div>
            </div>
        </div>
    );
};

export default PdiDetalhesModal; 