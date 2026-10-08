import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/Logo_Rei_Do_Cabecote.jpg';
import { HashLink } from 'react-router-hash-link';
import { FaBars, FaCar, FaChartLine, FaCog, FaHome, FaSignOutAlt, FaStore, FaTimes, FaTools, FaTruck, FaUserShield, FaUsers } from 'react-icons/fa';
import '../styles/management.css';
import '../styles/admin-ui.css';

const managementLinks = [
    { label: 'Visão geral', path: '/dashboard', icon: FaChartLine },
    { label: 'Clientes', path: '/clientes', icon: FaUsers },
    { label: 'Veículos', path: '/veiculos', icon: FaCar },
    { label: 'Peças', path: '/pecas', icon: FaCog },
    { label: 'Fornecedores', path: '/fornecedores', icon: FaTruck },
    { label: 'Usuários', path: '/usuarios', icon: FaUserShield },
    { label: 'Serviços', path: '/servicos', icon: FaTools },
    { label: 'Produtos à venda', path: '/produtos-venda', icon: FaStore },
];

const Layout = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setMenuOpen(false);
    const activeLink = managementLinks.find(({ path }) =>
        location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
    const pageTitle = activeLink?.label || 'Visão geral';

    if (isLoggedIn) {
        return (
            <div className="app-container is-authenticated admin-shell">
                <aside className={`admin-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação administrativa">
                    <Link to="/dashboard" className="admin-brand" onClick={closeMenu} aria-label="Rei do Cabeçote, painel">
                        <img src={logo} alt="" className="admin-brand-logo" />
                        <span>REI DO <strong>CABEÇOTE</strong></span>
                    </Link>

                    <div className="admin-sidebar-caption">
                        <span>Workspace</span>
                        <strong>Gestão da oficina</strong>
                    </div>

                    <nav className="admin-nav">
                        {managementLinks.map(({ label, path, icon: LinkIcon }) => {
                            const isActive = location.pathname === path
                                || location.pathname.startsWith(`${path}/`)
                                || (path === '/dashboard' && location.pathname === '/');
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={closeMenu}
                                    className={`admin-nav-link ${isActive ? 'is-active' : ''}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {React.createElement(LinkIcon, { 'aria-hidden': true })}
                                    <span>{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="admin-sidebar-footer">
                        <button className="admin-logout" onClick={handleLogout}>
                            <FaSignOutAlt aria-hidden="true" />
                            <span>Sair da conta</span>
                        </button>
                    </div>
                </aside>

                {menuOpen && (
                    <button
                        className="admin-sidebar-backdrop"
                        aria-label="Fechar menu"
                        onClick={closeMenu}
                    />
                )}

                <div className="admin-workspace">
                    <header className="admin-header">
                        <button
                            className="admin-menu-toggle"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        <div className="admin-header-title">
                            <span>Painel administrativo</span>
                            <strong>{pageTitle}</strong>
                        </div>
                        <div className="admin-profile">
                            <span className="admin-profile-avatar">RC</span>
                            <span><strong>Rei do Cabeçote</strong><small>Administração</small></span>
                        </div>
                    </header>

                    <main className="admin-main content-container management-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="header">
                <Link to="/" className="brand" aria-label="Rei do Cabeçote, início">
                    <img src={logo} alt="" className="brand-logo" />
                    <span className="brand-name">REI DO <strong>CABEÇOTE</strong></span>
                </Link>
                <nav className="navbar">
                    <Link to="/"><FaHome aria-hidden="true" /> Home</Link>
                    <HashLink smooth to="/#nossos-produtos">Nossos Produtos</HashLink>
                    <HashLink smooth to="/#sobre-nos">Sobre nós</HashLink>
                </nav>
                <div className="header-buttons">
                    <Link to="/login" className="btn-entrar">Entrar</Link>
                </div>
            </header>
            <main className="content-container">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
