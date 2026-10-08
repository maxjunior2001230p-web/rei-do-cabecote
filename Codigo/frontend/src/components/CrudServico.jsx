import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import './CrudUsuario.css'; 

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { MultiSelect } from 'primereact/multiselect';
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import AdminEntityPicker from './AdminEntityPicker';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';
import { getMissingRequiredFields } from '../utils/formValidation';
import { generateServiceQuotePdf } from '../utils/serviceQuotePdf';

const serviceSortOptions = [
  { label: 'Descrição', field: 'descricao' },
  { label: 'Tipo', field: 'tipo' },
  { label: 'Status', field: 'status' },
  { label: 'Cliente', field: 'cliente.nome' },
  { label: 'Placa', field: 'veiculo.placa' },
  { label: 'Data prevista', field: 'dataPrevista' },
  { label: 'Mão de obra', field: 'maoDeObra' },
  { label: 'Valor total', field: 'preco' },
];

const serviceTypeOptions = [
  'Retífica do cabeçote',
  'Assento e guias de válvula',
  'Substituição de peças',
  'Montagem e testes',
  'Serviços complementares',
];

const serviceCurrencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const getGuaranteeMonths = (start, end) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + endDate.getMonth() - startDate.getMonth();
  return [1, 3, 6].includes(months) ? months : null;
};

const CrudServico = () => {
  const [servicos, setServicos] = useState([]);
  const [deleteServicoDialog, setDeleteServicoDialog] = useState(false);
  const [servico, setServico] = useState({
    id: null,
    descricao: '',
    tipo: '',
    status: 'Pendente', 
    maoDeObra: null,
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
  const [typeFilter, setTypeFilter] = useState(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('dataPrevista', serviceSortOptions);

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
    maoDeObra: null,
    dataPrevista: null, 
    pecas: [], // array
    veiculo: null, 
    cliente: null, 
    preco: 0,
    observacoes: '',
    tipoPagamento: null,
    garantia: null
  };

  
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

  const loadServico = useCallback(async (id) => {
    const [servicosResponse, pecasResponse, veiculosResponse, clientesResponse] = await Promise.all([
      api.get('/servicos'),
      api.get('/pecas'),
      api.get('/veiculos'),
      api.get('/clientes'),
    ]);
    const source = servicosResponse.data.find((item) => String(item.id) === id);
    if (!source) return null;
    const loadedPecas = pecasResponse.data;
    const loadedVeiculos = veiculosResponse.data;
    const loadedClientes = clientesResponse.data;
    setPecas(loadedPecas);
    setTodosOsVeiculos(loadedVeiculos);
    setClientes(loadedClientes);
    const client = loadedClientes.find((item) => item.id === source.cliente?.id) || null;
    const vehicleOptions = loadedVeiculos.filter((item) => item.cliente?.id === client?.id);
    setVeiculosFiltrados(vehicleOptions);
    setGarantiaSelecionada(getGuaranteeMonths(source.dataPrevista, source.garantia));
    return {
      ...source,
      dataPrevista: source.dataPrevista ? new Date(source.dataPrevista) : null,
      garantia: source.garantia ? new Date(source.garantia) : null,
      cliente: client,
      veiculo: loadedVeiculos.find((item) => item.id === source.veiculo?.id) || null,
      pecas: (source.pecas || []).map((part) => loadedPecas.find((item) => item.id === (part.id || part))).filter(Boolean),
    };
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar serviço:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o serviço.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/servicos',
    emptyValue: emptyServico,
    setValue: setServico,
    setIsEditing,
    loadById: loadServico,
    onLoadError: onFormLoadError,
  });


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
    setGarantiaSelecionada(null);
    setVeiculosFiltrados([]);
    openNewRoute();
  };

  const hideDialog = closeForm;
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

    setGarantiaSelecionada(getGuaranteeMonths(_servico.dataPrevista, _servico.garantia));
    openEdit(_servico);
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
    const missingFields = getMissingRequiredFields({
      'Tipo de serviço': servico.tipo,
      Status: servico.status,
      'Descrição do serviço': servico.descricao,
      Cliente: servico.cliente,
      'Veículo / placa': servico.veiculo,
      'Data prevista': servico.dataPrevista,
      'Peças do serviço': servico.pecas,
      'Tipo de pagamento': servico.tipoPagamento,
      'Período de garantia': garantiaSelecionada,
      ...((isEditing && servico.status === 'Concluído') ? { 'Data de garantia': servico.garantia } : {}),
    });
    if (missingFields.length) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`, life: 5000 });
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
      maoDeObra: Number(servico.maoDeObra || 0),
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
        finishSave();
        buscarServicos();
      } else {
        const response = await api.post('/servicos', dto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
        
        const savedServico = { ...servico, id: response.data.id };
        setServico(savedServico);
        setIsEditing(true);
        openEdit(savedServico);
        
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

  const gerarOrcamento = async () => {
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
      const response = await api.get(`/servicos/orcamento/${servico.id}`);
      await generateServiceQuotePdf(response.data);
      toast.current.show({ severity: 'success', summary: 'Orçamento gerado', detail: 'PDF criado com os dados salvos do serviço.', life: 3500 });
    } catch (err) {
      console.error('Erro ao gerar orçamento:', err);
      toast.current.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os dados do serviço e gerar o orçamento.',
        life: 5000,
      });
    }
  };


  const deleteServicoDialogFooter = (
    <>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteServicoDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteServico} />
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

  const servicosFiltrados = sortItems(servicos.filter((servico) => {
    const searchable = `${servico.descricao || ''} ${servico.tipo || ''} ${servico.status || ''} ${servico.cliente?.nome || ''} ${servico.veiculo?.placa || ''}`.toLowerCase();
    return searchable.includes(search.toLowerCase())
      && (!statusFilter || servico.status === statusFilter)
      && (!typeFilter || servico.tipo === typeFilter);
  }));

  return (
    <div className="card">
      <Toast ref={toast} />
      {isFormRoute ? (
        <AdminFormPanel
          title={isEditing ? 'Editar ordem de serviço' : 'Nova ordem de serviço'}
          description="Organize os dados do cliente, a execução, os valores e as condições de pagamento. Salve as alterações antes de gerar o orçamento."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar serviço'}
          onCancel={hideDialog}
          onSubmit={saveServico}
          actions={
            <>
              <Button type="button" label="Cancelar" outlined onClick={hideDialog} />
              <Button type="button" label="Gerar orçamento" icon="pi pi-file-pdf" className="service-budget-button" onClick={() => {
                if (!servico.id) {
                  toast.current.show({ severity: 'error', summary: 'Atenção', detail: 'Salve o serviço antes de gerar o orçamento!', life: 3500 });
                  return;
                }
                gerarOrcamento();
              }} />
              <Button type="submit" label={isEditing ? 'Salvar alterações' : 'Salvar serviço'} icon="pi pi-check" />
            </>
          }
        >
          <AdminFormSection title="Identificação do atendimento" description="Defina o serviço e o cliente responsável pela ordem.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="tipo">Tipo de serviço *</label>
                <Dropdown
                  id="tipo"
                  value={servico.tipo}
                  options={['Retífica do cabeçote', 'Assento e guias de válvula', 'Substituição de peças', 'Montagem e testes', 'Serviços complementares']}
                  onChange={(e) => onInputChange(e, 'tipo')}
                  placeholder="Selecione o tipo"
                  filter
                  filterPlaceholder="Buscar tipo de serviço..."
                  required
                />
              </div>
              <div className="p-field">
                <label htmlFor="status">Status</label>
                <Dropdown id="status" value={servico.status} options={statusOptions} onChange={(e) => onInputChange(e, 'status')} placeholder="Selecione o status" required disabled={!isEditing} />
              </div>
              <div className="p-field admin-form-wide">
                <label htmlFor="descricao">Descrição do serviço *</label>
                <InputText id="descricao" value={servico.descricao} onChange={(e) => onInputChange(e, 'descricao')} placeholder="Ex.: Retífica completa do cabeçote" required autoFocus />
              </div>
              <div className="admin-form-wide">
                <AdminEntityPicker
                  label="Cliente *"
                  title="Selecionar cliente"
                  placeholder="Buscar e selecionar cliente"
                  emptyMessage="Nenhum cliente corresponde à busca."
                  options={clientes}
                  value={servico.cliente}
                  onChange={(value) => onInputChange({ value }, 'cliente')}
                  getLabel={(item) => item.nome}
                  getSearchText={(item) => `${item.nome} ${item.cpf || ''} ${item.telefone || ''} ${item.endereco || ''}`}
                  getDetails={(item) => [item.cpf && `CPF ${item.cpf}`, item.telefone, item.endereco].filter(Boolean).join(' · ')}
                />
              </div>
              <div className="admin-form-wide">
                <AdminEntityPicker
                  label="Veículo / placa *"
                  title="Selecionar veículo"
                  placeholder={servico.cliente ? 'Buscar e selecionar veículo' : 'Selecione o cliente primeiro'}
                  emptyMessage={servico.cliente ? 'Este cliente ainda não tem veículos cadastrados.' : 'Selecione um cliente antes de escolher o veículo.'}
                  options={veiculosFiltrados}
                  value={servico.veiculo}
                  onChange={(value) => onInputChange({ value }, 'veiculo')}
                  getLabel={(item) => `${item.placa} · ${item.modelo}`}
                  getSearchText={(item) => `${item.placa} ${item.modelo} ${item.montadora} ${item.cor || ''} ${item.ano_modelo || ''}`}
                  getDetails={(item) => [item.montadora, item.ano_modelo, item.cor].filter(Boolean).join(' · ')}
                  getSortValue={(item) => item.placa || ''}
                />
              </div>
            </div>
          </AdminFormSection>
          <AdminFormSection title="Execução e valores" description="Informe prazo, peças utilizadas e valor de mão de obra.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="dataPrevista">Data prevista *</label>
                <input
                  id="dataPrevista"
                  type="date"
                  value={servico.dataPrevista ? new Date(servico.dataPrevista).toISOString().slice(0, 10) : ''}
                  onChange={(event) => onInputChange(event, 'dataPrevista')}
                  required
                />
              </div>
              <div className="p-field">
                <label htmlFor="maoDeObra">Mão de obra</label>
                <InputNumber id="maoDeObra" value={servico.maoDeObra} onValueChange={(e) => onInputChange(e, 'maoDeObra')} mode="currency" currency="BRL" locale="pt-BR" minFractionDigits={2} placeholder="R$ 0,00" />
              </div>
              <div className="p-field admin-form-wide">
                <label htmlFor="pecas">Peças do serviço *</label>
                <MultiSelect
                  id="pecas"
                  value={servico.pecas}
                  options={pecas}
                  optionLabel="nome"
                  onChange={(e) => onInputChange(e, 'pecas')}
                  placeholder="Selecione uma ou mais peças"
                  display="comma"
                  filter
                  filterPlaceholder="Buscar peça por nome..."
                  emptyMessage="Nenhuma peça cadastrada para selecionar."
                  emptyFilterMessage="Nenhuma peça encontrada com esse nome."
                  panelClassName="service-parts-panel"
                  dataKey="id"
                  virtualScrollerOptions={{ itemSize: 54, delay: 100, showLoader: false }}
                  itemTemplate={(part) => (
                    <div className="service-part-option">
                      <span className="service-part-option-copy">
                        <strong>{part.nome}</strong>
                        <small>{[part.descricao, part.fornecedor].filter(Boolean).join(' · ') || 'Sem descrição ou fornecedor'}</small>
                      </span>
                      <strong className="service-part-option-price">
                        {serviceCurrencyFormatter.format(Number(part.preco) || 0)}
                      </strong>
                    </div>
                  )}
                  filterBy="nome,descricao,fornecedor"
                  showSelectAll={false}
                  maxSelectedLabels={1}
                  selectedItemsLabel="{0} peças selecionadas"
                  required
                />
                <small className="service-parts-hint">
                  {pecas.length} {pecas.length === 1 ? 'peça disponível' : 'peças disponíveis'}; busque por nome, descrição ou fornecedor.
                </small>
              </div>
              <div className="p-field">
                <label htmlFor="preco">Valor total</label>
                <InputNumber id="preco" value={servico.preco} mode="currency" currency="BRL" disabled />
              </div>
            </div>
          </AdminFormSection>
          <AdminFormSection title="Pagamento e garantia" description="Registre como será pago e as condições de garantia.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="tipoPagamento">Tipo de pagamento *</label>
                <Dropdown id="tipoPagamento" value={servico.tipoPagamento} options={tipoPagamentoOptions} onChange={(e) => onInputChange(e, 'tipoPagamento')} placeholder="Selecione o pagamento" required />
              </div>
              <div className="p-field">
                <label htmlFor="garantiaSelecionada">Período de garantia *</label>
                <Dropdown id="garantiaSelecionada" value={garantiaSelecionada} options={garantiaOptions} onChange={(e) => onInputChange(e, 'garantiaSelecionada')} placeholder="Selecione o período" required />
              </div>
              {isEditing && servico.status === 'Concluído' && (
                <div className="p-field">
                  <label htmlFor="garantia">Data de garantia *</label>
                  <input
                    id="garantia"
                    type="date"
                    value={servico.garantia ? new Date(servico.garantia).toISOString().slice(0, 10) : ''}
                    onChange={(event) => onInputChange(event, 'garantia')}
                    required
                  />
                </div>
              )}
              <div className="p-field admin-form-wide">
                <label htmlFor="observacoes">Observações</label>
                <InputTextarea id="observacoes" value={servico.observacoes} onChange={(e) => onInputChange(e, 'observacoes')} placeholder="Registre informações importantes sobre o atendimento" rows={4} autoResize />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      ) : (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Operação da oficina" title="Serviços" description="Acompanhe ordens de serviço, prazos e valores." />} end={<Button label="Adicionar serviço" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters
            search={search}
            onSearch={setSearch}
            placeholder="Buscar por descrição, cliente, placa ou status"
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            sortOptions={sortOptions}
            resultCount={servicosFiltrados.length}
            hasActiveFilters={Boolean(search || statusFilter || typeFilter)}
            onClearFilters={() => {
              setSearch('');
              setStatusFilter(null);
              setTypeFilter(null);
            }}
          >
            <Dropdown aria-label="Filtrar serviços por status" value={statusFilter} options={statusOptions} onChange={(event) => setStatusFilter(event.value)} placeholder="Todos os status" showClear />
            <Dropdown aria-label="Filtrar serviços por tipo" value={typeFilter} options={serviceTypeOptions} onChange={(event) => setTypeFilter(event.value)} placeholder="Todos os tipos" showClear />
          </ManagementFilters>

          <DataTable className="service-table" value={servicosFiltrados} responsiveLayout="stack" breakpoint="768px" emptyMessage="Nenhum serviço encontrado com esses filtros." tableStyle={{ minWidth: '0' }} paginator rows={10}>
       <Column
  header="ID"
  style={{ width: '7%' }}
  body={(rowData) => {
    const index = servicos.findIndex(s => s === rowData) + 1;
    return String(index).padStart(3, '0'); 
  }}
></Column>

        <Column field="tipo" header="Tipo" style={{ width: '13%' }}></Column>
        <Column field="descricao" header="Descrição" style={{ width: '17%' }}></Column>
        <Column field="maoDeObra" header="Mão de obra" style={{ width: '12%' }} body={(data) => `R$ ${Number(data.maoDeObra || 0).toFixed(2)}`}></Column>
        <Column field="preco" header="Total" style={{ width: '11%' }} body={(data) => `R$ ${Number(data.preco || 0).toFixed(2)}`}></Column>
        <Column field="dataPrevista" header="Data prevista" style={{ width: '11%' }} body={(data) => new Date(data.dataPrevista).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}></Column>
        <Column body={actionBodyTemplate} style={{ width: '15%' }}></Column>
        <Column field="status" header="Status" body={statusBodyTemplate} style={{ width: '14%' }}></Column>
          </DataTable>
        </>
      )}

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