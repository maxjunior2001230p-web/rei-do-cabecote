import React from 'react';

const AdminPageHeading = ({ eyebrow = 'Gestão operacional', title, description }) => (
    <div className="admin-page-heading">
        <span className="admin-page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
    </div>
);

export default AdminPageHeading;
