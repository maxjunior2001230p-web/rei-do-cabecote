import React from 'react';
import { Button } from 'primereact/button';

const AdminFormSection = ({ title, description, children }) => (
  <section className="admin-form-section">
    <div className="admin-form-section-heading">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    {children}
  </section>
);

const AdminFormPanel = ({
  title,
  description,
  submitLabel,
  onCancel,
  onSubmit,
  children,
  actions,
}) => (
  <section className="admin-form-panel" aria-label={title}>
    <header className="admin-form-panel-header">
      <div>
        <span className="admin-form-kicker">Formulário</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Button
        type="button"
        className="admin-form-close"
        icon="pi pi-times"
        aria-label="Fechar formulário"
        onClick={onCancel}
      />
    </header>
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="admin-form-content">{children}</div>
      <footer className="admin-form-actions">
        {actions || (
          <>
            <Button type="button" label="Cancelar" outlined onClick={onCancel} />
            <Button type="submit" label={submitLabel} icon="pi pi-check" />
          </>
        )}
      </footer>
    </form>
  </section>
);

export { AdminFormSection };
export default AdminFormPanel;
