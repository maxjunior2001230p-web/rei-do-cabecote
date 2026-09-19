import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'; // Importar useLocation
import { useAuth } from '../auth/AuthContext';
import logo from '../assets/Logo_Rei_Do_Cabecote.jpg';
import { HashLink } from 'react-router-hash-link';
import { FaBars, FaCar, FaChartLine, FaCog, FaHome, FaSignOutAlt, FaStore, FaTimes, FaTools, FaTruck, FaUserShield, FaUsers } from 'react-icons/fa';
import '../styles/management.css';

const Layout = () => {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Hook para obter a localização atual
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const managementLinks = [
        { label: 'Dashboard e informações', path: '/dashboard', icon: FaChartLine },
        { label: 'Clientes', path: '/clientes', icon: FaUsers },
        { label: 'Veículos', path: '/veiculos', icon: FaCar },
        { label: 'Peças', path: '/pecas', icon: FaCog },
        { label: 'Fornecedores', path: '/fornecedores', icon: FaTruck },
        { label: 'Usuários', path: '/usuarios', icon: FaUserShield },
        { label: 'Serviços', path: '/servicos', icon: FaTools },
        { label: 'Produtos à venda', path: '/produtos-venda', icon: FaStore },
    ];

    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    const closeMenu = () => setMenuOpen(false);

    return (
        <div className={`app-container ${isLoggedIn ? 'is-authenticated' : ''}`}>
            <header className="header">
                <Link to="/" className="brand" onClick={closeMenu} aria-label="Rei do Cabeçote, início">
                    <img src={logo} alt="" className="brand-logo" />
                    <span className="brand-name">REI DO <strong>CABEÇOTE</strong></span>
                </Link>

                {isLoggedIn ? (
                    <div className="header-actions">
                        <span className="account-label">Área administrativa</span>
                        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen}>
                            {menuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                        <button className="logout-button" onClick={handleLogout}>
                            <FaSignOutAlt /> <span>Sair</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <nav className="navbar">
                            <Link to="/"><FaHome aria-hidden="true" /> Home</Link>
                            <HashLink smooth to="/#nossos-produtos">Nossos Produtos</HashLink>
                            <HashLink smooth to="/#sobre-nos">Sobre nós</HashLink>
                        </nav>
                        <div className="header-buttons">
                            <Link to="/login" className="btn-entrar">Entrar</Link>
                        </div>
                    </>
                )}
            </header>

            {isLoggedIn && (
                <aside className={`management-sidebar ${menuOpen ? 'is-open' : ''}`}>
                    <div className="sidebar-heading">
                        <span className="sidebar-eyebrow">Workspace</span>
                        <strong>Gestão operacional</strong>
                    </div>
                    <nav className="sidebar-nav" aria-label="Navegação administrativa">
                        {managementLinks.map(({ label, path, icon: LinkIcon }) => (
                            <Link key={path} to={path} onClick={closeMenu} className={isActive(path) ? 'is-active' : ''}>
                                {React.createElement(LinkIcon, { 'aria-hidden': true })}
                                <span>{label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
            )}

            <main className={`content-container ${isLoggedIn ? 'management-content' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;