import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './CrudUsuario.css'; 

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MultiSelect } from 'primereact/multiselect';
import ManagementFilters from './ManagementFilters';

const CrudServico = () => {
  const [servicos, setServicos] = useState([]);
  const [servicoDialog, setServicoDialog] = useState(false);
  const [deleteServicoDialog, setDeleteServicoDialog] = useState(false);
  const [servico, setServico] = useState({
    id: null,
    descricao: '',
    tipo: '',
    status: 'Pendente', 
    maoDeObra: 0,
    dataPrevista: null,
    pecas: [], // agora é array
    veiculo: null,
    cliente: null,
    preco: 0,
    observacoes: '',
    tipoPagamento: null,
    garantia: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [viewServicoDialog, setViewServicoDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  const [pecas, setPecas] = useState([]);
  const [todosOsVeiculos, setTodosOsVeiculos] = useState([]);
  const [veiculosFiltrados, setVeiculosFiltrados] = useState([]);
  const [clientes, setClientes] = useState([]);

  const toast = useRef(null);
  
  
  const emptyServico = { 
    id: null, 
    descricao: '', 
    tipo: '', 
    status: 'Pendente', 
    maoDeObra: 0, 
    dataPrevista: null, 
    pecas: [], // array
    veiculo: null, 
    cliente: null, 
    preco: 0,
    observacoes: '',
    tipoPagamento: null,
    garantia: null
  };

  const [showFooterButtons, setShowFooterButtons] = useState(true);
  const dialogContentRef = useRef(null);

  
  const tipoPagamentoOptions = [
    { label: 'Dinheiro', value: 'DINHEIRO' },
    { label: 'Cartão de Crédito', value: 'CARTAO_CREDITO' },
    { label: 'Cartão de Débito', value: 'CARTAO_DEBITO' },
    { label: 'Pix', value: 'PIX' },
    { label: 'Boleto', value: 'BOLETO' },
  ];
  
  const garantiaOptions = [
    { label: '1 mês', value: 1 },
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 }
  ];
  
  const [garantiaSelecionada, setGarantiaSelecionada] = useState(null);

  
  useEffect(() => {
    if (!servicoDialog) return;
    const content = dialogContentRef.current;
    if (content) content.scrollTop = 0;
    const handleScroll = () => {
      const el = dialogContentRef.current;
      if (!el) return;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      setShowFooterButtons(atBottom);
    };
    const el = content;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [servicoDialog]);

  useEffect(() => {
    buscarServicos();
    buscarPecas();
    buscarTodosVeiculos();
    buscarClientes();
  }, []);

  const buscarServicos = async () => {
    try {
      const response = await api.get('/servicos');
      setServicos(response.data);
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar os serviços', life: 3000 });
    }
  };

  const buscarPecas = async () => {
    try {
      const response = await api.get('/pecas');
      setPecas(response.data);
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
    }
  };

  const buscarTodosVeiculos = async () => { 
    try {
      const response = await api.get('/veiculos');
      setTodosOsVeiculos(response.data); 
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
    }
  };

  const buscarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const openNew = () => {
    setServico(emptyServico);
    setIsEditing(false);
    setServicoDialog(true);
  };

  const hideDialog = () => setServicoDialog(false);
  const hideDeleteServicoDialog = () => setDeleteServicoDialog(false);

  const editServico = (servico) => {
    let _servico = { ...servico };

    if (_servico.dataPrevista) {
        _servico.dataPrevista = new Date(_servico.dataPrevista);
    }
  
    if (_servico.garantia) { 
        _servico.garantia = new Date(_servico.garantia);
    }

  
    if (_servico.cliente && clientes.length > 0) {
        _servico.cliente = clientes.find(c => c.id === _servico.cliente.id) || null;
    }

    if (_servico.cliente) {
        const filtrados = todosOsVeiculos.filter(v => v.cliente && v.cliente.id === _servico.cliente.id);
        setVeiculosFiltrados(filtrados);
    }
    
    if (_servico.veiculo && todosOsVeiculos.length > 0) {
        _servico.veiculo = todosOsVeiculos.find(v => v.id === _servico.veiculo.id) || null;
    }

    // Ajuste para múltiplas peças
    if (_servico.pecas && pecas.length > 0) {
        _servico.pecas = _servico.pecas.map(p => pecas.find(pc => pc.id === (p.id || p)) || p);
    } else {
        _servico.pecas = [];
    }

    setServico(_servico);
    setIsEditing(true);
    setServicoDialog(true);
  };

  const confirmDeleteServico = (servico) => {
    setServico(servico);
    setDeleteServicoDialog(true);
  };

  const visualizarServico = (servicoSelecionado) => {
    setServico(servicoSelecionado);
    setViewServicoDialog(true);
  };

  const onInputChange = (e, name) => {
    const val = e.target ? e.target.value : e.value;
    let _servico = { ...servico, [name]: val };

    if (name === 'garantiaSelecionada') {
      setGarantiaSelecionada(val);
    }

    if (name === 'cliente') {
        if (val) {
            const filtrados = todosOsVeiculos.filter(v => v.cliente && v.cliente.id === val.id);
            setVeiculosFiltrados(filtrados);
        } else {
            setVeiculosFiltrados([]);
        }
        _servico.veiculo = null; 
    }

    // Ajuste para múltiplas peças
    if (name === 'maoDeObra' || name === 'pecas') {
        const precoPecas = (_servico.pecas && _servico.pecas.length > 0) ? _servico.pecas.reduce((acc, p) => acc + (p?.preco || 0), 0) : 0;
        _servico.preco = precoPecas + Number(_servico.maoDeObra || 0);
    }

    setServico(_servico);
  };

  const calcularDataGarantia = (dataPrevista, meses) => {
    if (!dataPrevista || !meses) return null;
    const data = new Date(dataPrevista);
    data.setMonth(data.getMonth() + meses);
    return data;
  };

  const saveServico = async () => {
    if (!servico.descricao || !servico.tipo || (servico.maoDeObra === null || servico.maoDeObra === undefined) || !servico.dataPrevista || !servico.veiculo || !servico.cliente || !servico.status || !servico.tipoPagamento || !servico.pecas || servico.pecas.length === 0) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios, incluindo ao menos uma peça...', life: 3000 });
      return;
    }

    if (servico.maoDeObra < 0) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Mão de obra deve ser positiva', life: 3000 });
      return;
    }
    
    const dataPrevistaFormatada = servico.dataPrevista ? new Date(servico.dataPrevista).toISOString().split('T')[0] : null;
    let dataGarantia = null;
    if (garantiaSelecionada && servico.dataPrevista) {
      dataGarantia = calcularDataGarantia(servico.dataPrevista, garantiaSelecionada);
    }
    const garantiaFormatada = dataGarantia ? dataGarantia.toISOString().split('T')[0] : null;

    const dto = {
      descricao: servico.descricao,
      tipo: servico.tipo,
      status: servico.status,
      maoDeObra: servico.maoDeObra,
      dataPrevista: dataPrevistaFormatada,
      garantia: garantiaFormatada,
      idPecas: servico.pecas.map(p => p.id),
      idVeiculo: servico.veiculo.id,
      preco: servico.preco,
      observacoes: servico.observacoes,
      tipoPagamento: servico.tipoPagamento 
    };

    try {
      if (isEditing) {
        await api.put(`/servicos/${servico.id}`, dto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Serviço atualizado', life: 3000 });
        setServicoDialog(false);
        buscarServicos();
      } else {
        const response = await api.post('/servicos', dto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
        
        setServico({ ...servico, id: response.data.id });
        
        buscarServicos();
      }
    } catch (error) {
      
      console.error('Erro ao salvar serviço:', error);
      const serverMsg = error?.response?.data?.message || error?.response?.data || error?.message || 'Erro desconhecido';
      const msg = isEditing ? 'Não foi possível atualizar o serviço' : 'Não foi possível criar o serviço';
      toast.current.show({ severity: 'error', summary: 'Erro', detail: `${msg}: ${serverMsg}`, life: 5000 });
    }
  };

  const deleteServico = async () => {
    try {
      await api.delete(`/servicos/${servico.id}`);
      setDeleteServicoDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Serviço deletado', life: 3000 });
      buscarServicos();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o serviço', life: 3000 });
    }
  };

  const gerarOrcamento = () => {
    if (!servico.id) {
      toast.current.show({
        severity: 'error',
        summary: 'Atenção',
        detail: 'Salve o serviço antes de gerar o orçamento!',
        life: 3500
      });
      return;
    }

    try {
      const s = servico;
      const descricao = s.descricao || "-";
      const nomePecas = (s.pecas && s.pecas.length > 0) ? s.pecas.map(p => p.nome).join(", ") : "-";
      const maoDeObra = s.maoDeObra != null ? Number(s.maoDeObra) : 0;
      const preco = s.preco != null ? Number(s.preco) : maoDeObra;
      const clienteNome = s.cliente?.nome || "-";
      const clienteTelefone = s.cliente?.telefone || "-";
      const veiculoModelo = s.veiculo?.modelo || "-";
      const veiculoPlaca = s.veiculo?.placa || "-";
      const observacoes = s.observacoes?.trim() ? s.observacoes : 'Nenhuma';

      const pagamentoLabels = {
        'DINHEIRO': 'Dinheiro',
        'CARTAO_CREDITO': 'Cartão de Crédito',
        'CARTAO_DEBITO': 'Cartão de Débito',
        'PIX': 'Pix',
        'BOLETO': 'Boleto'
      };
      const tipoPagamentoLabel = pagamentoLabels[s.tipoPagamento] || s.tipoPagamento || "-";

      const doc = new jsPDF();

      const logoPath = '/src/assets/Logo_Rei_Do_Cabecote.jpg';
      const logoImg = new window.Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = logoPath;
      logoImg.onload = function() {
        doc.addImage(logoImg, 'JPEG', 20, 10, 28, 28); 
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text("Rei do Cabeçote", 55, 20);
        doc.setFontSize(11);
        doc.text("Rua Içá, nº 340 – Bairro Renascença", 55, 27);
        doc.text("Telefone: (31) 98342-6326", 55, 33);
        doc.setFontSize(18);
        doc.text("Orçamento de Serviço", 105, 45, { align: "center" });
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.2);
        doc.line(20, 50, 190, 50);
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${clienteNome}`, 20, 58);
        doc.text(`Telefone: ${clienteTelefone}`, 20, 64);
        doc.text(`Veículo: ${veiculoModelo}`, 110, 58);
        doc.text(`Placa: ${veiculoPlaca}`, 110, 64);
        doc.setFontSize(12);
        doc.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 20, 72);
        // Tabela 1: Tipo de Serviço e Descrição
        autoTable(doc, {
          startY: 78,
          head: [["Tipo de Serviço", "Descrição"]],
          body: [[s.tipo || "-", descricao]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 2: Peças e Preço das Peças
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Peças", "Preço"]],
          body: [[nomePecas, s.pecas && s.pecas.length > 0 ? `R$ ${s.pecas.reduce((acc, p) => acc + (p.preco || 0), 0).toFixed(2)}` : "-"]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 3: Custo de Mão de Obra
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Custo de Mão de Obra"]],
          body: [[`R$ ${maoDeObra.toFixed(2)}`]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 4: Valor Total
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Valor Total"]],
          body: [[`R$ ${preco.toFixed(2)}`]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 12, cellPadding: 4, halign: 'center' },
          margin: { left: 20, right: 20 }
        });

        // Tabela 5: Tipo de Pagamento
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Tipo de Pagamento"]],
          body: [[tipoPagamentoLabel]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });

        // Tabela 6: Data de Garantia
        let garantiaString = '-';
        if (garantiaSelecionada && servico.dataPrevista) {
          const dataGarantia = calcularDataGarantia(servico.dataPrevista, garantiaSelecionada);
          garantiaString = dataGarantia ? new Date(dataGarantia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
        } else if (servico.garantia) {
          garantiaString = new Date(servico.garantia).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        }

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Data de Garantia"]],
          body: [[garantiaString]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });

        // Observações
        const obsY = doc.lastAutoTable.finalY + 16; 
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Observações:', 20, obsY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.text(observacoes, 24, obsY + 10, { maxWidth: 162 });
        doc.save(`orcamento_${s.id}.pdf`);
      };
      logoImg.onerror = function() {

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text("Rei do Cabeçote", 55, 20);
        doc.setFontSize(11);
        doc.text("Rua Içá, nº 340 – Bairro Renascença", 55, 27);
        doc.text("Telefone: (31) 98342-6326", 55, 33);
        doc.setFontSize(18);
        doc.text("Orçamento de Serviço", 105, 45, { align: "center" });
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1.2);
        doc.line(20, 50, 190, 50);
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${clienteNome}`, 20, 58);
        doc.text(`Telefone: ${clienteTelefone}`, 20, 64);
        doc.text(`Veículo: ${veiculoModelo}`, 110, 58);
        doc.text(`Placa: ${veiculoPlaca}`, 110, 64);
        doc.setFontSize(12);
        doc.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 20, 72);
        // Tabela 1
        autoTable(doc, {
          startY: 78,
          head: [["Tipo de Serviço", "Descrição"]],
          body: [[s.tipo || "-", descricao]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 2
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Peças", "Preço das Peças"]],
          body: [[nomePecas, s.pecas && s.pecas.length > 0 ? `R$ ${s.pecas.reduce((acc, p) => acc + (p.preco || 0), 0).toFixed(2)}` : "-"]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 3
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Custo de Mão de Obra"]],
          body: [[`R$ ${maoDeObra.toFixed(2)}`]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        // Tabela 4
        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Valor Total"]],
          body: [[`R$ ${preco.toFixed(2)}`]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 12, cellPadding: 4, halign: 'center' },
          margin: { left: 20, right: 20 }
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Tipo de Pagamento"]],
          body: [[tipoPagamentoLabel]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });
        
        let garantiaString = '-';
        if (garantiaSelecionada && servico.dataPrevista) {
          const dataGarantia = calcularDataGarantia(servico.dataPrevista, garantiaSelecionada);
          garantiaString = dataGarantia ? new Date(dataGarantia).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
        } else if (servico.garantia) {
          garantiaString = new Date(servico.garantia).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        }

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 6,
          head: [["Data de Garantia"]],
          body: [[garantiaString]],
          theme: 'grid',
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 11, cellPadding: 3, halign: 'center' },
          margin: { left: 20, right: 20 }
        });

        const obsY = doc.lastAutoTable.finalY + 16; 
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text('Observações:', 20, obsY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.text(observacoes, 24, obsY + 10, { maxWidth: 162 });
        doc.save(`orcamento_${s.id}.pdf`);
        
      };
    } catch (err) {
      console.error("Erro ao gerar orçamento:", err);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível gerar o orçamento',
        life: 3500
      });
    }
  };


  const deleteServicoDialogFooter = (
    <>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteServicoDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteServico} />
    </>
  );

  const actionBodyTemplate = (rowData) => (
    <>
      <Button className="service-view-action" icon="pi pi-eye" rounded outlined aria-label="Visualizar serviço" tooltip="Visualizar serviço" onClick={() => visualizarServico(rowData)} />
      <Button icon="pi pi-pencil" rounded outlined aria-label="Editar serviço" tooltip="Editar serviço" onClick={() => editServico(rowData)} />
      <Button severity="danger" icon="pi pi-trash" rounded outlined aria-label="Excluir serviço" tooltip="Excluir serviço" onClick={() => confirmDeleteServico(rowData)} />
    </>
  );

  const statusOptions = ['Pendente','Em andamento','Concluído'];
  const statusBodyTemplate = (rowData) => {
    const status = rowData.status || 'Sem status';
    const statusClass = status.toLowerCase().replaceAll(' ', '-');
    return <span className={`service-status-badge service-status-${statusClass}`}>{status}</span>;
  };

  const servicosFiltrados = servicos.filter((servico) => {
    const searchable = `${servico.descricao || ''} ${servico.tipo || ''} ${servico.status || ''}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!statusFilter || servico.status === statusFilter);
  });

  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<h2 className="titulo">Gerenciamento de Serviços</h2>} end={<Button style={{ backgroundColor: '#000000', color: 'white' }} label="Adicionar Novo Serviço" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por descrição, tipo ou status">
        <Dropdown value={statusFilter} options={statusOptions} onChange={(event) => setStatusFilter(event.value)} placeholder="Todos os status" showClear />
      </ManagementFilters>

      <DataTable className="service-table" value={servicosFiltrados} responsiveLayout="stack" breakpoint="768px" emptyMessage="Nenhum serviço encontrado com esses filtros." tableStyle={{ minWidth: '0' }} paginator rows={10}>
       <Column
  header="ID"
  sortable
  style={{ width: '7%' }}
  body={(rowData) => {
    const index = servicos.findIndex(s => s === rowData) + 1;
    return String(index).padStart(3, '0'); 
  }}
></Column>

        <Column field="tipo" header="Tipo" sortable style={{ width: '13%' }}></Column>
        <Column field="descricao" header="Descrição" sortable style={{ width: '17%' }}></Column>
        <Column field="maoDeObra" header="Mão de obra" sortable style={{ width: '12%' }} body={(data) => `R$ ${Number(data.maoDeObra || 0).toFixed(2)}`}></Column>
        <Column field="preco" header="Total" sortable style={{ width: '11%' }} body={(data) => `R$ ${Number(data.preco || 0).toFixed(2)}`}></Column>
        <Column field="dataPrevista" header="Data prevista" sortable style={{ width: '11%' }} body={(data) => new Date(data.dataPrevista).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}></Column>
        <Column body={actionBodyTemplate} style={{ width: '15%' }}></Column>
        <Column field="status" header="Status" body={statusBodyTemplate} sortable style={{ width: '14%' }}></Column>
      </DataTable>

      {/* Dialog Adicionar/Editar */}
      <Dialog visible={servicoDialog} style={{ width: '900px' }} header={isEditing ? "Editar Serviço" : "Adicionar Serviço"} modal className="p-fluid form-dialog service-dialog" onHide={hideDialog} closable closeIcon="pi pi-times">
        <div ref={dialogContentRef} className="service-form-content">
          <div className="service-form-intro">
            <span className="service-form-kicker">Ordem de serviço</span>
            <strong>{isEditing ? 'Atualize os dados do atendimento' : 'Registre um novo atendimento'}</strong>
            <small>Organize cliente, execução, valores e condições em um único fluxo.</small>
          </div>
          <div className="service-form-section-title">Identificação do atendimento</div>
          <div className="p-field">
            <label htmlFor="tipo">Tipo de Despesas</label>
            <Dropdown
              style={{ padding: '8px' }}
              id="tipo"
              value={servico.tipo}
              options={[ 
                'Retífica do cabeçote',
                'Assento e guias de válvula',
                'Substituição de peças',
                'Montagem e testes',
                'Serviços complementares'
              ]}
              onChange={(e) => onInputChange(e, 'tipo')}
              placeholder="Selecione"
              filter
              filterPlaceholder="Buscar tipo de despesa..."
              panelClassName="service-option-panel"
              scrollHeight="240px"
              required
            />
          </div>
           <div className="p-field">
            <label htmlFor="status">Status</label>
            <Dropdown
  style={{ padding: '8px' }}
  id="status"
  value={servico.status}
  options={statusOptions}
  onChange={(e) => onInputChange(e, 'status')}
  placeholder="Selecione o status"
  required
  disabled={!isEditing} 
  panelClassName="service-option-panel"
  scrollHeight="180px"
/>

            
          </div>
          <div className="p-field">
            <label htmlFor="descricao">Descrição do Serviço</label>
            <InputText style={{ padding: '8px' }} id="descricao" value={servico.descricao} onChange={(e) => onInputChange(e, 'descricao')} placeholder="Ex.: Retífica completa do cabeçote" required autoFocus />
          </div>

          <div className="service-form-section-title">Execução e peças</div>
          <div className="p-field">
            <label htmlFor="maoDeObra">Mão de Obra</label>
            <InputNumber
  value={servico.maoDeObra}
  onValueChange={(e) => onInputChange(e, 'maoDeObra')}
  mode="currency"
  currency="BRL"
  minFractionDigits={2}
  inputStyle={{ height: '38px', padding: '8px 12px', lineHeight: '1.2' }}
/>
          </div>
          <div className="p-field">
            <label htmlFor="dataPrevista">Data Prevista</label>
            <Calendar className="service-calendar-input" id="dataPrevista" value={servico.dataPrevista} onChange={(e) => onInputChange(e, 'dataPrevista')} dateFormat="dd/mm/yy" locale="pt-BR" showIcon hideOnDateTimeSelect panelClassName="service-calendar-panel" required />
          </div>
          <div className="p-field">
            <label htmlFor="pecas">Peças do serviço</label>
            <MultiSelect
              className="service-parts-select"
              id="pecas"
              value={servico.pecas}
              options={pecas}
              optionLabel="nome"
              onChange={(e) => onInputChange(e, 'pecas')}
              placeholder="Selecione uma ou mais peças"
              display="comma"
              selectedItemsLabel="{0} peças selecionadas"
              filter
              filterBy="nome"
              filterPlaceholder="Buscar peça..."
              emptyFilterMessage="Nenhuma peça encontrada"
              emptyMessage="Nenhuma peça disponível"
              panelClassName="service-parts-panel"
              selectAllLabel="Selecionar todos"
              closeIcon="pi pi-times"
              closeButton={{ 'aria-label': 'Fechar lista de peças', title: 'Fechar lista de peças' }}
              scrollHeight="240px"
              required
            />
          </div>
          <div className="p-field">
            <label htmlFor="cliente">Cliente</label>
            <Dropdown
              id="cliente" 
              value={servico.cliente} 
              options={clientes} 
              optionLabel="nome" 
              onChange={(e) => onInputChange(e, 'cliente')}
              placeholder="Selecione" 
              required 
              filter
              showClear
              panelClassName="service-client-panel"
              scrollHeight="240px"
            />
          </div>

          <div className="p-field">
            <label htmlFor="veiculo">Placa do Veículo</label>
            <Dropdown 
              style={{ padding: '8px' }} 
              id="veiculo" 
              value={servico.veiculo} 
              options={veiculosFiltrados}
              optionLabel="placa" 
              onChange={(e) => onInputChange(e, 'veiculo')}
              placeholder="Selecione um cliente primeiro" 
              required 
              disabled={!servico.cliente}
              panelClassName="service-option-panel"
              scrollHeight="240px"
            />
          </div>

          <div className="p-field">
            <label htmlFor="preco">Valor Total</label>
            <InputNumber
  style={{ width: '100%' }}
  inputStyle={{ height: '38px', padding: '8px 12px', lineHeight: '1.2' }}
  id="preco"
  value={servico.preco}
  mode="currency"
  currency="BRL"
  disabled
/>
          </div>


          <div className="service-form-section-title">Pagamento e garantia</div>

          <div className="p-field">
            <label htmlFor="tipoPagamento">Tipo de Pagamento</label>
            <Dropdown
              style={{ padding: '8px' }}
              id="tipoPagamento"
              value={servico.tipoPagamento}
              options={tipoPagamentoOptions}
              onChange={(e) => onInputChange(e, 'tipoPagamento')}
              placeholder="Selecione"
              panelClassName="service-option-panel"
              scrollHeight="180px"
              required
            />
          </div>

         {isEditing && servico.status === 'Concluído' && (
            <div className="p-field">
              <label htmlFor="garantia">Data de Garantia</label>
              <Calendar 
                className="service-calendar-input"
                id="garantia" 
                value={servico.garantia} 
                onChange={(e) => onInputChange(e, 'garantia')} 
                dateFormat="dd/mm/yy" 
                locale="pt-BR"
                showIcon 
                hideOnDateTimeSelect
                panelClassName="service-calendar-panel"
                required={servico.status === 'Concluído'} 
              />
            </div>
          )}

          <div className="p-field">
            <label htmlFor="garantiaSelecionada">Garantia</label>
            <Dropdown
              style={{ padding: '8px' }}
              id="garantiaSelecionada"
              value={garantiaSelecionada}
              options={garantiaOptions}
              onChange={(e) => onInputChange(e, 'garantiaSelecionada')}
              placeholder="Selecione o período de garantia"
              panelClassName="service-option-panel"
              scrollHeight="180px"
              required
            />
          </div>

          <div className="p-field">
            <label htmlFor="observacoes">Observações</label>
            <InputTextarea id="observacoes" value={servico.observacoes} onChange={(e) => onInputChange(e, 'observacoes')} placeholder="Registre informações importantes sobre o atendimento" rows={4} autoResize />
          </div>
          {showFooterButtons && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button style={{ backgroundColor: '#000000', color: 'white', fontSize: '0.95rem', padding: '6px 12px', minWidth: '90px' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} size="small" />
              <Button style={{ backgroundColor: '#000000', color: 'white', fontSize: '0.95rem', padding: '6px 12px', minWidth: '90px' }} label="Salvar" icon="pi pi-check" onClick={saveServico} size="small" />
              <span
                style={{ display: 'inline-block' }}
                onClick={() => {
                  if (!servico.id) {
                    toast.current.show({ severity: 'error', summary: 'Atenção', detail: 'Salve o serviço antes de gerar o orçamento!', life: 3500 });
                  }
                }}
              >
                <Button
  style={{
    backgroundColor: '#218c74',
    color: 'white',
    fontSize: '0.95rem',
    padding: '6px 8px',
    minWidth: '120px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }}
  label="Orçamento"
  icon="pi pi-file-pdf"
  onClick={() => {
    if (!servico.id) {
      toast.current.show({
        severity: 'error',
        summary: 'Atenção',
        detail: 'Salve o serviço antes de gerar o orçamento!',
        life: 3500
      });
      return;
    }
    gerarOrcamento();
  }}
  tooltip={!servico.id ? 'Salve o serviço antes de gerar o orçamento' : ''}
  size="small"
/>
              </span>
            </div>
          )}
        </div>
      </Dialog>

      <Dialog visible={viewServicoDialog} style={{ width: '620px' }} header="Detalhes do serviço" modal className="p-fluid service-view-dialog" onHide={() => setViewServicoDialog(false)} closable closeIcon="pi pi-times" footer={(
        <div className="service-view-actions">
          <Button label="Fechar" icon="pi pi-times" outlined onClick={() => setViewServicoDialog(false)} />
          <Button label="Editar serviço" icon="pi pi-pencil" onClick={() => { setViewServicoDialog(false); editServico(servico); }} />
          <Button label="Gerar orçamento" icon="pi pi-file-pdf" className="service-budget-button" onClick={gerarOrcamento} disabled={!servico.id} />
        </div>
      )}>
        <div className="service-view-summary">
          <div className="service-view-heading">
            <span className="service-view-kicker">Ordem de serviço</span>
            <h3>{servico.descricao || 'Serviço sem descrição'}</h3>
            {statusBodyTemplate(servico)}
          </div>
          <div className="service-view-grid">
            <div><span>Tipo</span><strong>{servico.tipo || 'Não informado'}</strong></div>
            <div><span>Cliente</span><strong>{servico.cliente?.nome || 'Não informado'}</strong></div>
            <div><span>Veículo</span><strong>{servico.veiculo ? `${servico.veiculo.modelo} • ${servico.veiculo.placa}` : 'Não informado'}</strong></div>
            <div><span>Data prevista</span><strong>{servico.dataPrevista ? new Date(servico.dataPrevista).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informada'}</strong></div>
            <div><span>Mão de obra</span><strong>R$ {Number(servico.maoDeObra || 0).toFixed(2)}</strong></div>
            <div><span>Valor total</span><strong>R$ {Number(servico.preco || 0).toFixed(2)}</strong></div>
          </div>
          <div className="service-view-parts">
            <span>Peças utilizadas</span>
            <p>{servico.pecas?.length ? servico.pecas.map((peca) => peca.nome).join(', ') : 'Nenhuma peça informada.'}</p>
          </div>
          <div className="service-view-parts">
            <span>Observações</span>
            <p>{servico.observacoes || 'Nenhuma observação registrada.'}</p>
          </div>
        </div>
      </Dialog>

      {/* Dialog Deletar */}
      <Dialog visible={deleteServicoDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deleteServicoDialogFooter} onHide={hideDeleteServicoDialog} closable={true} closeIcon="pi pi-times">
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {servico && <span>Tem certeza que deseja deletar o serviço <b>{servico.descricao}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudServico;