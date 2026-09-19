import React, { useState, useEffect, useRef } from 'react';
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
// InputMask pode ser uma boa alternativa para CPF e Telefone, mas seguindo o template, usaremos InputText com validação.

const CrudCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteDialog, setClienteDialog] = useState(false);
  const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
  const [cliente, setCliente] = useState({ id: null, nome: '', cpf: '', endereco: '', telefone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useRef(null);
  
  const emptyCliente = { id: null, nome: '', cpf: '', endereco: '', telefone: '' };

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

  const openNew = () => {
    setCliente(emptyCliente);
    setIsEditing(false);
    setClienteDialog(true);
  };

  const hideDialog = () => {
    setClienteDialog(false);
  };

  const hideDeleteClienteDialog = () => {
    setDeleteClienteDialog(false);
  };

  const editCliente = (cliente) => {
    setCliente({ ...cliente }); // Carrega o cliente para edição
    setIsEditing(true);
    setClienteDialog(true);
  };

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
      setClienteDialog(false);
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

  const clienteDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={saveCliente} />
    </React.Fragment>
  );

  const deleteClienteDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteClienteDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteCliente} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editCliente(rowData)} />
        <Button style={{ backgroundColor: '#000000', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteCliente(rowData)} />
      </React.Fragment>
    );
  };

  const clientesFiltrados = clientes.filter((item) => `${item.nome} ${item.cpf} ${item.telefone} ${item.endereco}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<h2 className="titulo">Gerenciamento de Clientes</h2>} end={<Button style={{ backgroundColor: '#000000', color: 'white' }} label="Adicionar Novo Cliente" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por nome, CPF, telefone ou endereço" />

      <DataTable value={clientesFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum cliente encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="nome" header="Nome" sortable></Column>
        <Column field="cpf" header="CPF" sortable></Column>
        <Column field="telefone" header="Telefone" sortable></Column>
        <Column field="endereco" header="Endereço" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

      {/* Dialog para Adicionar/Editar Cliente */}
      <Dialog visible={clienteDialog} style={{ width: '450px' }} header={isEditing ? "Editar Cliente" : "Adicionar Cliente"} modal className="p-fluid form-dialog" footer={clienteDialogFooter} onHide={hideDialog} closable closeIcon="pi pi-times">
        <div className="p-field">
          <label htmlFor="nome">Nome</label>
          <InputText style={{padding: '8px'}} id="nome" value={cliente.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus />
        </div>
        <div className="p-field">
          <label htmlFor="cpf">CPF</label>
          <InputText style={{padding: '8px'}} id="cpf" value={cliente.cpf} onChange={(e) => onInputChange(e, 'cpf')} required placeholder="Apenas números (11 dígitos)" />
        </div>
         <div className="p-field">
          <label htmlFor="telefone">Telefone</label>
          <InputText style={{padding: '8px'}} id="telefone" value={cliente.telefone} onChange={(e) => onInputChange(e, 'telefone')} required placeholder="(31)99999-8888" />
        </div>
        <div className="p-field">
          <label htmlFor="endereco">Endereço</label>
          <InputText style={{padding: '8px'}} id="endereco" value={cliente.endereco} onChange={(e) => onInputChange(e, 'endereco')} required />
        </div>
      </Dialog>
      
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