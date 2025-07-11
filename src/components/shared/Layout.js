import React from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import pointerIcon from '../../components/ico/image.png';

const ICONS = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  feedbacks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  comunicados: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  pdi: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  relatorios: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
};

const MENU_CONFIG = {
  admin: [
    { to: "/admin/comunicados", label: "Comunicados", icon: ICONS.comunicados },
    { to: "/admin/feedbacks", label: "Todos os Feedbacks", icon: ICONS.feedbacks },
    { to: "/meus-feedbacks", label: "Meu Feedback", icon: ICONS.feedbacks },
    { to: "/meu-pdi", label: "PDI", icon: ICONS.pdi },
    { to: "/admin/users", label: "Usuários", icon: ICONS.users },
    { to: "/admin/relatorios", label: "Relatórios", icon: ICONS.relatorios }
  ],
  gestor: [
    { to: "/comunicados", label: "Comunicados", icon: ICONS.comunicados },
    { to: "/meus-feedbacks", label: "Meu Feedback", icon: ICONS.feedbacks },
    { to: "/meu-pdi", label: "Meu PDI", icon: ICONS.pdi },
  ],
  colaborador: [
    { to: "/comunicados", label: "Comunicados", icon: ICONS.comunicados },
    { to: "/meus-feedbacks", label: "Meu Feedback", icon: ICONS.feedbacks },
    { to: "/meu-pdi", label: "Meu PDI", icon: ICONS.pdi },
  ]
};

const NavItem = ({ to, icon, children, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
      }`}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role || 'colaborador';
  const menuItems = MENU_CONFIG[role] || MENU_CONFIG['colaborador'];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <img src={pointerIcon} alt="Logo" className="h-8" />
            <span className="text-xl font-semibold">Pointer</span>
          </div>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map(item => (
            <NavItem
              key={item.to}
              to={item.to}
              isActive={location.pathname === item.to}
              icon={item.icon}
            >
              {item.label}
            </NavItem>
          ))}
          
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link to="/perfil" className="flex items-center space-x-2 flex-1 cursor-pointer group hover:bg-gray-100 rounded px-2 py-1 transition-colors">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 hover:underline max-w-[120px] truncate" title={user?.name}>{user?.name || 'Usuário'}</p
                >
                <p
                  className="text-gray-500 max-w-[120px] truncate hover:underline"
                  title={user?.email}
                >
                  {user?.email}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 