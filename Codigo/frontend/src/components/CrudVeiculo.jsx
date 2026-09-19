import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './CrudUsuario.css';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import ManagementFilters from './ManagementFilters';

const CrudVeiculo = () => {
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoDialog, setVeiculoDialog] = useState(false);
  const [deleteVeiculoDialog, setDeleteVeiculoDialog] = useState(false);
  const [veiculo, setVeiculo] = useState({
    id: null,
    placa: '',
    modelo: '',
    montadora: '',
    ano_modelo: '',
    ano_fabricacao: '',
    cor: '',
    cambio: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const toast = useRef(null);
  const [montadorasOptions, setMontadorasOptions] = useState([]);
  const [modelosOptions, setModelosOptions] = useState([]);
  const [selectedMontadora, setSelectedMontadora] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');

    useEffect(() => {
    api.get('/fipe/marcas')
      .then(response => {
        const formattedMarcas = response.data.map(marca => ({ label: marca.nome, value: marca.codigo }));
        setMontadorasOptions(formattedMarcas);
      })
      .catch(error => console.error("Erro ao buscar montadoras:", error));
  }, []);

  useEffect(() => {
    if (selectedMontadora) {
      setModelosOptions([]);
      setVeiculo(prev => ({ ...prev, modelo: '' }));

      api.get(`/fipe/marcas/${selectedMontadora}/modelos`)
        .then(response => {
          const formattedModelos = response.data.modelos.map(modelo => ({ label: modelo.nome, value: modelo.nome }));
          setModelosOptions(formattedModelos);
        })
        .catch(error => console.error("Erro ao buscar modelos:", error));
    }
  }, [selectedMontadora]);

  useEffect(() => {
    api.get('/clientes')
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => console.error("Erro ao buscar clientes:", error));
  }, []);

  const cambios = [
    { label: 'MANUAL', value: 'MANUAL' },
    { label: 'AUTOMATICO', value: 'AUTOMATICO' },
    { label: 'CVT', value: 'CVT' },
    { label: 'AUTOMATIZADO', value: 'AUTOMATIZADO' },
    { label: 'DCT', value: 'DCT' }
  ];

  useEffect(() => {
    buscarVeiculos();
  }, []);

  const buscarVeiculos = async () => {
    try {
      const response = await api.get('/veiculos');
      setVeiculos(response.data);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os veículos.', life: 3000 });
    }
  };

  const openNew = () => {
    setVeiculo({
      id: null,
      placa: '',
      modelo: '',
      montadora: '',
      ano_modelo: '',
      ano_fabricacao: '',
      cor: '',
      cambio: null,
      cliente: null,
    });
    setIsEditing(false);
    setVeiculoDialog(true);
  };

  const hideDialog = () => setVeiculoDialog(false);
  const hideDeleteVeiculoDialog = () => setDeleteVeiculoDialog(false);

  const editVeiculo = (v) => {
    let _veiculo = { ...v };
    if (_veiculo.cliente && clientes.length > 0) {
        _veiculo.cliente = clientes.find(c => c.id === _veiculo.cliente.id) || null;
    }
    
    setVeiculo(_veiculo); 
    setIsEditing(true);
    setVeiculoDialog(true);
  };

  const confirmDeleteVeiculo = (v) => {
    setVeiculo(v);
    setDeleteVeiculoDialog(true);
  };

  
  const onInputChange = (e, name) => {
    const val = e && e.target ? e.target.value : e && e.value !== undefined ? e.value : '';
    setVeiculo(prev => ({ ...prev, [name]: val }));
  };

  const onDropdownChange = (e, name) => {
    const val = e?.value ?? null;
    setVeiculo(prev => ({ ...prev, [name]: val }));
  };

  const onMontadoraChange = (e) => {
    const montadoraCodigo = e.value;
    setSelectedMontadora(montadoraCodigo);

    const montadoraNome = montadorasOptions.find(m => m.value === montadoraCodigo)?.label || '';
    setVeiculo(prev => ({ ...prev, montadora: montadoraNome, modelo: '' }));
  };

  const saveVeiculo = async () => {
    
    if (!veiculo.placa || !veiculo.modelo || !veiculo.montadora ||
        !veiculo.ano_modelo || !veiculo.ano_fabricacao || !veiculo.cambio || !veiculo.cliente) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos obrigatórios.', life: 3000 });
      return;
    }

    const veiculoDto = {
        ...veiculo,
        clienteId: veiculo.cliente.id
    };
    delete veiculoDto.cliente;

    try {
      if (isEditing) {
        await api.put(`/veiculos/${veiculo.id}`, veiculoDto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Veículo Atualizado', life: 3000 });
      } else {
        await api.post('/veiculos', veiculoDto);
        toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Veículo Criado', life: 3000 });
      }
      setVeiculoDialog(false);
      buscarVeiculos();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Não foi possível salvar o veículo.';
      toast.current.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 3000 });
    }
  };

  const deleteVeiculo = async () => {
    try {
      await api.delete(`/veiculos/${veiculo.id}`);
      setDeleteVeiculoDialog(false);
      toast.current.show({ severity: 'success', summary: 'Sucesso', detail: 'Veículo deletado', life: 3000 });
      buscarVeiculos();
    } catch {
      toast.current.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível deletar o veículo', life: 3000 });
    }
  };

  const veiculoDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000ff', color: 'white' }} label="Cancelar" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button style={{ backgroundColor: '#000000ff', color: 'white' }} label="Salvar" icon="pi pi-check" onClick={saveVeiculo} />
    </React.Fragment>
  );

  const deleteVeiculoDialogFooter = (
    <React.Fragment>
      <Button style={{ backgroundColor: '#000000ff', color: 'white' }} label="Não" icon="pi pi-times" outlined onClick={hideDeleteVeiculoDialog} />
      <Button style={{ backgroundColor: '#000000ff', color: 'white' }} label="Sim" icon="pi pi-check" severity="danger" onClick={deleteVeiculo} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button style={{ backgroundColor: '#000000ff', color: 'white' }} icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editVeiculo(rowData)} />
        <Button style={{ backgroundColor: '#000000ff', color: 'red' }} icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteVeiculo(rowData)} />
      </React.Fragment>
    );
  };

  const veiculosFiltrados = veiculos.filter((item) => `${item.placa} ${item.modelo} ${item.montadora} ${item.cor} ${item.cambio}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <Toast ref={toast} />
      <Toolbar className="p-mb-4" start={<div className="my-2"><h2 className="titulo">Gerenciamento de Veículos</h2></div>} end={<Button style={{ backgroundColor: '#000000ff', color: 'white' }} label="Adicionar Novo Veículo" icon="pi pi-plus" severity="success" onClick={openNew} />} />
      <ManagementFilters search={search} onSearch={setSearch} placeholder="Buscar por placa, modelo, montadora ou cor" />

      <DataTable value={veiculosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum veículo encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
        <Column field="placa" header="Placa" sortable></Column>
        <Column field="modelo" header="Modelo" sortable></Column>
        <Column field="montadora" header="Montadora" sortable></Column>
        <Column field="ano_modelo" header="Ano Modelo" sortable></Column>
        <Column field="ano_fabricacao" header="Ano Fabricação" sortable></Column>
        <Column field="cor" header="Cor" sortable></Column>
        <Column field="cambio" header="Câmbio" sortable></Column>
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
      </DataTable>

      <Dialog
        visible={veiculoDialog}
        style={{ width: '520px' }}
        header={isEditing ? 'Editar Veículo' : 'Adicionar Veículo'}
        modal
        className="p-fluid form-dialog vehicle-dialog"
        footer={veiculoDialogFooter}
        onHide={hideDialog}
        closable
        closeIcon="pi pi-times"
      >
        <div className="vehicle-form-grid">
        <div className="p-field vehicle-form-wide">
          <label htmlFor="cliente">Cliente *</label>
          <Dropdown 
            id="cliente" 
            value={veiculo.cliente}
            options={clientes}
            optionLabel="nome" 
            onChange={(e) => onDropdownChange(e, 'cliente')} 
            placeholder="Selecione o Cliente" 
            filter
            filterBy="nome"
            showClear
            required
          />
        </div>
        
        <div className="p-field">
          <label htmlFor="placa">Placa</label>
          <InputText style={{ padding: '8px' }} id="placa" value={veiculo.placa} onChange={(e) => onInputChange(e, 'placa')} required />
        </div>

        <div className="p-field">
          <label htmlFor="montadora">Montadora</label>
          <Dropdown 
            id="montadora" 
            value={selectedMontadora}
            options={montadorasOptions} 
            onChange={onMontadoraChange} 
            placeholder="Selecione a Montadora" 
            filter
            filterBy="label"
            showClear
          />
        </div>

        <div className="p-field">
          <label htmlFor="modelo">Modelo</label>
          <Dropdown 
            id="modelo" 
            value={veiculo.modelo} 
            options={modelosOptions} 
            onChange={(e) => onInputChange(e, 'modelo')}
            placeholder="Selecione o Modelo" 
            disabled={!selectedMontadora} 
            filter 
            filterBy="label"
            showClear
          />
        </div>

        <div className="p-field">
          <label htmlFor="ano_modelo">Ano Modelo</label>
          <InputMask style={{ padding: '8px' }} id="ano_modelo" mask="9999" value={veiculo.ano_modelo} onChange={(e) => onInputChange(e, 'ano_modelo')} placeholder="2024" required />
        </div>

        <div className="p-field">
          <label htmlFor="ano_fabricacao">Ano de Fabricação</label>
          <InputMask style={{ padding: '8px' }} id="ano_fabricacao" mask="9999" value={veiculo.ano_fabricacao} onChange={(e) => onInputChange(e, 'ano_fabricacao')} placeholder="2024" required />
        </div>

        <div className="p-field">
          <label htmlFor="cor">Cor</label>
          <InputText style={{ padding: '8px' }} id="cor" value={veiculo.cor} onChange={(e) => onInputChange(e, 'cor')} />
        </div>

        <div className="p-field">
          <label htmlFor="cambio">Câmbio</label>
          <Dropdown id="cambio" value={veiculo.cambio} options={cambios} onChange={(e) => onDropdownChange(e, 'cambio')} placeholder="Selecione o câmbio" required />
        </div>
        </div>
      </Dialog>

      <Dialog
        visible={deleteVeiculoDialog}
        style={{ width: '450px' }}
        header="Confirmação"
        modal
        footer={deleteVeiculoDialogFooter}
        onHide={hideDeleteVeiculoDialog}
        closable
        closeIcon="pi pi-times"
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
          {veiculo && <span>Gostaria de deletar o veículo? <b>{veiculo.modelo}</b>?</span>}
        </div>
      </Dialog>
    </div>
  );
};

export default CrudVeiculo;
