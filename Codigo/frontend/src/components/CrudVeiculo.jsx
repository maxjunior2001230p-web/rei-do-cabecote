import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import AdminPageHeading from './AdminPageHeading';
import AdminFormPanel, { AdminFormSection } from './AdminFormPanel';
import AdminEntityPicker from './AdminEntityPicker';
import useAdminFormRoute from '../hooks/useAdminFormRoute';
import useManagementSort from '../hooks/useManagementSort';
import { getMissingRequiredFields } from '../utils/formValidation';

const vehicleSortOptions = [
  { label: 'Placa', field: 'placa' },
  { label: 'Modelo', field: 'modelo' },
  { label: 'Montadora', field: 'montadora' },
  { label: 'Ano modelo', field: 'ano_modelo' },
  { label: 'Ano de fabricação', field: 'ano_fabricacao' },
  { label: 'Cor', field: 'cor' },
];

const CrudVeiculo = () => {
  const [veiculos, setVeiculos] = useState([]);
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
  const [makeFilter, setMakeFilter] = useState(null);
  const [transmissionFilter, setTransmissionFilter] = useState(null);
  const [ownerFilter, setOwnerFilter] = useState(null);
  const { sortField, sortOrder, setSortField, setSortOrder, sortOptions, sortItems } = useManagementSort('placa', vehicleSortOptions);
  const loadVeiculo = useCallback(async (id) => {
    const response = await api.get('/veiculos');
    return response.data.find((item) => String(item.id) === id);
  }, []);
  const onFormLoadError = useCallback((error) => {
    console.error('Erro ao carregar veículo:', error);
    toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar o veículo.', life: 3000 });
  }, []);
  const { isFormRoute, openNew: openNewRoute, openEdit, closeForm, finishSave } = useAdminFormRoute({
    basePath: '/veiculos',
    emptyValue: { id: null, placa: '', modelo: '', montadora: '', ano_modelo: '', ano_fabricacao: '', cor: '', cambio: null, cliente: null },
    setValue: setVeiculo,
    setIsEditing,
    loadById: loadVeiculo,
    onLoadError: onFormLoadError,
  });

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

      api.get(`/fipe/marcas/${selectedMontadora}/modelos`)
        .then(response => {
          const formattedModelos = response.data.modelos.map(modelo => ({ label: modelo.nome, value: modelo.nome }));
          setModelosOptions(formattedModelos);
        })
        .catch(error => console.error("Erro ao buscar modelos:", error));
    }
  }, [selectedMontadora]);

  useEffect(() => {
    if (!isFormRoute || !veiculo.montadora || montadorasOptions.length === 0) return;
    const brand = montadorasOptions.find((item) => item.label === veiculo.montadora);
    if (brand) setSelectedMontadora(brand.value);
  }, [isFormRoute, montadorasOptions, veiculo.montadora]);

  useEffect(() => {
    api.get('/clientes')
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => console.error("Erro ao buscar clientes:", error));
  }, []);

  const cambios = [
    { label: 'Manual', value: 'MANUAL' },
    { label: 'Automático', value: 'AUTOMATICO' },
    { label: 'CVT', value: 'CVT' },
    { label: 'Automatizado', value: 'AUTOMATIZADO' },
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

  const openNew = openNewRoute;

  const hideDialog = closeForm;
  const hideDeleteVeiculoDialog = () => setDeleteVeiculoDialog(false);

  const editVeiculo = (v) => {
    const selectedClient = v.cliente && clientes.length > 0
      ? clientes.find((client) => client.id === v.cliente.id) || null
      : v.cliente;
    setSelectedMontadora(montadorasOptions.find((brand) => brand.label === v.montadora)?.value || null);
    openEdit({ ...v, cliente: selectedClient });
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
    const missingFields = getMissingRequiredFields({
      Placa: veiculo.placa,
      Montadora: veiculo.montadora,
      Modelo: veiculo.modelo,
      Câmbio: veiculo.cambio,
      'Ano modelo': veiculo.ano_modelo,
      'Ano de fabricação': veiculo.ano_fabricacao,
      Cliente: veiculo.cliente,
    });
    if (missingFields.length) {
      toast.current.show({ severity: 'warn', summary: 'Atenção', detail: `Campos obrigatórios não preenchidos: ${missingFields.join(', ')}.`, life: 5000 });
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
      finishSave();
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

  const deleteVeiculoDialogFooter = (
    <React.Fragment>
      <Button label="Não" icon="pi pi-times" outlined onClick={hideDeleteVeiculoDialog} />
      <Button label="Sim" icon="pi pi-check" severity="danger" onClick={deleteVeiculo} />
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-pencil" rounded outlined className="p-mr-2" onClick={() => editVeiculo(rowData)} />
        <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteVeiculo(rowData)} />
      </React.Fragment>
    );
  };

  const makeFilterOptions = [...new Set(veiculos.map((item) => item.montadora).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }))
    .map((make) => ({ label: make, value: make }));
  const ownerFilterOptions = clientes
    .map((client) => ({ label: client.nome, value: client.id }))
    .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR', { sensitivity: 'base' }));
  const veiculosFiltrados = sortItems(veiculos.filter((item) => (
    `${item.placa} ${item.modelo} ${item.montadora} ${item.cor} ${item.cambio}`.toLowerCase().includes(search.toLowerCase())
      && (!makeFilter || item.montadora === makeFilter)
      && (!transmissionFilter || item.cambio === transmissionFilter)
      && (!ownerFilter || String(item.cliente?.id) === String(ownerFilter))
  )));

  return (
    <div className="card">
      <Toast ref={toast} />
      {!isFormRoute ? (
        <>
          <Toolbar className="p-mb-4" start={<AdminPageHeading eyebrow="Relacionamento" title="Veículos" description="Acompanhe os veículos vinculados aos clientes." />} end={<Button label="Adicionar veículo" icon="pi pi-plus" onClick={openNew} />} />
          <ManagementFilters
            search={search}
            onSearch={setSearch}
            placeholder="Buscar por placa, modelo, montadora ou cor"
            sortField={sortField}
            sortOrder={sortOrder}
            onSortFieldChange={setSortField}
            onSortOrderChange={setSortOrder}
            sortOptions={sortOptions}
            resultCount={veiculosFiltrados.length}
            hasActiveFilters={Boolean(search || makeFilter || transmissionFilter || ownerFilter)}
            onClearFilters={() => {
              setSearch('');
              setMakeFilter(null);
              setTransmissionFilter(null);
              setOwnerFilter(null);
            }}
          >
            <Dropdown aria-label="Filtrar veículos por montadora" value={makeFilter} options={makeFilterOptions} onChange={(event) => setMakeFilter(event.value)} placeholder="Todas as montadoras" showClear />
            <Dropdown aria-label="Filtrar veículos por câmbio" value={transmissionFilter} options={cambios} onChange={(event) => setTransmissionFilter(event.value)} placeholder="Todos os câmbios" showClear />
            <Dropdown aria-label="Filtrar veículos por cliente" value={ownerFilter} options={ownerFilterOptions} onChange={(event) => setOwnerFilter(event.value)} placeholder="Todos os clientes" showClear disabled={!ownerFilterOptions.length} />
          </ManagementFilters>
          <DataTable value={veiculosFiltrados} responsiveLayout="scroll" emptyMessage="Nenhum veículo encontrado." tableStyle={{ minWidth: '42rem' }} paginator rows={10}>
            <Column field="placa" header="Placa"></Column>
            <Column field="modelo" header="Modelo"></Column>
            <Column field="montadora" header="Montadora"></Column>
            <Column field="ano_modelo" header="Ano Modelo"></Column>
            <Column field="ano_fabricacao" header="Ano Fabricação"></Column>
            <Column field="cor" header="Cor"></Column>
            <Column field="cambio" header="Câmbio"></Column>
            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
          </DataTable>
        </>
      ) : (
        <AdminFormPanel
          title={isEditing ? 'Editar veículo' : 'Novo veículo'}
          description="Vincule o veículo ao cliente e registre suas principais características."
          submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar veículo'}
          onCancel={hideDialog}
          onSubmit={saveVeiculo}
        >
          <AdminFormSection title="Proprietário" description="Selecione o cliente responsável por este veículo.">
            <div className="admin-form-grid">
              <div className="admin-form-wide">
                <AdminEntityPicker
                  label="Cliente *"
                  title="Selecionar cliente"
                  placeholder="Buscar e selecionar cliente"
                  emptyMessage="Nenhum cliente corresponde à busca."
                  options={clientes}
                  value={veiculo.cliente}
                  onChange={(value) => onDropdownChange({ value }, 'cliente')}
                  getLabel={(item) => item.nome}
                  getSearchText={(item) => `${item.nome} ${item.cpf || ''} ${item.telefone || ''} ${item.endereco || ''}`}
                  getDetails={(item) => [item.cpf && `CPF ${item.cpf}`, item.telefone, item.endereco].filter(Boolean).join(' · ')}
                />
              </div>
            </div>
          </AdminFormSection>
          <AdminFormSection title="Identificação do veículo" description="Informe placa, marca, modelo e dados de fabricação.">
            <div className="admin-form-grid">
              <div className="p-field">
                <label htmlFor="placa">Placa *</label>
                <InputText id="placa" value={veiculo.placa} onChange={(e) => onInputChange(e, 'placa')} required placeholder="ABC1D23" />
              </div>
              <div className="p-field">
                <label htmlFor="montadora">Montadora *</label>
                <Dropdown id="montadora" value={selectedMontadora} options={montadorasOptions} onChange={onMontadoraChange} placeholder="Selecione a montadora" filter filterBy="label" showClear />
              </div>
              <div className="p-field">
                <label htmlFor="modelo">Modelo *</label>
                <Dropdown id="modelo" value={veiculo.modelo} options={modelosOptions} onChange={(e) => onInputChange(e, 'modelo')} placeholder="Selecione o modelo" disabled={!selectedMontadora} filter filterBy="label" showClear />
              </div>
              <div className="p-field">
                <label htmlFor="cambio">Câmbio *</label>
                <Dropdown id="cambio" value={veiculo.cambio} options={cambios} onChange={(e) => onDropdownChange(e, 'cambio')} placeholder="Selecione o câmbio" required />
              </div>
              <div className="p-field">
                <label htmlFor="ano_modelo">Ano modelo *</label>
                <InputMask id="ano_modelo" mask="9999" value={veiculo.ano_modelo} onChange={(e) => onInputChange(e, 'ano_modelo')} placeholder="2024" required />
              </div>
              <div className="p-field">
                <label htmlFor="ano_fabricacao">Ano de fabricação *</label>
                <InputMask id="ano_fabricacao" mask="9999" value={veiculo.ano_fabricacao} onChange={(e) => onInputChange(e, 'ano_fabricacao')} placeholder="2024" required />
              </div>
              <div className="p-field">
                <label htmlFor="cor">Cor</label>
                <InputText id="cor" value={veiculo.cor} onChange={(e) => onInputChange(e, 'cor')} placeholder="Ex.: Prata" />
              </div>
            </div>
          </AdminFormSection>
        </AdminFormPanel>
      )}

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
