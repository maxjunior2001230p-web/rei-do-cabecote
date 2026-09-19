import React from 'react';
import { FaFilter, FaSearch } from 'react-icons/fa';

const ManagementFilters = ({ search, onSearch, placeholder, children }) => (
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
        </div>
        {children && (
            <div className="management-filter-options">
                <FaFilter aria-hidden="true" />
                {children}
            </div>
        )}
    </div>
);

export default ManagementFilters;
