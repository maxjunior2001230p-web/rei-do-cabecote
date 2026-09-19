import React, { useState, useEffect } from 'react';
import './HomePage.css';
import cabecoteMotor from '../assets/Logo_Rei_Do_Cabecote.jpg';
import { 
    FaArrowRight
} from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import api from '../services/api';

// --- IMPORTAÇÕES PARA OS GRÁFICOS ---
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// --- REGISTRO DOS COMPONENTES DO CHART.JS ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// --- IMPORTAÇÕES PARA FILTRO E RELATÓRIO ---
import { Button } from 'primereact/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

const HomePage = () => {
    const { isLoggedIn } = useAuth();

    const [produtosVitrine, setProdutosVitrine] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardMetrics, setDashboardMetrics] = useState({
        clientes: 0,
        veiculos: 0,
        servicos: 0,
        produtos: 0,
        estoque: 0,
        emAndamento: 0,
        pendentes: 0,
        faturamento: 0
    });

    // --- ESTADO PARA O GRÁFICO DE VEÍCULOS ---
    const [veiculosChartData, setVeiculosChartData] = useState({ labels: [], datasets: [] });
    const [relatorioVeiculosData, setRelatorioVeiculosData] = useState([]);

    // --- ESTADOS PARA FATURAMENTO ---
    const [faturamentoData, setFaturamentoData] = useState({ labels: [], datasets: [] });
    const [faturamentoOriginal, setFaturamentoOriginal] = useState([]);
    
    // Novo estado para controlar a paginação do gráfico (offset a partir do final)
    const [pageOffset, setPageOffset] = useState(0); 

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return null;
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // 1. Carrega produtos da vitrine
    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                setLoading(true);
                const response = await api.get('/produtosvenda');
                const produtosDisponiveis = response.data.filter(p => p.statusVenda === 'DISPONIVEL');
                setProdutosVitrine(produtosDisponiveis);
            } catch (error) {
                console.error("Erro vitrine:", error);
            } finally {
                setLoading(false);
            }
        };
        if (!isLoggedIn) fetchProdutos();
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const carregarMetricas = async () => {
            try {
                const [clientesResponse, veiculosResponse, servicosResponse, produtosResponse] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/veiculos'),
                    api.get('/servicos'),
                    api.get('/produtosvenda')
                ]);

                const servicos = servicosResponse.data;
                const produtosDisponiveis = produtosResponse.data.filter((produto) => produto.statusVenda === 'DISPONIVEL');

                setDashboardMetrics({
                    clientes: clientesResponse.data.length,
                    veiculos: veiculosResponse.data.length,
                    servicos: servicos.length,
                    produtos: produtosDisponiveis.length,
                    estoque: produtosDisponiveis.reduce((total, produto) => total + Number(produto.quantidade || 0), 0),
                    emAndamento: servicos.filter((servico) => servico.status === 'Em andamento').length,
                    pendentes: servicos.filter((servico) => servico.status === 'Pendente').length,
                    faturamento: servicos.reduce((total, servico) => total + Number(servico.preco || 0), 0)
                });
            } catch (error) {
                console.error('Erro ao carregar metricas:', error);
            }
        };

        carregarMetricas();
    }, [isLoggedIn]);
    

    // 2. Carrega dados do Gráfico de Veículos
    useEffect(() => {
        if (isLoggedIn) {
            const carregarGraficoVeiculos = async () => {
                try {
                    const response = await api.get('/servicos/relatorios/carros-mais-frequentes');
                    const dadosBackend = response.data; 

                    const mapaAgrupado = {};
                    Object.entries(dadosBackend).forEach(([chave, valor]) => {
                        let modeloNome = chave;
                        if (chave.includes(' - ')) {
                            const partes = chave.split(' - ');
                            if (partes.length > 1) modeloNome = partes[1].trim(); 
                        }
                        if (!mapaAgrupado[modeloNome]) mapaAgrupado[modeloNome] = 0;
                        mapaAgrupado[modeloNome] += valor;
                    });

                    const listaOrdenada = Object.entries(mapaAgrupado)
                        .map(([modelo, qtd]) => ({ modelo, qtd }))
                        .sort((a, b) => b.qtd - a.qtd);

                    setRelatorioVeiculosData(listaOrdenada);
                    const top5 = listaOrdenada.slice(0, 5);

                    setVeiculosChartData({
                        labels: top5.map(item => item.modelo),
                        datasets: [{
                            label: 'Serviços Realizados',
                            data: top5.map(item => item.qtd),
                            backgroundColor: 'rgba(255, 152, 0, 0.7)',
                            borderColor: 'rgba(255, 152, 0, 1)',
                            borderWidth: 1,
                        }],
                    });
                } catch (error) {
                    console.error("Erro gráfico veículos:", error);
                }
            };
            carregarGraficoVeiculos();
        }
    }, [isLoggedIn]);

   
    // 3. Carrega Faturamento (Dados Brutos)
    useEffect(() => {
        if (isLoggedIn) {
            const carregarFaturamento = async () => {
                try {
                    const response = await api.get('/servicos');
                    const servicos = response.data;
                    const fatMap = {};
                    servicos.forEach(s => {
                        if (!s.dataPrevista || s.preco == null) return;
                        const dataRef = new Date(s.dataPrevista);
                        if (!dataRef || isNaN(dataRef)) return;
                        const mes = dataRef.getMonth() + 1;
                        const ano = dataRef.getFullYear();
                        const key = `${ano}-${String(mes).padStart(2, '0')}`;
                        if (!fatMap[key]) fatMap[key] = 0;
                        fatMap[key] += s.preco;
                    });
                    
                    const keys = Object.keys(fatMap).sort();
                    const listaFormatada = keys.map(k => {
                        const [ano, mes] = k.split('-');
                        return { key: k, label: `${mes}/${ano}`, valor: fatMap[k] };
                    });
                    
                    setFaturamentoOriginal(listaFormatada);
                } catch (error) {
                    console.error('Erro faturamento:', error);
                }
            };
            carregarFaturamento();
        }
    }, [isLoggedIn]);

    // 4. Lógica de Paginação (Mostrar apenas 3 meses)
    useEffect(() => {
        if (faturamentoOriginal.length === 0) return;

        // Calcula os índices para fatiar o array
        const totalItems = faturamentoOriginal.length;
        const itemsPerPage = 3;
        
        // Define o índice final baseado no offset (0 = fim da lista)
        let endIndex = totalItems - pageOffset;
        if (endIndex > totalItems) endIndex = totalItems;
        if (endIndex < 0) endIndex = 0;

        // Define o índice inicial (3 meses antes do final)
        let startIndex = endIndex - itemsPerPage;
        if (startIndex < 0) startIndex = 0;

        // Pega apenas a fatia dos dados
        const dadosVisiveis = faturamentoOriginal.slice(startIndex, endIndex);

        setFaturamentoData({
            labels: dadosVisiveis.map(f => f.label),
            datasets: [{
                label: 'Faturamento Mensal (R$)',
                data: dadosVisiveis.map(f => f.valor),
                backgroundColor: 'rgba(255, 152, 0, 0.6)',
                borderColor: 'rgba(255, 152, 0, 1)',
                borderWidth: 1,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            }],
        });

    }, [faturamentoOriginal, pageOffset]);

    // Funções de Navegação
    const handlePrevMonth = () => {
        // Aumenta o offset para ir para trás no tempo
        if (faturamentoOriginal.length > 0 && (faturamentoOriginal.length - pageOffset) > 0) {
            setPageOffset(prev => prev + 1);
        }
    };

    const handleNextMonth = () => {
        // Diminui o offset para ir para frente (mais recente)
        if (pageOffset > 0) {
            setPageOffset(prev => prev - 1);
        }
    };

    const gerarRelatorioFaturamento = () => {
        // Gera relatório baseado no que está VISÍVEL no gráfico
        const dados = faturamentoData.labels.map((label, i) => ({
            mes: label,
            valor: faturamentoData.datasets[0].data[i]
        }));
        
        if (dados.length === 0) return;

        const total = dados.reduce((acc, d) => acc + d.valor, 0);
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Faturamento (Período Selecionado)', 105, 18, { align: 'center' });
        
        const periodoStr = `${dados[0].mes} até ${dados[dados.length - 1].mes}`;
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text(`Período: ${periodoStr}`, 105, 28, { align: 'center' });
        
        autoTable(doc, {
            startY: 38,
            head: [['Mês/Ano', 'Faturamento (R$)']],
            body: dados.map(d => [d.mes, d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })]),
            theme: 'striped',
            headStyles: { fillColor: [255, 152, 0], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 12, cellPadding: 3, halign: 'center' },
            margin: { left: 20, right: 20 }
        });
        
        const finalY = doc.lastAutoTable.finalY || 48;
        doc.setFontSize(13);
        doc.setTextColor(230, 138, 25);
        doc.text(`Total do período: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 105, finalY + 12, { align: 'center' });
        doc.save('relatorio_faturamento_periodo.pdf');
    };

    const gerarRelatorioVeiculos = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Frequência de Veículos (Modelos)', 105, 18, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        doc.text(`Total de Modelos Diferentes: ${relatorioVeiculosData.length}`, 105, 28, { align: 'center' });

        autoTable(doc, {
            startY: 38,
            head: [['Modelo', 'Qtd. Serviços']],
            body: relatorioVeiculosData.map(v => [v.modelo, v.qtd]),
            theme: 'striped',
            headStyles: { fillColor: [255, 152, 0], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 12, cellPadding: 3, halign: 'center' },
            margin: { left: 20, right: 20 }
        });
        doc.save('relatorio_veiculos.pdf');
    };

    if (isLoggedIn) {
        const veiculosOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    bottom: 20, // Padding para não cortar legenda
                    left: 10,
                    right: 10
                }
            },
            plugins: {
                legend: { display: false },
                    title: { display: false },
                tooltip: {
                    callbacks: { title: (context) => context[0].label }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#ccc', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { 
                        color: '#ccc',
                        maxRotation: 45,
                        minRotation: 0,
                        autoSkip: false,
                        callback: function(value) {
                            const label = this.getLabelForValue(value);
                            if (label.length > 15) return label.substring(0, 15) + '...';
                            return label;
                        }
                    },
                    grid: { display: false, color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };

        const faturamentoOptions = {
            responsive: true,
            maintainAspectRatio: false,
            // 3. Adicionado padding para a legenda não vazar
            layout: {
                padding: { left: 10, right: 10, top: 10, bottom: 20 }
            },
            plugins: {
                legend: { 
                    position: 'top', 
                    labels: { color: '#fff' } 
                },
                title: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        color: '#ccc',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        },
                        padding: 4
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ccc' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        };

        return (
            <div className="management-container">
                <span className="dashboard-kicker">Visão operacional</span>
                <h1 className="management-title">Dashboard e informações</h1>
                <p className="management-subtitle">Acompanhe o movimento da oficina e acesse rapidamente cada área da operação.</p>

                <section className="dashboard-overview" aria-label="Resumo da operação">
                    <div className="dashboard-stat dashboard-stat-accent">
                        <span className="dashboard-stat-label">Clientes ativos</span>
                        <strong>{dashboardMetrics.clientes}</strong>
                        <small>base cadastrada</small>
                    </div>
                    <div className="dashboard-stat">
                        <span className="dashboard-stat-label">Veículos</span>
                        <strong>{dashboardMetrics.veiculos}</strong>
                        <small>em acompanhamento</small>
                    </div>
                    <div className="dashboard-stat">
                        <span className="dashboard-stat-label">Serviços</span>
                        <strong>{dashboardMetrics.servicos}</strong>
                        <small>ordens registradas</small>
                    </div>
                    <div className="dashboard-stat">
                        <span className="dashboard-stat-label">Produtos disponíveis</span>
                        <strong>{dashboardMetrics.produtos}</strong>
                        <small>na vitrine de vendas</small>
                    </div>
                </section>

                <section className="dashboard-insights" aria-label="Indicadores de acompanhamento">
                    <div className="dashboard-insight">
                        <span className="dashboard-insight-label">Atenção operacional</span>
                        <strong>{dashboardMetrics.emAndamento + dashboardMetrics.pendentes} serviços</strong>
                        <div className="dashboard-status-list">
                            <span><i className="status-dot status-dot-warning" />{dashboardMetrics.emAndamento} em andamento</span>
                            <span><i className="status-dot status-dot-neutral" />{dashboardMetrics.pendentes} pendentes</span>
                        </div>
                    </div>
                    <div className="dashboard-insight">
                        <span className="dashboard-insight-label">Estoque de vitrine</span>
                        <strong>{dashboardMetrics.estoque} unidades</strong>
                        <span className="dashboard-insight-note">disponíveis para venda</span>
                    </div>
                    <div className="dashboard-insight dashboard-insight-value">
                        <span className="dashboard-insight-label">Valor dos serviços</span>
                        <strong>{formatCurrency(dashboardMetrics.faturamento)}</strong>
                        <span className="dashboard-insight-note">considerando registros carregados</span>
                    </div>
                </section>
                
                <div className="management-charts-container">
                    
                    {/* --- GRÁFICO DE VEÍCULOS --- */}
                    <div className="chart-wrapper">
                        <div className="chart-header">
                            <div>
                                <span className="chart-kicker">Frequência de atendimento</span>
                                <h2>Modelos mais atendidos</h2>
                                <p>Os cinco modelos com maior recorrência de serviços.</p>
                            </div>
                            <Button 
                                label="Exportar" 
                                icon="pi pi-file-pdf" 
                                onClick={gerarRelatorioVeiculos} 
                                className="chart-report-button"
                            />
                        </div>
                        {veiculosChartData.labels && veiculosChartData.labels.length > 0 ? (
                            <Bar options={veiculosOptions} data={veiculosChartData} />
                        ) : (
                            <div style={{color: '#fff', textAlign: 'center', marginTop: '50px'}}>
                                <p>Carregando dados...</p>
                            </div>
                        )}
                    </div>

                    {/* --- GRÁFICO DE FATURAMENTO --- */}
                    <div className="chart-wrapper">
                        <div className="chart-header chart-header-revenue">
                            <div>
                                <span className="chart-kicker">Desempenho financeiro</span>
                                <h2>Faturamento mensal</h2>
                                <p>Compare os últimos períodos registrados.</p>
                            </div>
                            <div className="chart-header-actions">
                                <Button 
                                    icon="pi pi-chevron-left" 
                                    onClick={handlePrevMonth}
                                    disabled={faturamentoOriginal.length - pageOffset <= 0}
                                    className="chart-nav-button"
                                    tooltip="Meses Anteriores"
                                />
                                <Button 
                                    icon="pi pi-chevron-right" 
                                    onClick={handleNextMonth}
                                    disabled={pageOffset === 0}
                                    className="chart-nav-button"
                                    tooltip="Meses Seguintes"
                                />
                                <Button label="Exportar" icon="pi pi-file-pdf" onClick={gerarRelatorioFaturamento} className="chart-report-button" />
                            </div>
                        </div>
                        
                        {faturamentoData.labels && faturamentoData.labels.length > 0 ? (
                            <Bar options={faturamentoOptions} data={faturamentoData} />
                        ) : (
                             <div style={{color: '#fff', textAlign: 'center', marginTop: '50px'}}>
                                <p>Sem dados de faturamento para exibir.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        );
    }

    return (
        // ... (Mantém o JSX da Home Page pública igual ao original)
        <>
            <div id="sobre-nos" className="hero">
                <div className="hero-content">
                    <span className="welcome-text">BEM-VINDOS!</span>
                    <h1>RETIFICA REI DO CABEÇOTE: ESPECIALISTAS EM CABEÇOTES</h1>
                    <p>Desde 2021, somos dedicados à recuperação e retífica de cabeçotes de motor...</p>
                    <a href="https://wa.me/5531984581412" className="btn-whatsapp" target="_blank" rel="noopener noreferrer">
                        Fale Conosco no WhatsApp <FaArrowRight size={20} />
                    </a>
                </div>
                <div className="hero-image-container">
                    <img src={cabecoteMotor} alt="Cabeçote de Motor" />
                </div>
            </div>
            {!loading && produtosVitrine.length > 0 && (
                <section id="nossos-produtos" className="produtos-vitrine-container">
                    <div className="section-heading">
                        <span className="section-kicker">Disponíveis agora</span>
                        <h2 className="produtos-vitrine-titulo">Nossos Produtos</h2>
                        <p>Peças selecionadas para manter seu motor em movimento.</p>
                    </div>
                    <div className="produtos-vitrine-grid">
                        {produtosVitrine.map((produto) => (
                            <article key={produto.id} className="produto-card">
                                {produto.nomeArquivoImagem ? (
                                    <img src={`${BACKEND_URL}/imagens/${produto.nomeArquivoImagem}`} alt={produto.nome} className="produto-card-imagem" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.classList.add('produto-card-imagem-vazia'); }} />
                                ) : (
                                    <div className="produto-card-imagem produto-card-imagem-vazia" aria-hidden="true" />
                                )}
                                <div className="produto-card-conteudo">
                                    <h3 className="produto-card-nome">{produto.nome}</h3>
                                    <p className="produto-card-preco">{formatCurrency(produto.precoVenda)}</p>
                                    <p className="produto-card-descricao">{produto.descricao || 'Produto sem descrição.'}</p>
                                    <a href="https://wa.me/5531984581412" target="_blank" rel="noopener noreferrer" className="produto-card-botao">Tenho Interesse <FaArrowRight size={14} /></a>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
};

export default HomePage;