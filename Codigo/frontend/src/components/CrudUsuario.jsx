import React, { useState, useEffect, useRef, useCallback } from 'react';
// O useNavigate não é mais necessário aqui para o botão "Voltar"
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
import ManagementFilters from './ManagementFilters';
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';

const userSortOptions = [
  { label: 'Nome', field: 'nome' },
  { label: 'E-mail', field: 'email' },
  { label: 'Cargo', field: 'cargo' },
];

const CrudUsuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
  const [usuario, setUsuario] = useState({ id: null, nome: '', email: '', senha: '', cargo: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('nome', userSortOptions);
  const toast = useRef(null);
  const loadUsuario = useCallback(async (id) => {
    const response = await api.get('/usuarios');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar usuário:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o usuário.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/usuarios',
    emptyValue: { id: null, nome: '', email: '', senha: '', cargo: '' },
    setValue: setUsuario,
    setIsEditing,
    loadById: loadUsuario,
    onLoadError: onFormLoadError,
  });
  
  const cargos = [
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Funcionário', value: 'Funcionario' }
  ];

  useEffect(() => {
    buscarUsuario();
  }, []);

  const buscarUsuario = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const openNew = openNewRoute;

  const hideDialog = closeForm;

  const hideDeleteUsuarioDialog = () => {
    setDeleteUsuarioDialog(false);
  };

  const editUsuario = (usuario) => openEdit({ ...usuario, senha: '' });

  const confirmDeleteUsuario = (usuario) => {
    setUsuario(usuario);
    setDeleteUsuarioDialog(true);
  };

  const onInputChange = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _usuario = { ...usuario };
    _usuario[name] = val;
    setUsuario(_usuario);
  };

  const saveUsuario = async () => {
    if (!usuario.nome || !usuario.email || (!isEditing && !usuario.senha) || !usuario.cargo) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario.email)) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'O formato do email é inválido.', life: 3000 });
      return;
    }

    if (!isEditing && usuario.senha.length < 6) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'A senha deve ter no mínimo 6 caracteres.', life: 3000 });
      return;
    }

    const _usuario = { ...usuario };

    try {
      if (isEditing) {
        await api.put(`/usuarios/${_usuario.id}`, _usuario);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
      } else {
        await api.post('/usuarios', _usuario);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
      }
      finishSave();
      buscarUsuario();
    } catch (error) {
      const detail = isEditing ? 'Não foi possível atualizar o usuário' : 'Não foi possível criar o usuário';
      toast.current.show({ severity: 'error', summary: 'Erro', detail, life: 3000 });
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const deleteUsuario = async () => {
    try {
      await api.delete(`/usuarios/${usuario.id}`);
      setDeleteUsuarioDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário deletado', life: 3000 });
      buscarUsuario();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o usuário', life: 3000 });
    }
  };

  const deleteUsuarioDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteUsuarioDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteUsuario} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editUsuario(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUsuario(rowData)} />
      </React.Fragment>
    );
  };

  const usuariosFiltrados = sortItems(usuarios.filter((item) => `${item.nome} ${item.email} ${item.cargo}`.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="card">
      <Toast ref={toast} />
      {/* A barra de ferramentas agora só tem o título e o botão de adicionar */}
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Acesso e equipe" title="Usuários" description="Controle os acessos administrativos da oficina." />} end={<Button label="Adicionar usuário" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por nome, email ou cargo" sortField={sortField} sortOrder={sortOrder} onSortFieldChange={setSortField} onSortOrderChange={setSortOrder} sortOptions={sortOptions} />
          <DataTable value={usuariosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum usuário encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="nome" header="Nome" sortable></Column>
            <Column field="email" header="Email" sortable></Column>
            <Column field="cargo" header="Cargo" sortable></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar usuário' : 'Novo usuário'}
          description="Defina a identificação, as credenciais e o nível de acesso à administração."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar usuário'}
          onCancel={hideDialog}
          onSubmit={saveUsuario}
        >
          <AdminFormSection title="Dados do usuário" description="Estas informações identificam a pessoa na equipe da oficina.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="nome">Nome completo *</label>
                <InputText id="nome" value={usuario.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus placeholder="Nome do usuário" />
              </div>
              <div className="p-field">
                <label htmlFor="email">E-mail *</label>
                <InputText id="email" type="email" value={usuario.email} onChange={(e) => onInputChange(e, 'email')} required placeholder="nome@empresa.com" />
              </div>
            </div>
          </AdminFormSection>
          <AdminFormSection title="Acesso ao sistema" description="Ao editar, deixe a senha vazia para manter a senha atual.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="senha">{isEditing ? 'Nova senha' : 'Senha *'}</label>
                <InputText id="senha" value={usuario.senha} onChange={(e) => onInputChange(e, 'senha')} type="password" required={!isEditing} placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Mínimo de 6 caracteres'} />
              </div>
              <div className="p-field">
                <label htmlFor="cargo">Perfil de acesso *</label>
                <Dropdown id="cargo" value={usuario.cargo} options={cargos} onChange={(e) => onInputChange(e, 'cargo')} placeholder="Selecione o perfil" required />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}

      <Dialog visible={deleteUsuarioDialog} style={{ width: '450px' }} header="Confirmação" modal footer={deleteUsuarioDialogFooter} onHide={hideDeleteUsuarioDialog} closable={true} closeIcon="pi pi-times">
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {usuario && <span>Tem certeza que deseja deletar o usuário <b>{usuario.nome}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudUsuario;