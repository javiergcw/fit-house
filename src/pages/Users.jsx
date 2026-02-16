import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
  Pencil,
  UserPlus,
  Ticket,
  ExternalLink,
  Search,
  X,
  FileDown,
  DollarSign,
} from 'lucide-react';
import ActionIcon from '../components/ActionIcon';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/exportExcel';

const initialForm = { nombre: '', email: '', telefono: '', documento: '', direccion: '' };

function Avatar({ name, size = 40 }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--fit-primary)',
        color: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

const initialSaleForm = { membershipId: '', fechaInicio: '', fechaFin: '' };

function UserDetailPanel({ user, onEdit, onAddPayment, getActiveMembershipForUser, getMembership, getPurchasesByUser }) {
  if (!user) {
    return (
      <div className="user-panel-empty">
        <div className="user-panel-placeholder-icon">
          <User size={48} strokeWidth={1.2} />
        </div>
        <p>Selecciona un usuario</p>
        <span>Haz clic en alguien de la lista para ver su información y membresía</span>
      </div>
    );
  }

  const active = getActiveMembershipForUser(user.id);
  const purchases = getPurchasesByUser(user.id);

  const infoRows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Teléfono', value: user.telefono },
    { icon: FileText, label: 'Documento', value: user.documento },
    { icon: MapPin, label: 'Dirección', value: user.direccion },
  ].filter((r) => r.value);

  return (
    <div className="user-panel">
      <div className="user-panel-header">
        <Avatar name={user.nombre} size={72} />
        <div className="user-panel-name">{user.nombre || 'Sin nombre'}</div>
        <div className="user-panel-actions">
          <ActionIcon icon={DollarSign} label="Agregar pago" variant="secondary" onClick={() => onAddPayment(user)} size={16} />
          <ActionIcon as={Link} to={`/usuarios/${user.id}`} icon={ExternalLink} label="Ver página completa" variant="secondary" size={16} />
          <ActionIcon icon={Pencil} label="Editar usuario" variant="secondary" onClick={() => onEdit(user)} size={16} />
        </div>
      </div>

      <div className="user-panel-section">
        <h4 className="user-panel-section-title">
          <User size={16} />
          Contacto
        </h4>
        <ul className="info-list">
          {infoRows.length ? (
            infoRows.map(({ icon: Icon, label, value }) => (
              <li key={label}>
                <Icon size={14} className="info-list-icon" />
                <span className="info-list-label">{label}</span>
                <span className="info-list-value">{value}</span>
              </li>
            ))
          ) : (
            <li className="info-list-muted">Sin datos de contacto</li>
          )}
        </ul>
      </div>

      <div className="user-panel-section">
        <h4 className="user-panel-section-title">
          <CreditCard size={16} />
          Membresía actual
        </h4>
        {active ? (
          <div className="membership-status membership-active">
            <span className="badge success">Activa</span>
            <strong>{active.membership?.nombre}</strong>
            <span className="membership-days">{active.daysLeft} días restantes</span>
            <span className="membership-date">Hasta {new Date(active.sale.fechaFin).toLocaleDateString('es')}</span>
          </div>
        ) : (
          <div className="membership-status membership-inactive">
            <span className="badge danger">Sin membresía activa</span>
          </div>
        )}
      </div>

      <div className="user-panel-section">
        <h4 className="user-panel-section-title">
          <Ticket size={16} />
          Historial de compras
        </h4>
        {purchases.length === 0 ? (
          <p className="info-muted">No tiene compras registradas</p>
        ) : (
          <ul className="purchases-list">
            {purchases.map((s) => {
              const m = getMembership(s.membershipId);
              const end = new Date(s.fechaFin);
              const isActive = new Date() <= end;
              return (
                <li key={s.id} className="purchase-item">
                  <div className="purchase-main">
                    <span className="purchase-name">{m?.nombre ?? 'Membresía'}</span>
                    <span className={`badge ${isActive ? 'success' : 'danger'}`}>
                      {isActive ? 'Activa' : 'Vencida'}
                    </span>
                  </div>
                  <div className="purchase-dates">
                    <Calendar size={12} />
                    {new Date(s.fechaInicio).toLocaleDateString('es')} – {new Date(s.fechaFin).toLocaleDateString('es')}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const initialFilters = { nombre: '', email: '', documento: '', telefono: '' };

function matchUser(u, filters) {
  const n = (filters.nombre || '').trim().toLowerCase();
  const e = (filters.email || '').trim().toLowerCase();
  const d = (filters.documento || '').trim().toLowerCase();
  const t = (filters.telefono || '').trim().toLowerCase();
  if (n && !(u.nombre || '').toLowerCase().includes(n)) return false;
  if (e && !(u.email || '').toLowerCase().includes(e)) return false;
  if (d && !(u.documento || '').toLowerCase().includes(d)) return false;
  if (t && !(u.telefono || '').toLowerCase().includes(t)) return false;
  return true;
}

export default function Users() {
  const { users, memberships, addUser, updateUser, deleteUser, addSale, getActiveMembershipForUser, getMembership, getPurchasesByUser } = useData();
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [selectedId, setSelectedId] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState(initialSaleForm);

  const filteredUsers = users.filter((u) => matchUser(u, filters));
  const hasActiveFilters = Object.values(filters).some((v) => (v || '').trim() !== '');
  const selectedUser = selectedId ? users.find((u) => u.id === selectedId) : null;

  const clearFilters = () => setFilters(initialFilters);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setModal(true);
  };

  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      nombre: u.nombre ?? '',
      email: u.email ?? '',
      telefono: u.telefono ?? '',
      documento: u.documento ?? '',
      direccion: u.direccion ?? '',
    });
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateUser(editingId, form);
    } else {
      addUser(form);
    }
    setModal(false);
  };

  const handleExportExcel = () => {
    const rows = filteredUsers.map((u) => ({
      Nombre: u.nombre ?? '',
      Email: u.email ?? '',
      Teléfono: u.telefono ?? '',
      Documento: u.documento ?? '',
      Dirección: u.direccion ?? '',
    }));
    exportToExcel(rows, `usuarios-${new Date().toISOString().slice(0, 10)}`, 'Usuarios');
  };

  const openAddPayment = (user) => {
    setSelectedId(user.id);
    const today = new Date().toISOString().slice(0, 10);
    setSaleForm({
      membershipId: '',
      fechaInicio: today,
      fechaFin: today,
    });
    setSaleModal(true);
  };

  const onSaleMembershipChange = (membershipId) => {
    const m = memberships.find((x) => x.id === membershipId);
    const start = saleForm.fechaInicio ? new Date(saleForm.fechaInicio) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (m?.duracionDias ?? 30));
    setSaleForm({
      ...saleForm,
      membershipId,
      fechaInicio: start.toISOString().slice(0, 10),
      fechaFin: end.toISOString().slice(0, 10),
    });
  };

  const handleSaleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId || !saleForm.membershipId) return;
    addSale({
      userId: selectedId,
      membershipId: saleForm.membershipId,
      fechaCompra: new Date().toISOString(),
      fechaInicio: saleForm.fechaInicio,
      fechaFin: saleForm.fechaFin,
    });
    setSaleModal(false);
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Gestiona los miembros y consulta su información y membresías</p>
        </div>
        <div className="page-header-actions">
          {users.length > 0 && (
            <button type="button" onClick={handleExportExcel} className="btn-secondary-with-icon btn-excel" title="Descargar Excel">
              <FileDown size={18} />
              Descargar Excel
            </button>
          )}
          <button type="button" onClick={openCreate} className="btn-primary-with-icon">
            <UserPlus size={18} />
            Nuevo usuario
          </button>
        </div>
      </div>

      {users.length > 0 && (
        <div className="users-filters card">
          <div className="users-filters-row">
            <div className="users-filter-field">
              <Search size={16} />
              <input
                type="text"
                placeholder="Nombre"
                value={filters.nombre}
                onChange={(e) => setFilters((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="users-filter-field">
              <Mail size={14} />
              <input
                type="text"
                placeholder="Correo"
                value={filters.email}
                onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="users-filter-field">
              <FileText size={14} />
              <input
                type="text"
                placeholder="Identificación"
                value={filters.documento}
                onChange={(e) => setFilters((f) => ({ ...f, documento: e.target.value }))}
              />
            </div>
            <div className="users-filter-field">
              <Phone size={14} />
              <input
                type="text"
                placeholder="Teléfono"
                value={filters.telefono}
                onChange={(e) => setFilters((f) => ({ ...f, telefono: e.target.value }))}
              />
            </div>
            {hasActiveFilters && (
              <button type="button" className="secondary users-filter-clear" onClick={clearFilters} title="Limpiar filtros">
                <X size={16} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      <div className="users-layout">
        <div className="users-list card">
          <div className="users-list-header">Lista de usuarios</div>
          {users.length === 0 ? (
            <p className="empty-message">No hay usuarios. Crea uno para empezar.</p>
          ) : filteredUsers.length === 0 ? (
            <p className="empty-message">Ningún usuario coincide con los filtros.</p>
          ) : (
            <ul className="users-list-ul">
              {filteredUsers.map((u) => {
                const active = getActiveMembershipForUser(u.id);
                const isSelected = selectedId === u.id;
                return (
                  <li
                    key={u.id}
                    className={`user-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedId(u.id)}
                  >
                    <Avatar name={u.nombre} size={44} />
                    <div className="user-list-info">
                      <span className="user-list-name">{u.nombre || 'Sin nombre'}</span>
                      <span className="user-list-email">{u.email || '—'}</span>
                      {active && <span className="badge success badge-sm">Activa</span>}
                    </div>
                    <ChevronRight size={18} className="user-list-chevron" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="users-detail card">
          <UserDetailPanel
            user={selectedUser}
            onEdit={openEdit}
            onAddPayment={openAddPayment}
            getActiveMembershipForUser={getActiveMembershipForUser}
            getMembership={getMembership}
            getPurchasesByUser={getPurchasesByUser}
          />
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} required placeholder="Nombre completo" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@ejemplo.com" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input value={form.telefono} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} placeholder="600 000 000" />
              </div>
              <div className="form-group">
                <label>Documento</label>
                <input value={form.documento} onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))} placeholder="DNI / NIF" />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={form.direccion} onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))} placeholder="Dirección" />
              </div>
              <div className="form-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="secondary" onClick={() => setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setSaleModal(false)}>
          <div className="card modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar pago – {selectedUser.nombre || selectedUser.email || 'Usuario'}</h3>
            <form onSubmit={handleSaleSubmit} className="form-sale">
              <div className="form-row">
                <div className="form-group">
                  <label><CreditCard size={14} /> Membresía</label>
                  <select
                    value={saleForm.membershipId}
                    onChange={(e) => onSaleMembershipChange(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar membresía...</option>
                    {memberships.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre} ({m.duracionDias} días)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> Fecha inicio</label>
                  <input
                    type="date"
                    value={saleForm.fechaInicio}
                    onChange={(e) => setSaleForm((f) => ({ ...f, fechaInicio: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Calendar size={14} /> Fecha fin</label>
                  <input
                    type="date"
                    value={saleForm.fechaFin}
                    onChange={(e) => setSaleForm((f) => ({ ...f, fechaFin: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit">Registrar pago</button>
                <button type="button" className="secondary" onClick={() => setSaleModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
