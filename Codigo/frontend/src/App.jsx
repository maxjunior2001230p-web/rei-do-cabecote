import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CrudFornecedor from './components/CrudFornecedor';
import CrudPecas from './components/CrudPecas';
import CrudUsuario from './components/CrudUsuario';
import CrudVeiculo from './components/CrudVeiculo';
import CrudCliente from './components/CrudCliente';
import CrudServico from './components/CrudServico';
import CrudProdutoVenda from './components/CrudProdutoVenda';


function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Rotas Públicas */}
                    <Route index element={<HomePage />} />
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="login" element={<LoginPage />} />

                       {/* Rotas Protegidas */}
                    <Route
                        path="veiculos"
                        element={
                            <ProtectedRoute>
                                <CrudVeiculo />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="pecas"
                        element={
                            <ProtectedRoute>
                                <CrudPecas />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="usuarios"
                        element={
                            <ProtectedRoute>
                                <CrudUsuario />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="fornecedores"
                        element={
                            <ProtectedRoute>
                                <CrudFornecedor />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="clientes"
                        element={
                            <ProtectedRoute>
                                <CrudCliente />
                            </ProtectedRoute>
                        }
                    />

                    
                    <Route
                        path="produtos-venda"
                        element={
                            <ProtectedRoute>
                                <CrudProdutoVenda />
                            </ProtectedRoute>
                        }
                    />
               
                    <Route
                        path="servicos"
                        element={
                            <ProtectedRoute>
                                <CrudServico />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="servicos/novo"
                        element={
                            <ProtectedRoute>
                                <CrudServico />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="servicos/editar/:id"
                        element={
                            <ProtectedRoute>
                                <CrudServico />
                            </ProtectedRoute>
                        }
                    />
   {/* Rota para páginas não encontradas */}
                   
                    <Route path="*" element={<h1>Página não encontrada</h1>} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;