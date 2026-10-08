import React, { useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const pageSize = 10;
const sortOptions = [{ label: 'A–Z', value: 'asc' }, { label: 'Z–A', value: 'desc' }];

const AdminEntityPicker = ({
  label,
  title,
  placeholder,
  emptyMessage,
  value,
  options,
  onChange,
  getLabel,
  getSearchText,
  getDetails,
  getSortValue = getLabel,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(0);

  const sortedOptions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    return options
      .filter((option) => !query || getSearchText(option).toLocaleLowerCase('pt-BR').includes(query))
      .sort((a, b) => {
        const comparison = getSortValue(a).localeCompare(getSortValue(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [getSearchText, getSortValue, options, search, sortOrder]);
  const pageCount = Math.ceil(sortedOptions.length / pageSize);
  const visibleOptions = sortedOptions.slice(page * pageSize, (page + 1) * pageSize);

  const openPicker = () => {
    setSearch('');
    setPage(0);
    setVisible(true);
  };

  const choose = (option) => {
    onChange(option);
    setVisible(false);
  };

  return (
    <div className="admin-form-field admin-entity-picker">
      <label>{label}</label>
      {value ? (
        <div className="admin-entity-selected">
          <div>
            <strong>{getLabel(value)}</strong>
            <span>{getDetails(value)}</span>
          </div>
          <div className="admin-entity-selected-actions">
            <Button type="button" label="Alterar" icon="pi pi-pencil" outlined onClick={openPicker} />
            <Button type="button" icon="pi pi-times" text aria-label={`Limpar ${label}`} onClick={() => onChange(null)} />
          </div>
        </div>
      ) : (
        <Button
          type="button"
          className="admin-entity-trigger"
          label={placeholder}
          icon="pi pi-search"
          outlined
          onClick={openPicker}
        />
      )}
      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        header={title}
        modal
        closeIcon="pi pi-times"
        className="admin-picker-dialog"
        style={{ width: 'min(760px, calc(100vw - 32px))' }}
        breakpoints={{ '700px': 'calc(100vw - 24px)' }}
      >
        <div className="admin-picker-controls">
          <InputText
            autoFocus
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Buscar por nome, CPF, telefone ou endereço..."
            aria-label={`Buscar ${label.toLocaleLowerCase('pt-BR')}`}
          />
          <Dropdown
            value={sortOrder}
            options={sortOptions}
            onChange={(event) => setSortOrder(event.value)}
            optionLabel="label"
            placeholder="Ordenar"
            aria-label="Ordenar opções"
          />
        </div>
        <div className="admin-picker-result-count" aria-live="polite">
          {sortedOptions.length} {sortedOptions.length === 1 ? 'resultado' : 'resultados'}
        </div>
        <div className="admin-picker-results">
          {visibleOptions.length ? visibleOptions.map((option) => (
            <button
              type="button"
              className={`admin-picker-option ${value?.id === option.id ? 'is-selected' : ''}`}
              key={option.id}
              onClick={() => choose(option)}
            >
              <span className="admin-picker-option-avatar" aria-hidden="true">
                {getLabel(option).trim().charAt(0).toLocaleUpperCase('pt-BR')}
              </span>
              <span className="admin-picker-option-copy">
                <strong>{getLabel(option)}</strong>
                <small>{getDetails(option)}</small>
              </span>
              <i className={`pi ${value?.id === option.id ? 'pi-check-circle' : 'pi-angle-right'}`} aria-hidden="true" />
            </button>
          )) : (
            <p className="admin-picker-empty">{emptyMessage}</p>
          )}
        </div>
        {pageCount > 1 && (
          <footer className="admin-picker-pagination">
            <Button type="button" label="Anterior" icon="pi pi-chevron-left" outlined disabled={page === 0} onClick={() => setPage((current) => current - 1)} />
            <span>Página {page + 1} de {pageCount}</span>
            <Button type="button" label="Próxima" icon="pi pi-chevron-right" iconPos="right" outlined disabled={page + 1 === pageCount} onClick={() => setPage((current) => current + 1)} />
          </footer>
        )}
      </Dialog>
    </div>
  );
};

export default AdminEntityPicker;
