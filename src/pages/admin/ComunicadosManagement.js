import React, { useState, useEffect } from 'react';
import { comunicadoService } from '../../services/comunicadoService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ComunicadoModal from '../../components/admin/ComunicadoModal';
import ComunicadoDetalhesModal from '../../components/shared/ComunicadoDetalhesModal';

const ComunicadosManagement = () => {
  const { user } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingComunicado, setEditingComunicado] = useState(null);
  const [viewingComunicado, setViewingComunicado] = useState(null);

  const loadComunicados = async () => {
    try {
      setLoading(true);
      // O endpoint /comunicados retorna todos para o admin
      const data = await comunicadoService.getComunicados(user.sub);
      // A API retorna um objeto com uma propriedade 'content' que contém o array
      setComunicados(data.content || []);
    } catch (err) {
      setError('Erro ao carregar comunicados.');
      toast.error('Erro ao carregar comunicados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.sub) {
      loadComunicados();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este comunicado?')) {
      try {
        await comunicadoService.deleteComunicado(id);
        toast.success('Comunicado excluído com sucesso!');
        loadComunicados(); // Recarrega a lista
      } catch (err) {
        toast.error('Erro ao excluir comunicado.');
        console.error(err);
      }
    }
  };

  const handleCreate = () => {
    setEditingComunicado(null);
    setShowModal(true);
  };

  const handleEdit = (comunicado) => {
    setEditingComunicado(comunicado);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingComunicado(null);
  };

  const handleSave = () => {
    handleCloseModal();
    loadComunicados();
  };

  const handleViewDetails = (comunicado) => {
    setViewingComunicado(comunicado);
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'Data inválida';
    }
    // A data vem como "dd/MM/yyyy HH:mm:ss"
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    
    // Rearranja para "yyyy-MM-dd", que é um formato seguro para o new Date()
    const safeDate = new Date(`${year}-${month}-${day}`);
    
    if (isNaN(safeDate.getTime())) {
      return 'Data inválida';
    }

    return safeDate.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Comunicados</h1>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Comunicado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Comunicados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Setores</TableHead>
                <TableHead>Público</TableHead>
                <TableHead>Data de Publicação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Carregando...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center text-red-600">{error}</TableCell>
                </TableRow>
              ) : comunicados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Nenhum comunicado encontrado.</TableCell>
                </TableRow>
              ) : (
                comunicados.map((comunicado) => (
                  <TableRow 
                    key={comunicado.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewDetails(comunicado)}
                  >
                    <TableCell className="font-medium">{comunicado.titulo}</TableCell>
                    <TableCell>
                      {comunicado.setores?.length > 0
                        ? comunicado.setores.map(setor => <Badge key={setor} variant="secondary" className="mr-1">{setor}</Badge>)
                        : 'Todos'}
                    </TableCell>
                     <TableCell>
                      {comunicado.apenasGestores ? (
                        <Badge variant="outline">Apenas Gestores</Badge>
                      ) : (
                        <Badge variant="outline">Todos</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(comunicado.dataPublicacao)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(comunicado)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(comunicado.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ComunicadoModal
        open={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        comunicado={editingComunicado}
      />

      <ComunicadoDetalhesModal
        open={!!viewingComunicado}
        onClose={() => setViewingComunicado(null)}
        comunicado={viewingComunicado}
      />
    </div>
  );
};

export default ComunicadosManagement; 