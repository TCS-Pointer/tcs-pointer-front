import React, { useState } from 'react';
import api from '../../services/api';
import { dictionary, formatDate } from "../../utils/Dictionary";
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import pdiService from '../../services/pdiService';
import Toast from '../ui/Toast';

const PdiDetalhesModal = ({ isOpen, onClose, pdi, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('info');
    const [marcos, setMarcos] = useState(pdi?.marcos || []);
    const [loadingMarco, setLoadingMarco] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editablePdi, setEditablePdi] = useState({
        ...pdi,
        usuario: pdi?.usuario || {},
        destinatario: pdi?.destinatario || {}
    });
    const [editableMarcos, setEditableMarcos] = useState([]);
    const [toast, setToast] = useState(null);

    React.useEffect(() => {
        setMarcos(pdi?.marcos || []);
        setEditablePdi({
            ...pdi,
            usuario: pdi?.usuario || {},
            destinatario: pdi?.destinatario || {}
        });
        setEditableMarcos(pdi?.marcos ? pdi.marcos.map(m => ({ ...m })) : []);
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
            setToast({ message: 'Erro ao atualizar status do marco!', type: 'error' });
        } finally {
            setLoadingMarco(null);
        }
    };

    const handleSave = async () => {
        try {
            const updatedPdi = {
                titulo: editablePdi.titulo,
                descricao: editablePdi.descricao,
                dtInicio: editablePdi.dtInicio,
                dtFim: editablePdi.dtFim,
                iDdestinatario: editablePdi.iDdestinatario || pdi.iDdestinatario,
            };

            const response = await api.put(`/pdi/${pdi.id}`, updatedPdi);
            console.log('API Response Data:', response.data);
            setEditablePdi({
                ...response.data.content,
                usuario: response.data.content?.usuario || {},
                destinatario: response.data.content?.destinatario || {}
            });

            const marcoUpdatePromises = editableMarcos.map(async (marco) => {
                if (marco.id) {
                    const updatedMarcoData = {
                        titulo: marco.titulo,
                        descricao: marco.descricao,
                        dtFinal: marco.dtFinal,
                        pdiId: pdi.id
                    };
                    return pdiService.updateMarco(marco.id, updatedMarcoData);
                }
                return Promise.resolve(null);
            });

            const updatedMarcosResults = await Promise.all(marcoUpdatePromises);

            const newMarcosState = marcos.map(originalMarco => {
                const updated = updatedMarcosResults.find(result => result && result.id === originalMarco.id);
                return updated ? updated : originalMarco;
            });
            setMarcos(newMarcosState);
            setEditableMarcos(newMarcosState.map(m => ({ ...m })));

            setToast({ message: 'PDI e Marcos atualizados com sucesso!', type: 'success' });
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar PDI ou Marcos:', error);
            setToast({ message: 'Erro ao atualizar PDI ou Marcos. Verifique os dados e tente novamente.', type: 'error' });
        }
    };

    if (!isOpen || !pdi) return null;

    const totalMarcos = marcos.length;
    const concluidos = marcos.filter(m => m.status === 'CONCLUIDO' || m.status === 'Concluído').length;
    const progresso = totalMarcos > 0 ? Math.round((concluidos / totalMarcos) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        {editablePdi?.destinatario?.nome ? editablePdi.destinatario.nome.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{editablePdi?.destinatario?.nome}</h2>
                        <p className="text-sm text-gray-600">{editablePdi?.destinatario?.cargo} • {editablePdi?.destinatario?.setor}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 text-sm font-medium rounded-full ${editablePdi.status === 'ATIVO' || editablePdi.status === 'EM_ANDAMENTO' ? 'bg-green-100 text-green-800' :
                        editablePdi.status === 'CONCLUIDO' ? 'bg-blue-100 text-blue-800' :
                            editablePdi.status === 'ATRASADO' ? 'bg-red-100 text-red-800' :
                                editablePdi.status === 'CANCELADO' ? 'bg-yellow-100 text-yellow-800' :
                                    editablePdi.status === 'PENDENTE' ? 'bg-gray-100 text-gray-800' :
                                        'bg-gray-100 text-gray-800'
                        }`}>
                        {dictionary[editablePdi.status] || editablePdi.status}
                    </span>
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        className="w-full text-2xl font-bold mb-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editablePdi.titulo || ''}
                        onChange={(e) => setEditablePdi({ ...editablePdi, titulo: e.target.value })}
                    />
                ) : (
                    <h3 className="text-2xl font-bold mb-2">{editablePdi.titulo}</h3>
                )}
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
                        {isEditing ? (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição e Objetivos</label>
                                <textarea
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    value={editablePdi.descricao || ''}
                                    onChange={(e) => setEditablePdi({ ...editablePdi, descricao: e.target.value })}
                                ></textarea>
                            </div>
                        ) : (
                            <p className="mb-4 text-gray-700"><b>Descrição e Objetivos</b><br />{editablePdi.descricao}</p>
                        )}
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <div>
                                <b>Período</b><br />
                                {isEditing ? (
                                    <>
                                        <label className="block text-xs font-medium text-gray-500 mt-2">Início:</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editablePdi.dtInicio ? new Date(editablePdi.dtInicio).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditablePdi({ ...editablePdi, dtInicio: e.target.value })}
                                        />
                                        <label className="block text-xs font-medium text-gray-500 mt-2">Término:</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            value={editablePdi.dtFim ? new Date(editablePdi.dtFim).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditablePdi({ ...editablePdi, dtFim: e.target.value })}
                                        />
                                    </>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-500" /> Início: {formatDate(pdi.dtInicio)}</span>
                                        <span className="text-gray-400">—</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-500" /> Término: {formatDate(pdi.dtFim)}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <b>Gestor Responsável</b><br />
                                <span className="inline-flex items-center gap-2"><span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-bold">MS</span>{editablePdi?.usuario?.nome}</span>
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
                                            {isEditing ? (
                                                <div className="space-y-1">
                                                    <label className="block text-xs font-medium text-gray-500">Título:</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-base font-semibold text-gray-800"
                                                        value={editableMarcos[idx]?.titulo || ''}
                                                        onChange={(e) => {
                                                            const newMarcos = [...editableMarcos];
                                                            newMarcos[idx].titulo = e.target.value;
                                                            setEditableMarcos(newMarcos);
                                                        }}
                                                    />
                                                    <label className="block text-xs font-medium text-gray-500 mt-2">Descrição:</label>
                                                    <textarea
                                                        className="w-full p-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm text-gray-600"
                                                        rows="2"
                                                        value={editableMarcos[idx]?.descricao || ''}
                                                        onChange={(e) => {
                                                            const newMarcos = [...editableMarcos];
                                                            newMarcos[idx].descricao = e.target.value;
                                                            setEditableMarcos(newMarcos);
                                                        }}
                                                    ></textarea>
                                                    <label className="block text-xs font-medium text-gray-500 mt-2">Prazo:</label>
                                                    <input
                                                        type="date"
                                                        className="w-full p-1 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-gray-500"
                                                        value={editableMarcos[idx]?.dtFinal ? new Date(editableMarcos[idx].dtFinal).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => {
                                                            const newMarcos = [...editableMarcos];
                                                            newMarcos[idx].dtFinal = e.target.value;
                                                            setEditableMarcos(newMarcos);
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-gray-800 text-base mb-1">{marco.titulo}</h4>
                                                    <p className="text-sm text-gray-600 mb-1">{marco.descricao}</p>
                                                    <p className="text-xs text-gray-500">Prazo: {formatDate(marco.dtFinal)}</p>
                                                </>
                                            )}
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
                    {isEditing ? (
                        <>
                            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={handleSave}>Salvar</button>
                            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => {
                                setIsEditing(false);
                                setEditablePdi(pdi);
                                setEditableMarcos(pdi?.marcos ? pdi.marcos.map(m => ({ ...m })) : []);
                            }}>Cancelar</button>
                        </>
                    ) : (
                        <>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setIsEditing(true)}>Editar PDI</button>
                            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>Fechar</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PdiDetalhesModal; 