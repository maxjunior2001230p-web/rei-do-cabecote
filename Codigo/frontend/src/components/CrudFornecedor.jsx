import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import './CrudUsuario.css';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask'; // 1. Importar o InputMask
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';
import { getMissingRequiredFields } from '../utils/formValidation';

const supplierSortOptions = [
  { label: 'Nome', field: 'nome' },
  { label: 'CNPJ', field: 'cnpj' },
  { label: 'Contato', field: 'contato' },
  { label: 'Categoria', field: 'categoria' },
];

const CrudFornecedor = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [deleteFornecedorDialog, setDeleteFornecedorDialog] = useState(false);
  const [fornecedor, setFornecedor] = useState({ id: null, nome: '', cnpj: '', endereco: '', complemento: '', contato: '', categoria: null });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('nome', supplierSortOptions);
  const toast = useRef(null);
  const loadFornecedor = useCallback(async (id) => {
    const response = await api.get('/fornecedores');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar fornecedor:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o fornecedor.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/fornecedores',
    emptyValue: { id: null, nome: '', cnpj: '', endereco: '', complemento: '', contato: '', categoria: null },
    setValue: setFornecedor,
    setIsEditing,
    loadById: loadFornecedor,
    onLoadError: onFormLoadError,
  });

  const categorias = [
    { label: 'Peças', value: 'Peças' },
    { label: 'Materiais', value: 'Materiais' },
    { label: 'Ferramentas', value: 'Ferramentas' },
    { label: 'Serviços', value: 'Serviços' }
  ];

  useEffect(() => {
    buscarFornecedores();
  }, []);

  const buscarFornecedores = async () => {
    try {
      const response = await api.get('/fornecedores');
      setFornecedores(response.data);
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os fornecedores.', life: 3000 });
    }
  };

  const openNew = openNewRoute;

  const hideDialog = closeForm;

  const hideDeleteFornecedorDialog = () => {
    setDeleteFornecedorDialog(false);
  };

  const editFornecedor = openEdit;

  const confirmDeleteFornecedor = (fornecedor) => {
    setFornecedor(fornecedor);
    setDeleteFornecedorDialog(true);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _fornecedor = { ...fornecedor };
    _fornecedor[name] = val;
    setFornecedor(_fornecedor);
  };

  const onDropdownChange = (e, name) => {
    const val = e.value || null;
    let _fornecedor = { ...fornecedor };
    _fornecedor[name] = val;
    setFornecedor(_fornecedor);
  };

  const saveFornecedor = async () => {
    const missingFields = getMissingRequiredFields({
      Nome: fornecedor.nome,
      CNPJ: fornecedor.cnpj,
      Contato: fornecedor.contato,
      Categoria: fornecedor.categoria,
    });
    if (missingFields.length) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`, life: 5000 });
      return;
    }

    let _fornecedor = { ...fornecedor };

    try {
      if (isEditing) {
        await api.put(`/fornecedores/${_fornecedor.id}`, _fornecedor);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Fornecedor Atualizado', life: 3000 });
      } else {
        await api.post('/fornecedores', _fornecedor);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Fornecedor Criado', life: 3000 });
      }
      finishSave();
      buscarFornecedores();
    } catch (error) {
      const errorMsg = error.response?.data?.message || `Não foi possível salvar o fornecedor.`;
      toast.current.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 3000 });
    }
  };

  const deleteFornecedor = async () => {
    try {
      await api.delete(`/fornecedores/${fornecedor.id}`);
      setDeleteFornecedorDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Fornecedor Deletado', life: 3000 });
      buscarFornecedores();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o fornecedor', life: 3000 });
    }
  };

  const deleteFornecedorDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteFornecedorDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteFornecedor} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editFornecedor(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteFornecedor(rowData)} />
      </React.Fragment>
    );
  };

  const fornecedoresFiltrados = sortItems(fornecedores.filter((item) => {
    const searchable = `${item.nome} ${item.cnpj} ${item.contato} ${item.categoria}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!categoryFilter || item.categoria === categoryFilter);
  }));

  return (
    <div className="card">
      <Toast ref={toast} />
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Suprimentos" title="Fornecedores" description="Gerencie os parceiros e contatos de fornecimento." />} end={<Button label="Adicionar fornecedor" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters
            search={search}
            onSearch={setSearch}
            placeholder="Buscar por nome, CNPJ, contato ou categoria"
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            sortOptions={sortOptions}
            resultCount={fornecedoresFiltrados.length}
            hasActiveFilters={Boolean(search || categoryFilter)}
            onClearFilters={() => {
              setSearch('');
              setCategoryFilter(null);
            }}
          >
            <Dropdown aria-label="Filtrar fornecedores por categoria" value={categoryFilter} options={categorias} onChange={(event) => setCategoryFilter(event.value)} placeholder="Todas as categorias" showClear />
          </ManagementFilters>
          <DataTable value={fornecedoresFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum fornecedor encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="nome" header="Nome"></Column>
            <Column field="cnpj" header="CNPJ"></Column>
            <Column field="contato" header="Contato"></Column>
            <Column field="categoria" header="Categoria"></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar fornecedor' : 'Novo fornecedor'}
          description="Mantenha atualizados os dados comerciais e os canais de contato do parceiro."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar fornecedor'}
          onCancel={hideDialog}
          onSubmit={saveFornecedor}
        >
          <AdminFormSection title="Identificação e contato" description="Informe os dados de cadastro e a categoria de fornecimento.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="nome">Razão social / nome *</label>
                <InputText id="nome" value={fornecedor.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus placeholder="Nome do fornecedor" />
              </div>
              <div className="p-field">
                <label htmlFor="cnpj">CNPJ *</label>
                <InputMask id="cnpj" value={fornecedor.cnpj} onChange={(e) => onInputChange(e, 'cnpj')} mask="99.999.999/9999-99" placeholder="00.000.000/0000-00" required />
              </div>
              <div className="p-field">
                <label htmlFor="contato">Telefone de contato *</label>
                <InputMask id="contato" value={fornecedor.contato} onChange={(e) => onInputChange(e, 'contato')} mask="(99) 99999-9999" placeholder="(00) 00000-0000" required />
              </div>
              <div className="p-field">
                <label htmlFor="categoria">Categoria *</label>
                <Dropdown id="categoria" value={fornecedor.categoria} options={categorias} onChange={(e) => onDropdownChange(e, 'categoria')} placeholder="Selecione a categoria" required />
              </div>
              <div className="p-field">
                <label htmlFor="endereco">Endereço</label>
                <InputText id="endereco" value={fornecedor.endereco} onChange={(e) => onInputChange(e, 'endereco')} placeholder="Rua, número, bairro e cidade" />
              </div>
              <div className="p-field">
                <label htmlFor="complemento">Complemento</label>
                <InputText id="complemento" value={fornecedor.complemento} onChange={(e) => onInputChange(e, 'complemento')} placeholder="Sala, referência ou observação" />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}

      <Dialog
        visible={deleteFornecedorDialog}
        style={{ width: '450px' }}
        header="Confirmação"
        modal
        footer={deleteFornecedorDialogFooter}
        onHide={hideDeleteFornecedorDialog}
        closable={true}
        closeIcon="pi pi-times"
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {fornecedor && <span>Tem certeza que deseja deletar o fornecedor <b>{fornecedor.nome}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudFornecedor;