import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import './CrudPecas.css';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';
import { getMissingRequiredFields } from '../utils/formValidation';

const partSortOptions = [
  { label: 'Nome', field: 'nome' },
  { label: 'Preço', field: 'preco' },
  { label: 'Fornecedor', field: 'fornecedor' },
  { label: 'Situação', field: 'situacao' },
];

const priceRanges = [
  { label: 'Até R$ 50', value: '0-50', min: 0, max: 50 },
  { label: 'R$ 50 a R$ 200', value: '50-200', min: 50, max: 200 },
  { label: 'R$ 200 a R$ 500', value: '200-500', min: 200, max: 500 },
  { label: 'Acima de R$ 500', value: '500+', min: 500, max: Infinity },
];

const CrudPecas = () => {
  const [pecas, setPecas] = useState([]);
  const [deletePecaDialog, setDeletePecaDialog] = useState(false);
  const [peca, setPeca] = useState({ id: null, nome: '', descricao: '', preco: 0, fornecedor: '', situacao: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [situationFilter, setSituationFilter] = useState(null);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [priceRangeFilter, setPriceRangeFilter] = useState(null);
  const [fornecedores, setFornecedores] = useState([]); // NOVO ESTADO: para armazenar fornecedores
  const toast = useRef(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('nome', partSortOptions);
  const loadPeca = useCallback(async (id) => {
    const response = await api.get('/pecas');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar peça:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar a peça.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/pecas',
    emptyValue: { id: null, nome: '', descricao: '', preco: 0, fornecedor: '', situacao: 'Em cadastro' },
    setValue: setPeca,
    setIsEditing,
    loadById: loadPeca,
    onLoadError: onFormLoadError,
  });

  const situacoes = [
    { label: 'Ativo', value: 'Ativo' },
    { label: 'Inativo', value: 'Inativo' },
  ];

  // ATUALIZADO: Buscar peças e fornecedores
  useEffect(() => {
    buscarPecas();
    buscarFornecedores();
  }, []);

  const buscarPecas = async () => {
    try {
      const response = await api.get('/pecas');
      setPecas(response.data);
    } catch (error) {
      console.error("Erro ao buscar peças:", error);
    }
  };

  // NOVA FUNÇÃO: Buscar fornecedores para o dropdown
  const buscarFornecedores = async () => {
    try {
      const response = await api.get('/fornecedores');
      // Mapeia para o formato que o Dropdown espera {label, value}
      const fornecedoresFormatados = response.data.map(f => ({
        label: f.nome,
        value: f.nome // Salva o nome do fornecedor, como era antes
      }));
      setFornecedores(fornecedoresFormatados);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
    }
  };

  const openNew = openNewRoute;

  const hideDialog = closeForm;

  const hideDeletePecaDialog = () => {
    setDeletePecaDialog(false);
  };

  const editPeca = openEdit;

  const confirmDeletePeca = (peca) => {
    setPeca(peca);
    setDeletePecaDialog(true);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _peca = { ...peca };
    _peca[name] = val;
    setPeca(_peca);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _peca = { ...peca };
    _peca[name] = val;
    setPeca(_peca);
  };

  const savePeca = async () => {
    const missingFields = getMissingRequiredFields({
      'Nome da peça': peca.nome,
      Preço: peca.preco || null,
      Fornecedor: peca.fornecedor,
    });
    if (missingFields.length) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`, life: 5000 });
      return;
    }

    let _peca = { ...peca };
    if (!isEditing) {
      _peca.situacao = 'Ativo';
    }

    try {
      if (isEditing) {
        await api.put(`/pecas/${_peca.id}`, _peca);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Peça Atualizada', life: 3000 });
      } else {
        await api.post('/pecas', _peca);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Peça Criada', life: 3000 });
      }
      finishSave();
      buscarPecas();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível salvar a peça', life: 3000 });
    }
  };

  const deletePeca = async () => {
    try {
      await api.delete(`/pecas/${peca.id}`);
      setDeletePecaDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Peça Deletada', life: 3000 });
      buscarPecas();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar a peça', life: 3000 });
    }
  };

  const deletePecaDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeletePecaDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deletePeca} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editPeca(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeletePeca(rowData)} />
      </React.Fragment>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rowData.preco);
  };

  const pecasFiltradas = sortItems(pecas.filter((item) => {
    const searchable = `${item.nome} ${item.descricao} ${item.fornecedor} ${item.situacao}`.toLowerCase();
    const price = Number(item.preco) || 0;
    const selectedPriceRange = priceRanges.find(({ value }) => value === priceRangeFilter);
    return searchable.includes(search.toLowerCase())
      && (!situationFilter || item.situacao === situationFilter)
      && (!supplierFilter || item.fornecedor === supplierFilter)
      && (!selectedPriceRange || (price >= selectedPriceRange.min && price <= selectedPriceRange.max));
  }));
  const hasActiveFilters = Boolean(search || situationFilter || supplierFilter || priceRangeFilter);

  return (
    <div className="card parts-management-card">
      <Toast ref={toast} />
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Estoque e catálogo" title="Peças" description="Cadastre e acompanhe as peças usadas na operação." />} end={<Button label="Adicionar peça" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por peça, fornecedor ou descrição" sortField={sortField} sortOrder={sortOrder} onSortFieldChange={setSortField} onSortOrderChange={setSortOrder} sortOptions={sortOptions}>
            <Dropdown aria-label="Filtrar por situação" value={situationFilter} options={situacoes} onChange={(event) => setSituationFilter(event.value)} placeholder="Todas as situações" showClear />
            <Dropdown aria-label="Filtrar por fornecedor" value={supplierFilter} options={fornecedores} onChange={(event) => setSupplierFilter(event.value)} placeholder="Todos os fornecedores" showClear />
            <Dropdown aria-label="Filtrar por faixa de preço" value={priceRangeFilter} options={priceRanges} optionLabel="label" optionValue="value" onChange={(event) => setPriceRangeFilter(event.value)} placeholder="Todas as faixas de preço" showClear />
            <Button
              className="parts-clear-filters"
              label="Limpar"
              icon="pi pi-filter-slash"
              outlined
              disabled={!hasActiveFilters}
              onClick={() => {
                setSearch('');
                setSituationFilter(null);
                setSupplierFilter(null);
                setPriceRangeFilter(null);
              }}
            />
          </ManagementFilters>
          <div className="parts-filter-summary" aria-live="polite">
            <span>{pecasFiltradas.length} {pecasFiltradas.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span>
            {hasActiveFilters && <span>Filtros aplicados</span>}
          </div>
          <DataTable value={pecasFiltradas} responsiveLayout="scroll" emptyMessage="Nenhuma peça encontrada." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="nome" header="Nome"></Column>
            <Column field="preco" header="Preço" body={priceBodyTemplate}></Column>
            <Column field="fornecedor" header="Fornecedor"></Column>
            <Column field="situacao" header="Situação"></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar peça' : 'Nova peça'}
          description="Registre os dados comerciais e o fornecedor responsável pela peça."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar peça'}
          onCancel={hideDialog}
          onSubmit={savePeca}
        >
          <AdminFormSection title="Informações da peça" description="Descreva o item e defina seu preço de referência.">
            <div className="admin-form-grid">
              <div className="p-field admin-form-wide">
                <label htmlFor="nome">Nome da peça *</label>
                <InputText id="nome" value={peca.nome} onChange={(e) => onInputChange(e, 'nome')} placeholder="Ex.: Junta do cabeçote" required autoFocus />
              </div>
              <div className="p-field admin-form-wide">
                <label htmlFor="descricao">Descrição</label>
                <InputText id="descricao" value={peca.descricao} onChange={(e) => onInputChange(e, 'descricao')} placeholder="Detalhes ou aplicação da peça" />
              </div>
              <div className="p-field">
                <label htmlFor="preco">Preço *</label>
                <InputNumber id="preco" value={peca.preco} onValueChange={(e) => onInputNumberChange(e, 'preco')} mode="currency" currency="BRL" locale="pt-BR" placeholder="R$ 0,00" />
              </div>
              <div className="p-field">
                <label htmlFor="fornecedor">Fornecedor *</label>
                <Dropdown id="fornecedor" value={peca.fornecedor} options={fornecedores} onChange={(e) => onInputChange(e, 'fornecedor')} placeholder="Selecione o fornecedor" required />
              </div>
              <div className="p-field">
                <label htmlFor="situacao">Situação</label>
                {isEditing ? (
                  <Dropdown id="situacao" value={peca.situacao} options={situacoes} onChange={(e) => onInputChange(e, 'situacao')} placeholder="Selecione a situação" />
                ) : (
                  <InputText id="situacao" value={peca.situacao} disabled />
                )}
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}

      <Dialog visible={deletePecaDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deletePecaDialogFooter} onHide={hideDeletePecaDialog} closable={true} closeIcon="pi pi-times">
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {peca && <span>Tem certeza que deseja deletar a peça <b>{peca.nome}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudPecas; 