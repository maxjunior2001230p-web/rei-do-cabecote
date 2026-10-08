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
import { FileUpload } from 'primereact/fileupload';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';
import { getMissingRequiredFields } from '../utils/formValidation';

const productSortOptions = [
  { label: 'Nome', field: 'nome' },
  { label: 'Preço', field: 'precoVenda' },
  { label: 'Estoque', field: 'quantidade' },
  { label: 'Status', field: 'statusVenda' },
  { label: 'Categoria', field: 'categoria' },
];

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://rei-do-cabecote-production.up.railway.app';

const CrudProdutoVenda = () => {
  
  const [produtosVenda, setProdutosVenda] = useState([]);

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
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [stockFilter, setStockFilter] = useState(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('nome', productSortOptions);
  const toast = useRef(null);
  const fileUploadRef = useRef(null); 
  const loadProduto = useCallback(async (id) => {
    const response = await api.get('/produtosvenda');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar produto:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o produto.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/produtos-venda',
    emptyValue: emptyProdutoVenda,
    setValue: setProdutoVenda,
    setIsEditing,
    loadById: loadProduto,
    onLoadError: onFormLoadError,
  });

 
  const statusVendaOptions = [
    { label: 'Disponível', value: 'DISPONIVEL' },
    { label: 'Vendido', value: 'VENDIDO' },
  ];
  const stockFilterOptions = [
    { label: 'Com estoque', value: 'in-stock' },
    { label: 'Sem estoque', value: 'out-of-stock' },
  ];
  const categoryOptions = [...new Set(produtosVenda.map((item) => item.categoria?.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
    .map((category) => ({ label: category, value: category }));

  
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
    const missingFields = getMissingRequiredFields({
      'Nome do produto': produtoVenda.nome,
      Estoque: produtoVenda.quantidade,
      'Preço de venda': produtoVenda.precoVenda,
      Status: produtoVenda.statusVenda,
    });
    if (missingFields.length) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`, life: 5000 });
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

      finishSave();
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
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.clear(); 
    openNewRoute();
  };

  const hideDialog = closeForm;

  const hideDeleteProdutoVendaDialog = () => {
    setDeleteProdutoVendaDialog(false);
  };

  const editProdutoVenda = (produto) => {
    setSelectedFile(null);
    if (fileUploadRef.current) fileUploadRef.current.clear();
    openEdit(produto);
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

 
  const deleteProdutoVendaDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteProdutoVendaDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteProdutoVenda} />
    </React.Fragment>
  );

  
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editProdutoVenda(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteProdutoVenda(rowData)} />
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

  const produtosFiltrados = sortItems(produtosVenda.filter((item) => {
    const searchable = `${item.nome} ${item.descricao} ${item.categoria} ${item.statusVenda}`.toLowerCase();
    return searchable.includes(search.toLowerCase())
      && (!categoryFilter || item.categoria?.trim() === categoryFilter)
      && (!statusFilter || item.statusVenda === statusFilter)
      && (!stockFilter || (stockFilter === 'in-stock' ? Number(item.quantidade) > 0 : Number(item.quantidade) <= 0));
  }));
  
  
  return (
    <div className="card">
      <Toast ref={toast} />
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Estoque e catálogo" title="Produtos à venda" description="Organize os produtos, preços e disponibilidade na vitrine." />} end={<Button label="Adicionar produto" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters
            search={search}
            onSearch={setSearch}
            placeholder="Buscar por produto, categoria ou status"
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            sortOptions={sortOptions}
            resultCount={produtosFiltrados.length}
            hasActiveFilters={Boolean(search || categoryFilter || statusFilter || stockFilter)}
            onClearFilters={() => {
              setSearch('');
              setCategoryFilter(null);
              setStatusFilter(null);
              setStockFilter(null);
            }}
          >
            <Dropdown aria-label="Filtrar produtos por categoria" value={categoryFilter} options={categoryOptions} onChange={(event) => setCategoryFilter(event.value)} placeholder="Todas as categorias" showClear disabled={!categoryOptions.length} />
            <Dropdown aria-label="Filtrar produtos por disponibilidade" value={statusFilter} options={statusVendaOptions} onChange={(event) => setStatusFilter(event.value)} placeholder="Todos os status" showClear />
            <Dropdown aria-label="Filtrar produtos por estoque" value={stockFilter} options={stockFilterOptions} onChange={(event) => setStockFilter(event.value)} placeholder="Qualquer estoque" showClear />
          </ManagementFilters>
          <DataTable value={produtosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum produto encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="nome" header="Nome"></Column>
            <Column field="precoVenda" header="Preço" body={precoVendaBodyTemplate}></Column>
            <Column field="quantidade" header="Qtd."></Column>
            <Column field="statusVenda" header="Status"></Column>
            <Column field="categoria" header="Categoria"></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar produto' : 'Novo produto'}
          description="Cadastre as informações, disponibilidade e imagem do produto."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar produto'}
          onCancel={hideDialog}
          onSubmit={saveProdutoVenda}
        >
          <AdminFormSection title="Informações do produto" description="Identifique o produto e descreva sua aplicação ou estado.">
            <div className="admin-form-grid">
              <div className="p-field admin-form-wide">
                <label htmlFor="nome">Nome do produto *</label>
                <InputText id="nome" value={produtoVenda.nome} onChange={(e) => onInputChange(e, 'nome')} placeholder="Ex.: Cabeçote Honda Civic" required autoFocus />
              </div>
              <div className="p-field admin-form-wide">
                <label htmlFor="descricao">Descrição</label>
                <InputTextarea id="descricao" value={produtoVenda.descricao} onChange={(e) => onInputChange(e, 'descricao')} rows={3} placeholder="Descreva aplicação, estado ou compatibilidade." />
              </div>
            </div>
          </AdminFormSection>
          <AdminFormSection title="Preço e disponibilidade" description="Defina estoque, preço de venda e situação do anúncio.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="quantidade">Estoque *</label>
                <InputNumber id="quantidade" value={produtoVenda.quantidade} onValueChange={(e) => onInputNumberChange(e, 'quantidade')} mode="decimal" min={0} />
              </div>
              <div className="p-field">
                <label htmlFor="precoVenda">Preço de venda *</label>
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
            </div>
          </AdminFormSection>
          <AdminFormSection title="Imagem do produto" description="Envie uma imagem de até 1 MB; ela será enviada ao salvar o formulário.">
            <div className="admin-form-grid">
              {isEditing && produtoVenda.nomeArquivoImagem && (
                <div className="admin-form-field">
                  <label>Imagem atual</label>
                  <img
                    src={`${BACKEND_URL}/imagens/${produtoVenda.nomeArquivoImagem}`}
                    alt={produtoVenda.nome}
                    className="product-current-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      console.error('Erro ao carregar imagem:', e.currentTarget.src);
                    }}
                  />
                </div>
              )}
              <div className="admin-form-field admin-form-wide">
                <label htmlFor="imagem">{isEditing ? 'Substituir imagem' : 'Imagem'}</label>
                <FileUpload
                  ref={fileUploadRef}
                  name="imagem"
                  chooseLabel="Selecionar imagem"
                  uploadLabel="Enviar"
                  cancelLabel="Limpar"
                  customUpload
                  onSelect={onFileSelect}
                  onClear={onFileClear}
                  auto
                  accept="image/*"
                  maxFileSize={1000000}
                  emptyTemplate={<p className="admin-upload-empty">Arraste uma imagem para cá ou selecione um arquivo.</p>}
                />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}
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