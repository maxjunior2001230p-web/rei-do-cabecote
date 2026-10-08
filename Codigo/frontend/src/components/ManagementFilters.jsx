import React from 'react';
import { FaFilter, FaSearch, FaSortAmountDown } from 'react-icons/fa';
import { Button } from 'primereact/button';

export const ManagementFilterField = ({ label, children }) => (
    <div className="management-filter-field">
        <span>{label}</span>
        {children}
    </div>
);

const ManagementFilters = ({
    search,
    onSearch,
    placeholder,
    children,
    sortField,
    sortOrder,
    onSortFieldChange,
    onSortOrderChange,
    sortOptions = [],
    resultCount,
    hasActiveFilters = Boolean(search),
    onClearFilters,
}) => (
    <div className="management-filters">
        <div className="management-search">
            <FaSearch aria-hidden="true" />
            <input
                type="search"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />
            {search && (
                <button type="button" onClick={() => onSearch('')} aria-label="Limpar busca" title="Limpar busca">
                    <span aria-hidden="true">&times;</span>
                </button>
            )}
        </div>
        <div className="management-filter-tools">
            {children && (
            <div className="management-filter-options">
                <span className="management-control-caption">
                    <FaFilter aria-hidden="true" />
                    <span>Filtrar por</span>
                </span>
                <div className="management-filter-selects">{children}</div>
            </div>
            )}
            {sortOptions.length > 0 && (
                <div className="management-sort-controls">
                    <span className="management-control-caption">
                        <FaSortAmountDown aria-hidden="true" />
                        <span>Ordenar</span>
                    </span>
                    <div className="management-sort-fields">
                        <select value={sortField} onChange={(event) => onSortFieldChange(event.target.value)} aria-label="Ordenar por">
                            {sortOptions.map(({ label, field }) => <option key={field} value={field}>{label}</option>)}
                        </select>
                        <select value={sortOrder} onChange={(event) => onSortOrderChange(Number(event.target.value))} aria-label="Direção da ordenação">
                            <option value={1}>Crescente</option>
                            <option value={-1}>Decrescente</option>
                        </select>
                    </div>
                </div>
            )}
            {onClearFilters && (
                <Button
                    type="button"
                    className="management-clear-filters"
                    label="Limpar filtros"
                    icon="pi pi-filter-slash"
                    outlined
                    disabled={!hasActiveFilters}
                    onClick={onClearFilters}
                />
            )}
        </div>
        {Number.isFinite(resultCount) && (
            <div className="management-filter-summary" aria-live="polite">
                <span>{resultCount} {resultCount === 1 ? 'registro encontrado' : 'registros encontrados'}</span>
                {hasActiveFilters && <span>Filtros aplicados</span>}
            </div>
        )}
    </div>
);

export default ManagementFilters;
