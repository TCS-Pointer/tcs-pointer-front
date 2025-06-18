import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Users, UserPlus, Ban, CheckCircle2, Pencil } from "lucide-react";
import UserCreateModal from '../../components/admin/UserCreateModal';
import UserEditModal from '../../components/admin/UserEditModal';
import UserFilters from '../../components/admin/UserFilters';
import CenteredToast from '../../components/ui/CenteredToast';
import { useAuth } from '../../contexts/AuthContext';
import UserStatsCards from '../../components/admin/UserStatsCards';

const UserCard = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    tipoUsuario: '',
    setor: '',
    status: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Função para mostrar o toast
  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Função para carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Carregando usuários com filtros:', filters);
      const data = await userService.getUsers(page, filters);
      console.log('Resposta da API:', data);
      setUsers(data?.content || []);
      setTotalUsers(data?.totalElements || 0);
    } catch (err) {
      console.error('Erro detalhado ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const handleStatusChange = async (email) => {
    try {
      await userService.updateUserStatus(email, loggedUser.email);
      const data = await userService.getUsers(page, filters);
      setUsers(data?.content || []);
      setTotalUsers(data?.totalElements || 0);
      showToast('Status do usuário atualizado com sucesso!', 'success');
      setStatsRefreshKey(prev => prev + 1);
    } catch (error) {
      showToast('Erro ao alterar status do usuário', 'error');
    }
  };

  // Modal handlers
  const handleEditUser = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };
  const handleCreateUser = () => {
    setEditUser(null);
    setShowCreateModal(true);
  };
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditUser(null);
  };

  // Funções de salvar
  const handleCreateUserSave = (form) => {
    showToast('Usuário criado!');
    handleCloseModal();
    loadUsers();
    setStatsRefreshKey(prev => prev + 1);
  };
  const handleEditUserSave = (form) => {
    showToast('Usuário atualizado!');
    handleCloseModal();
    loadUsers();
    setStatsRefreshKey(prev => prev + 1);
  };

  const handleFilterChange = (newFilters) => {
    console.log('UserManagement recebeu novos filtros:', newFilters);
    setFilters(newFilters);
    setPage(0); // Reset page when filters change
  };

  return (
    <div className="space-y-6">
      <CenteredToast open={toastOpen} message={toastMsg} type={toastType} onClose={() => setToastOpen(false)} />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <Button onClick={handleCreateUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>
      {/* Cards */}
      <UserStatsCards refreshKey={statsRefreshKey} />
      {/* Filtros */}
      <UserFilters onFilterChange={handleFilterChange} />
      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : !users || users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{user.nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.setor}</TableCell>
                    <TableCell>{user.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.tipoUsuario === 'ADMIN' ? 'bg-black text-white' : user.tipoUsuario === 'GESTOR' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}>
                        {user.tipoUsuario === 'ADMIN' ? 'Administrador' : user.tipoUsuario === 'GESTOR' ? 'Gestor' : 'Colaborador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={user.status === 'ATIVO' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}
                      >
                        {user.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {loggedUser?.email !== user.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(user.email)}
                        >
                          {user.status === 'ATIVO' ? (
                            <Ban className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {users?.length || 0} de {totalUsers} resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!users || users.length < 10}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Modais */}
      <UserCreateModal
        open={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateUserSave}
      />
      {editUser && (
        <UserEditModal
          open={showEditModal}
          onClose={handleCloseModal}
          onSave={handleEditUserSave}
          user={editUser}
        />
      )}
    </div>
  );
};

export default UserManagement; 