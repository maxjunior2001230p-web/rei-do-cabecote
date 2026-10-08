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
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';

const clientSortOptions = [
  { label: 'Nome', field: 'nome' },
  { label: 'CPF', field: 'cpf' },
  { label: 'Telefone', field: 'telefone' },
  { label: 'Endereço', field: 'endereco' },
];
// InputMask pode ser uma boa alternativa para CPF e Telefone, mas seguindo o template, usaremos InputText com validação.

const CrudCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
  const [cliente, setCliente] = useState({ id: null, nome: '', cpf: '', endereco: '', telefone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useRef(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('nome', clientSortOptions);
  
  const emptyCliente = { id: null, nome: '', cpf: '', endereco: '', telefone: '' };

  const loadCliente = useCallback(async (id) => {
    const response = await api.get('/clientes');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar cliente:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o cliente.', life: 3000 });
  }, []);
  const { isFormRoute, openNew, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/clientes',
    emptyValue: emptyCliente,
    setValue: setCliente,
    setIsEditing,
    loadById: loadCliente,
    onLoadError: onFormLoadError,
  });

  useEffect(() => {
    buscarClientes();
  }, []);

  const buscarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar os clientes', life: 3000 });
    }
  };

  const hideDialog = closeForm;

  const hideDeleteClienteDialog = () => {
    setDeleteClienteDialog(false);
  };

  const editCliente = openEdit;

  const confirmDeleteCliente = (cliente) => {
    setCliente(cliente);
    setDeleteClienteDialog(true);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _cliente = { ...cliente };
    _cliente[name] = val;
    setCliente(_cliente);
  };

  const saveCliente = async () => {

    if (!cliente.nome || !cliente.cpf || !cliente.endereco || !cliente.telefone) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
      return;
    }

    
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cliente.cpf)) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'O CPF deve conter exatamente 11 dígitos numéricos.', life: 3000 });
      return;
    }
    
  
    const telefoneRegex = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
     if (!telefoneRegex.test(cliente.telefone)) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'O telefone deve estar em um formato válido (ex: (31)99999-8888).', life: 3000 });
      return;
    }

    let _cliente = { ...cliente };

    try {
      if (isEditing) {
        // Atualizar cliente (PUT)
        await api.put(`/clientes/${_cliente.id}`, _cliente);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente Atualizado', life: 3000 });
      } else {
        // Criar novo cliente (POST)
        await api.post('/clientes', _cliente);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente Criado', life: 3000 });
      }
      finishSave();
      buscarClientes();
    } catch (error) {
       const errorMsg = isEditing ? 'Não foi possível atualizar o cliente' : 'Não foi possível criar o cliente';
       toast.current.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 3000 });
       console.error("Erro ao salvar cliente:", error);
    }
  };

  const deleteCliente = async () => {
    try {
      await api.delete(`/clientes/${cliente.id}`);
      setDeleteClienteDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente deletado', life: 3000 });
      buscarClientes();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o cliente', life: 3000 });
      console.error("Erro ao deletar cliente:", error);
    }
  };

  const deleteClienteDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteClienteDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteCliente} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editCliente(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteCliente(rowData)} />
      </React.Fragment>
    );
  };

  const clientesFiltrados = sortItems(clientes.filter((item) => `${item.nome} ${item.cpf} ${item.telefone} ${item.endereco}`.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="card">
      <Toast ref={toast} />
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Relacionamento" title="Clientes" description="Consulte e mantenha atualizados os clientes da oficina." />} end={<Button label="Adicionar cliente" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por nome, CPF, telefone ou endereço" sortField={sortField} sortOrder={sortOrder} onSortFieldChange={setSortField} onSortOrderChange={setSortOrder} sortOptions={sortOptions} />

          <DataTable value={clientesFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum cliente encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="nome" header="Nome" sortable></Column>
            <Column field="cpf" header="CPF" sortable></Column>
            <Column field="telefone" header="Telefone" sortable></Column>
            <Column field="endereco" header="Endereço" sortable></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar cliente' : 'Novo cliente'}
          description="Cadastre os dados de contato e identificação do cliente."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar cliente'}
          onCancel={hideDialog}
          onSubmit={saveCliente}
        >
          <AdminFormSection title="Identificação e contato" description="Informe os dados usados para localizar e atender o cliente.">
            <div className="admin-form-grid">
              <div className="p-field admin-form-wide">
                <label htmlFor="nome">Nome completo *</label>
                <InputText id="nome" value={cliente.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus placeholder="Ex.: João da Silva" />
              </div>
              <div className="p-field">
                <label htmlFor="cpf">CPF *</label>
                <InputText id="cpf" value={cliente.cpf} onChange={(e) => onInputChange(e, 'cpf')} required placeholder="Apenas números (11 dígitos)" />
              </div>
              <div className="p-field">
                <label htmlFor="telefone">Telefone *</label>
                <InputText id="telefone" value={cliente.telefone} onChange={(e) => onInputChange(e, 'telefone')} required placeholder="(31) 99999-8888" />
              </div>
              <div className="p-field admin-form-wide">
                <label htmlFor="endereco">Endereço *</label>
                <InputText id="endereco" value={cliente.endereco} onChange={(e) => onInputChange(e, 'endereco')} required placeholder="Rua, número, bairro e cidade" />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}

      {/* Dialog para Deletar Cliente */}
      <Dialog visible={deleteClienteDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deleteClienteDialogFooter} onHide={hideDeleteClienteDialog} closable={true} closeIcon="pi pi-times">
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {cliente && <span>Tem certeza que deseja deletar o cliente <b>{cliente.nome}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudCliente;