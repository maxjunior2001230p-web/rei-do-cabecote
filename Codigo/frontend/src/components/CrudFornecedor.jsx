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
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask'; // 1. Importar o InputMask
import ManagementFilters from './ManagementFilters';

const CrudFornecedor = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorDialog, setFornecedorDialog] = useState(false);
  const [deleteFornecedorDialog, setDeleteFornecedorDialog] = useState(false);
  const [fornecedor, setFornecedor] = useState({ id: null, nome: '', cnpj: '', endereco: '', complemento: '', contato: '', categoria: null });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const toast = useRef(null);

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

  const openNew = () => {
    setFornecedor({ id: null, nome: '', cnpj: '', endereco: '', complemento: '', contato: '', categoria: null });
    setIsEditing(false);
    setFornecedorDialog(true);
  };

  const hideDialog = () => {
    setFornecedorDialog(false);
  };

  const hideDeleteFornecedorDialog = () => {
    setDeleteFornecedorDialog(false);
  };

  const editFornecedor = (fornecedor) => {
    setFornecedor({ ...fornecedor });
    setIsEditing(true);
    setFornecedorDialog(true);
  };

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
    if (!fornecedor.nome || !fornecedor.cnpj || !fornecedor.contato || !fornecedor.categoria) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
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
      setFornecedorDialog(false);
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

  const fornecedorDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={saveFornecedor} />
    </React.Fragment>
  );

  const deleteFornecedorDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteFornecedorDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteFornecedor} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editFornecedor(rowData)} />
        <Button style={{ backgroundColor: '#000000', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteFornecedor(rowData)} />
      </React.Fragment>
    );
  };

  const fornecedoresFiltrados = fornecedores.filter((item) => {
    const searchable = `${item.nome} ${item.cnpj} ${item.contato} ${item.categoria}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!categoryFilter || item.categoria === categoryFilter);
  });

  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<h2 className="titulo">Gerenciamento de Fornecedores</h2>} end={<Button style={{ backgroundColor: '#000000', color: 'white' }} label="Adicionar Novo Fornecedor" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por nome, CNPJ, contato ou categoria">
        <Dropdown value={categoryFilter} options={categorias} onChange={(event) => setCategoryFilter(event.value)} placeholder="Todas as categorias" showClear />
      </ManagementFilters>

      <DataTable value={fornecedoresFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum fornecedor encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="nome" header="Nome" sortable></Column>
        <Column field="cnpj" header="CNPJ" sortable></Column>
        <Column field="contato" header="Contato" sortable></Column>
        <Column field="categoria" header="Categoria" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

      <Dialog
        visible={fornecedorDialog}
        style={{ width: '450px' }}
        header={isEditing ? "Editar Fornecedor" : "Adicionar Fornecedor"}
        modal
        className="p-fluid form-dialog"
        footer={fornecedorDialogFooter}
        onHide={hideDialog}
        closable={true}
        closeIcon="pi pi-times"     
      >
        <div className="p-field">
          <label htmlFor="nome">Nome</label>
          <InputText style={{padding: '8px'}} id="nome" value={fornecedor.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus />
        </div>
        
        {/* 2. Substituir InputText por InputMask para CNPJ */}
        <div className="p-field">
          <label htmlFor="cnpj">CNPJ</label>
          <InputMask
            id="cnpj"
            value={fornecedor.cnpj}
            onChange={(e) => onInputChange(e, 'cnpj')}
            mask="99.999.999/9999-99"
            placeholder="99.999.999/9999-99"
            required
            style={{padding: '8px'}}
          />
        </div>

        <div className="p-field">
          <label htmlFor="endereco">Endereço</label>
          <InputText style={{padding: '8px'}} id="endereco" value={fornecedor.endereco} onChange={(e) => onInputChange(e, 'endereco')} />
        </div>
        <div className="p-field">
          <label htmlFor="complemento">Complemento</label>
          <InputText style={{padding: '8px'}} id="complemento" value={fornecedor.complemento} onChange={(e) => onInputChange(e, 'complemento')} />
        </div>

        {/* 3. Substituir InputText por InputMask para Contato */}
        <div className="p-field">
          <label htmlFor="contato">Contato</label>
          <InputMask
            id="contato"
            value={fornecedor.contato}
            onChange={(e) => onInputChange(e, 'contato')}
            mask="(99) 99999-9999"
            placeholder="(99) 99999-9999"
            required
            style={{padding: '8px'}}
          />
        </div>

        <div className="p-field">
          <label htmlFor="categoria">Categoria</label>
          <Dropdown
            id="categoria"
            value={fornecedor.categoria}
            options={categorias}
            onChange={(e) => onDropdownChange(e, 'categoria')}
            placeholder="Selecione a Categoria"
            required
            inputStyle={{padding: '8px'}}
          />
        </div>
      </Dialog>

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