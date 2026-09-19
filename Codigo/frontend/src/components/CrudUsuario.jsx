import React, { useState, useEffect, useRef } from 'react';
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

const CrudUsuario = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioDialog, setUsuarioDialog] = useState(false);
  const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
  const [usuario, setUsuario] = useState({ id: null, nome: '', email: '', senha: '', cargo: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');
  const toast = useRef(null);
  
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

  const openNew = () => {
    setUsuario({ id: null, nome: '', email: '', senha: '', cargo: '' });
    setIsEditing(false);
    setUsuarioDialog(true);
  };

  const hideDialog = () => {
    setUsuarioDialog(false);
  };

  const hideDeleteUsuarioDialog = () => {
    setDeleteUsuarioDialog(false);
  };

  const editUsuario = (usuario) => {
    setUsuario({ ...usuario, senha: '' });
    setIsEditing(true);
    setUsuarioDialog(true);
  };

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

    let _usuario = { ...usuario };

    if (isEditing) {
      try {
        await api.put(`/usuarios/${_usuario.id}`, _usuario);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
      } catch {
        toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível atualizar o usuário', life: 3000 });
      }
    } else {
      try {
        await api.post('/usuarios', _usuario);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
      } catch {
        toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível criar o usuário', life: 3000 });
      }
    }
    setUsuarioDialog(false);
    buscarUsuario();
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

  const usuarioDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={saveUsuario} />
    </React.Fragment>
  );

  const deleteUsuarioDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteUsuarioDialog} />
      <Button style={{ backgroundColor: '#000000', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteUsuario} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editUsuario(rowData)} />
        <Button style={{ backgroundColor: '#000000', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteUsuario(rowData)} />
      </React.Fragment>
    );
  };

  const usuariosFiltrados = usuarios.filter((item) => `${item.nome} ${item.email} ${item.cargo}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <Toast ref={toast} />
      {/* A barra de ferramentas agora só tem o título e o botão de adicionar */}
      <Toolbar className="p-mb-4" start={<h2 className="titulo">Gerenciamento de Usuários</h2>} end={<Button style={{ backgroundColor: '#000000', color: 'white' }} label="Adicionar Novo Usuário" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por nome, email ou cargo" />

      <DataTable value={usuariosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum usuário encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="nome" header="Nome" sortable></Column>
        <Column field="email" header="Email" sortable></Column>
        <Column field="cargo" header="Cargo" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

      {/* Pop-ups permanecem os mesmos */}
      <Dialog visible={usuarioDialog} style={{ width: '450px' }} header={isEditing ? "Editar Usuário" : "Adicionar Usuário"} modal className="p-fluid form-dialog" footer={usuarioDialogFooter} onHide={hideDialog} closable closeIcon="pi pi-times">
        <div className="p-field">
          <label htmlFor="nome">Nome</label>
          <InputText style={{padding: '8px'}} id="nome" value={usuario.nome} onChange={(e) => onInputChange(e, 'nome')} required autoFocus />
        </div>
        <div className="p-field">
          <label htmlFor="email">Email</label>
          <InputText style={{padding: '8px'}} id="email" value={usuario.email} onChange={(e) => onInputChange(e, 'email')} required />
        </div>
        <div className="p-field">
          <label htmlFor="senha">Senha</label>
          <InputText style={{padding: '8px'}} id="senha" value={usuario.senha} onChange={(e) => onInputChange(e, 'senha')} type="password" required={!isEditing} placeholder={isEditing ? "Deixe em branco para não alterar" : ""} />
        </div>
        <div className="p-field">
          <label htmlFor="cargo">Cargo</label>
          <Dropdown id="cargo" value={usuario.cargo} options={cargos} onChange={(e) => onInputChange(e, 'cargo')} placeholder="Selecione o Cargo" required inputStyle={{padding: '8px'}} />
        </div>
      </Dialog>
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