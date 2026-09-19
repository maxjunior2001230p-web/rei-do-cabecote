import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Para verificar o token inicial

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsLoggedIn(true);
        }
        setIsLoading(false); // Termina a verificação
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
    };

    // Não renderiza nada até que a verificação inicial do token seja concluída
    if (isLoading) {
        return null; // Ou um componente de loading
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado para usar o contexto de autenticação facilmente
export const useAuth = () => {
    return useContext(AuthContext);
};
