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
import { Dropdown } from 'primereact/dropdown'; 
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import ManagementFilters from './ManagementFilters';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

const CrudProdutoVenda = () => {
  
  const [produtosVenda, setProdutosVenda] = useState([]);

  const [produtoVendaDialog, setProdutoVendaDialog] = useState(false);
  const [deleteProdutoVendaDialog, setDeleteProdutoVendaDialog] = useState(false);

  const [produtoVenda, setProdutoVenda] = useState({
    id: null,
    nome: '',
    descricao: '',
    quantidade: 0,
    precoVenda: 0.0,
    categoria: '',
    statusVenda: 'DISPONIVEL', 
  });
  
  
  const emptyProdutoVenda = {
    id: null,
    nome: '',
    descricao: '',
    quantidade: 0,
    precoVenda: 0.0,
    categoria: '',
    statusVenda: 'DISPONIVEL',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const toast = useRef(null);
  const fileUploadRef = useRef(null); 

 
  const statusVendaOptions = [
    { label: 'Disponível', value: 'DISPONIVEL' },
    { label: 'Vendido', value: 'VENDIDO' },
  ];

  
  useEffect(() => {
    buscarProdutosVenda();
  }, []);

 
  const buscarProdutosVenda = async () => {
    try {
      const response = await api.get('/produtosvenda');
      setProdutosVenda(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível buscar os produtos', life: 3000 });
    }
  };

  const saveProdutoVenda = async () => {
   
    if (!produtoVenda.nome || !produtoVenda.statusVenda) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha os campos obrigatórios (Nome, Status)', life: 3000 });
      return;
    }

    if (produtoVenda.quantidade < 0 || produtoVenda.precoVenda < 0) {
        toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Quantidade e Preço devem ser 0 ou mais.', life: 3000 });
        return;
    }

    
    let _produtoVendaDto = {
        nome: produtoVenda.nome,
        descricao: produtoVenda.descricao,
        quantidade: produtoVenda.quantidade,
        precoVenda: produtoVenda.precoVenda,
        categoria: produtoVenda.categoria,
        statusVenda: produtoVenda.statusVenda,
       
    };

    try {
      let response;
      if (isEditing) {
       
        response = await api.put(`/produtosvenda/${produtoVenda.id}`, _produtoVendaDto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto Atualizado', life: 3000 });
      } else {
        
        response = await api.post('/produtosvenda', _produtoVendaDto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto Criado', life: 3000 });
      }

      
      const savedProductId = isEditing ? produtoVenda.id : response.data.id;

      
      if (selectedFile) {
        await uploadImagem(savedProductId, selectedFile);
        toast.current.show({ severity: 'info', summary: 'Info', detail: 'Imagem enviada com sucesso', life: 3000 });
      }

      setProdutoVendaDialog(false);
      setSelectedFile(null); 
      buscarProdutosVenda(); 
    } catch (error) {
      const errorMsg = isEditing ? 'Não foi possível atualizar o produto' : 'Não foi possível criar o produto';
      toast.current.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 3000 });
      console.error("Erro ao salvar produto:", error);
    }
  };

  const deleteProdutoVenda = async () => {
    try {
      await api.delete(`/produtosvenda/${produtoVenda.id}`);
      setDeleteProdutoVendaDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Produto deletado', life: 3000 });
      buscarProdutosVenda();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o produto', life: 3000 });
      console.error("Erro ao deletar produto:", error);
    }
  };

  // Função para o Upload da Imagem
  const uploadImagem = async (id, file) => {
    const formData = new FormData();
    formData.append('imagem', file); 

    try {
      await api.put(`/produtosvenda/${id}/imagem`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível enviar a imagem.', life: 3000 });
    }
  };


 

  const openNew = () => {
    setProdutoVenda(emptyProdutoVenda);
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.clear(); 
    setIsEditing(false);
    setProdutoVendaDialog(true);
  };

  const hideDialog = () => {
    setProdutoVendaDialog(false);
  };

  const hideDeleteProdutoVendaDialog = () => {
    setDeleteProdutoVendaDialog(false);
  };

  const editProdutoVenda = (produto) => {
    setProdutoVenda({ ...produto }); 
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.clear();
    setIsEditing(true);
    setProdutoVendaDialog(true);
  };

  const confirmDeleteProdutoVenda = (produto) => {
    setProdutoVenda(produto);
    setDeleteProdutoVendaDialog(true);
  };

  
 
  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _produtoVenda = { ...produtoVenda };
    _produtoVenda[name] = val;
    setProdutoVenda(_produtoVenda);
  };

  const onInputNumberChange = (e, name) => {
    const val = e.value || 0;
    let _produtoVenda = { ...produtoVenda };
    _produtoVenda[name] = val;
    setProdutoVenda(_produtoVenda);
  };

 
  const onDropdownChange = (e, name) => {
    const val = e.value;
    let _produtoVenda = { ...produtoVenda };
    _produtoVenda[name] = val;
    setProdutoVenda(_produtoVenda);
  };

 
  const onFileSelect = (e) => {
    
    const file = e.files[0];
    setSelectedFile(file);
    toast.current.show({ severity: 'info', summary: 'Info', detail: 'Arquivo selecionado. Será enviado ao salvar.', life: 3000 });
  };
  
  const onFileClear = () => {
    setSelectedFile(null);
  }

 
  const produtoVendaDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={saveProdutoVenda} />
    </React.Fragment>
  );

  const deleteProdutoVendaDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteProdutoVendaDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteProdutoVenda} />
    </React.Fragment>
  );

  
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editProdutoVenda(rowData)} />
        <Button style={{ backgroundColor: '#000000', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProdutoVenda(rowData)} />
      </React.Fragment>
    );
  };

  
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return null;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const precoVendaBodyTemplate = (rowData) => {
    return formatCurrency(rowData.precoVenda);
  };

  const produtosFiltrados = produtosVenda.filter((item) => {
    const searchable = `${item.nome} ${item.descricao} ${item.categoria} ${item.statusVenda}`.toLowerCase();
    return searchable.includes(search.toLowerCase()) && (!statusFilter || item.statusVenda === statusFilter);
  });
  
  
  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<h2 className="titulo">Gerenciamento de Produtos</h2>} end={<Button style={{ backgroundColor: '#000000', color: 'white' }} label="Adicionar Novo Produto" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por produto, categoria ou status">
        <Dropdown value={statusFilter} options={statusVendaOptions} onChange={(event) => setStatusFilter(event.value)} placeholder="Todos os status" showClear />
      </ManagementFilters>

      <DataTable value={produtosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum produto encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="nome" header="Nome" sortable></Column>
        
        <Column field="precoVenda" header="Preço" body={precoVendaBodyTemplate} sortable></Column>
        <Column field="quantidade" header="Qtd." sortable></Column>
        <Column field="statusVenda" header="Status" sortable></Column>
        <Column field="categoria" header="Categoria" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

    <Dialog 
        visible={produtoVendaDialog} 
      style={{ width: '680px' }} 
        header={isEditing ? "Editar Produto" : "Adicionar Produto"} 
        modal 
        className="p-fluid form-dialog product-dialog" 
        footer={produtoVendaDialogFooter} 
        onHide={hideDialog} 
        closable={true} 
        closeIcon="pi pi-times" 
      >
       
        
        <div className="product-form-grid">
        <div className="product-form-section product-form-section-wide">
          <span className="product-form-section-title">Informações do produto</span>
        </div>
        <div className="p-field product-form-section-wide">
          <label htmlFor="nome">Nome *</label>
          <InputText id="nome" value={produtoVenda.nome} onChange={(e) => onInputChange(e, 'nome')} placeholder="Ex.: Cabeçote Honda Civic" required autoFocus />
        </div>
        <div className="p-field product-form-section-wide">
          <label htmlFor="descricao">Descrição</label>
          <InputTextarea id="descricao" value={produtoVenda.descricao} onChange={(e) => onInputChange(e, 'descricao')} rows={3} placeholder="Descreva aplicação, estado ou compatibilidade." />
        </div>
        <div className="product-form-section product-form-section-wide">
          <span className="product-form-section-title">Preço e disponibilidade</span>
        </div>
        <div className="p-field">
          <label htmlFor="quantidade">Estoque *</label>
          <InputNumber id="quantidade" value={produtoVenda.quantidade} onValueChange={(e) => onInputNumberChange(e, 'quantidade')} mode="decimal" min={0} />
        </div>
        <div className="p-field">
          <label htmlFor="precoVenda">Preço de Venda *</label>
          <InputNumber id="precoVenda" value={produtoVenda.precoVenda} onValueChange={(e) => onInputNumberChange(e, 'precoVenda')} mode="currency" currency="BRL" locale="pt-BR" min={0} />
        </div>
        <div className="p-field">
          <label htmlFor="categoria">Categoria</label>
          <InputText id="categoria" value={produtoVenda.categoria} onChange={(e) => onInputChange(e, 'categoria')} placeholder="Ex.: Cabeçotes" />
        </div>
        <div className="p-field">
          <label htmlFor="statusVenda">Status *</label>
          <Dropdown id="statusVenda" value={produtoVenda.statusVenda} options={statusVendaOptions} onChange={(e) => onDropdownChange(e, 'statusVenda')} placeholder="Selecione o status" />
        </div>


        
        {isEditing && produtoVenda.nomeArquivoImagem && (
          <div className="p-field product-form-section-wide product-image-preview">
            <label>Imagem Atual</label>
            <img 
             
              src={`${BACKEND_URL}/imagens/${produtoVenda.nomeArquivoImagem}`} 
              alt={produtoVenda.nome} 
              style={{ 
                width: '150px', 
                height: '150px', 
                objectFit: 'cover',
                display: 'block', 
                margin: '10px auto', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
              
              onError={(e) => { 
                e.target.style.display = 'none'; 
                console.error("Erro ao carregar imagem:", e.target.src);
              }}
            />
          
          </div>
        )}
        

        <div className="p-field product-form-section-wide product-image-upload">
          <label htmlFor="imagem">{isEditing ? "Substituir Imagem" : "Imagem"}</label>
          <FileUpload 
            ref={fileUploadRef}
            name="imagem" 
            chooseLabel="Selecionar Imagem"
            uploadLabel="Enviar" 
            cancelLabel="Limpar"
            customUpload 
            onSelect={onFileSelect} 
            onClear={onFileClear}
            auto 
            accept="image/*" 
            maxFileSize={1000000} 
            emptyTemplate={<p style={{ textAlign: 'center' }}>Arraste ou selecione a imagem.</p>}
          />
          <small>A imagem só pode ser enviada ao clicar em "Salvar".</small>
        </div>
        </div>
        
      </Dialog>
      
      
     
      <Dialog visible={deleteProdutoVendaDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deleteProdutoVendaDialogFooter} onHide={hideDeleteProdutoVendaDialog} closable={true} closeIcon="pi pi-times">
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {produtoVenda && <span>Tem certeza que deseja deletar o produto <b>{produtoVenda.nome}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudProdutoVenda;