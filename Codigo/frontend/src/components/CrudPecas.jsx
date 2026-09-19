import React, { useState, useEffect, useRef } from 'react';
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

const CrudPecas = () => {
  const [pecas, setPecas] = useState([]);
  const [pecaDialog, setPecaDialog] = useState(false);
  const [deletePecaDialog, setDeletePecaDialog] = useState(false);
  const [peca, setPeca] = useState({ id: null, nome: '', descricao: '', preco: 0, fornecedor: '', situacao: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [situationFilter, setSituationFilter] = useState(null);
  const [fornecedores, setFornecedores] = useState([]); // NOVO ESTADO: para armazenar fornecedores
  const toast = useRef(null);

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

  const openNew = () => {
    setPeca({ id: null, nome: '', descricao: '', preco: 0, fornecedor: '', situacao: 'Em cadastro' });
    setIsEditing(false);
    setPecaDialog(true);
  };

  const hideDialog = () => {
    setPecaDialog(false);
  };

  const hideDeletePecaDialog = () => {
    setDeletePecaDialog(false);
  };

  const editPeca = (peca) => {
    setPeca({ ...peca });
    setIsEditing(true);
    setPecaDialog(true);
  };

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
    if (!peca.nome || !peca.preco || !peca.fornecedor) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos Nome, Preço e Fornecedor', life: 3000 });
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
      setPecaDialog(false);
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

  const pecaDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={savePeca} />
    </React.Fragment>
  );

  const deletePecaDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeletePecaDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deletePeca} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editPeca(rowData)} />
        <Button style={{ backgroundColor: '#000000', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeletePeca(rowData)} />
      </React.Fragment>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rowData.preco);
  };

  const pecasFiltradas = pecas.filter((item) => {
    const searchable = `${item.nome} ${item.descricao} ${item.fornecedor} ${item.situacao}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!situationFilter || item.situacao === situationFilter);
  });

  return (
    <div className="card parts-management-card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<div className="screen-heading"><span className="screen-kicker">Catálogo</span><h2 className="titulo">Peças</h2><p>Cadastre e acompanhe as peças usadas na operação.</p></div>} end={<Button className="primary-action" label="Adicionar peça" icon="pi pi-plus" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por peça, fornecedor ou descrição">
        <Dropdown value={situationFilter} options={situacoes} onChange={(event) => setSituationFilter(event.value)} placeholder="Todas as situações" showClear />
      </ManagementFilters>

      <DataTable value={pecasFiltradas} responsiveLayout="scroll" emptyMessage="Nenhuma peça encontrada." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="nome" header="Nome" sortable></Column>
        <Column field="preco" header="Preço" body={priceBodyTemplate} sortable></Column>
        <Column field="fornecedor" header="Fornecedor" sortable></Column>
        <Column field="situacao" header="Situação" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

      <Dialog
        visible={pecaDialog}
        style={{ width: '450px' }}
        header={isEditing ? "Editar Peça" : "Adicionar Peça"}
        modal
        className="p-fluid form-dialog parts-dialog"
        footer={pecaDialogFooter}
        onHide={hideDialog}
        closable={true}
        closeIcon="pi pi-times"
      >
        <div className="parts-form-grid">
        <div className="p-field">
          <label htmlFor="nome">Nome</label>
          <InputText id="nome" value={peca.nome} onChange={(e) => onInputChange(e, 'nome')} placeholder="Ex.: Junta do cabeçote" required autoFocus />
        </div>
        <div className="p-field">
          <label htmlFor="descricao">Descrição</label>
          <InputText id="descricao" value={peca.descricao} onChange={(e) => onInputChange(e, 'descricao')} placeholder="Detalhes ou aplicação da peça" />
        </div>
        <div className="p-field">
          <label htmlFor="preco">Preço</label>
          <InputNumber id="preco" value={peca.preco} onValueChange={(e) => onInputNumberChange(e, 'preco')} mode="currency" currency="BRL" locale="pt-BR" placeholder="R$ 0,00" />
        </div>
        
        {/* ATUALIZADO: Input de Fornecedor agora é um Dropdown */}
        <div className="p-field">
          <label htmlFor="fornecedor">Fornecedor</label>
          <Dropdown
            id="fornecedor"
            value={peca.fornecedor}
            options={fornecedores}
            onChange={(e) => onInputChange(e, 'fornecedor')}
            placeholder="Selecione o Fornecedor"
            required
          />
        </div>

        <div className="p-field">
          <label htmlFor="situacao">Situação</label>
          {isEditing ? (
            <Dropdown id="situacao" value={peca.situacao} options={situacoes} onChange={(e) => onInputChange(e, 'situacao')} placeholder="Selecione a situação" />
          ) : (
            <InputText style={{padding: '8px'}} id="situacao" value={peca.situacao} disabled />
          )}
        </div>
        </div>
      </Dialog>

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