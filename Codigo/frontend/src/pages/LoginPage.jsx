import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../auth/AuthContext'; 
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const toast = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth(); 

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha o email e a senha.' });
            return;
        }

        try {
            const response = await api.post('/auth/login', { email, password });
            const token = response.data;
            
            login(token); 
            
            navigate(from, { replace: true }); 

        } catch (error) {
            console.error("Erro no login:", error);
            const errorMessage = error.response?.data || "Usuário ou senha inválidos.";
            toast.current.show({ severity: 'error', summary: 'Erro no Login', detail: errorMessage });
        }
    };

    return (
        <div className="login-page-container">
            <Toast ref={toast} />
            <div className="login-intro">
                <span className="login-kicker"><FaLock /> Ambiente protegido</span>
                <h1>Gestão que mantém tudo em movimento.</h1>
                <p>Acesse o painel do Rei do Cabeçote para acompanhar sua operação.</p>
            </div>
            <Card title="Acessar o sistema" className="login-card">
                <form onSubmit={handleLogin} className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="email">Email</label>
                        <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="seu@email.com" />
                    </div>
                    <div className="p-field">
                        <label htmlFor="password">Senha</label>
                        <div className="password-input-wrapper">
                            <InputText id="password" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                                title={showPassword ? 'Ocultar senha' : 'Visualizar senha'}
                            >
                                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                    <Button type="submit" label="Entrar no painel" icon="pi pi-arrow-right" iconPos="right" className="p-mt-2" />
                </form>
                <Link to="/" className="login-back"><FaArrowLeft /> Voltar para o site</Link>
            </Card>
        </div>
    );
};

export default LoginPage;