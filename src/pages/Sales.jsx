import { useState } from 'react';
import { ShoppingCart, Plus, User, CreditCard, Calendar, Pencil, Trash2, Search, X, FileDown } from 'lucide-react';
import ActionIcon from '../components/ActionIcon';
import { useData } from '../context/DataContext';
import { exportToExcel } from '../utils/exportExcel';

const initialFilters = { usuario: '', membresia: '', estado: '' }; // estado: '' | 'activa' | 'vencida'

function matchSale(sale, filters, getUser, getMembership) {
  const u = getUser(sale.userId);
  const m = getMembership(sale.membershipId);
  const usuarioStr = (filters.usuario || '').trim().toLowerCase();
  const membresiaStr = (filters.membersia || '').trim().toLowerCase();
  const estado = (filters.estado || '').trim();
  if (usuarioStr && !(u?.nombre || u?.email || '').toLowerCase().includes(usuarioStr)) return false;
  if (membresiaStr && !(m?.nombre || '').toLowerCase().includes(membresiaStr)) return false;
  if (estado) {
    const active = new Date() <= new Date(sale.fechaFin);
    if (estado === 'activa' && !active) return false;
    if (estado === 'vencida' && active) return false;
  }
  return true;
}

function Avatar({ name, size = 36 }) {
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

export default function Sales() {
  const { users, memberships, sales, addSale, updateSale, deleteSale, getMembership, getUser } = useData();
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ userId: '', membershipId: '', fechaInicio: '', fechaFin: '' });
  const [filters, setFilters] = useState(initialFilters);

  const filteredSales = [...sales].reverse().filter((s) => matchSale(s, filters, getUser, getMembership));
  const hasActiveFilters = Object.values(filters).some((v) => (v || '').trim() !== '');
  const clearFilters = () => setFilters(initialFilters);

  const openCreate = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingId(null);
    setForm({
      userId: '',
      membershipId: '',
      fechaInicio: today,
      fechaFin: today,
    });
    setModal(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      userId: s.userId,
      membershipId: s.membershipId,
      fechaInicio: (s.fechaInicio && new Date(s.fechaInicio).toISOString().slice(0, 10)) || '',
      fechaFin: (s.fechaFin && new Date(s.fechaFin).toISOString().slice(0, 10)) || '',
    });
    setModal(true);
  };

  const onMembershipChange = (membershipId) => {
    setForm((f) => {
      const m = memberships.find((x) => x.id === membershipId);
      const start = f.fechaInicio ? new Date(f.fechaInicio) : new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + (m?.duracionDias ?? 30));
      return {
        ...f,
        membershipId,
        fechaInicio: start.toISOString().slice(0, 10),
        fechaFin: end.toISOString().slice(0, 10),
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fechaCompra = editingId ? (sales.find((s) => s.id === editingId)?.fechaCompra || new Date().toISOString()) : new Date().toISOString();
    const data = {
      userId: form.userId,
      membershipId: form.membershipId,
      fechaCompra,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
    };
    if (editingId) {
      updateSale(editingId, data);
    } else {
      addSale(data);
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar esta venta?')) {
      deleteSale(id);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleExportExcel = () => {
    const rows = filteredSales.map((s) => {
      const u = getUser(s.userId);
      const m = getMembership(s.membershipId);
      const activa = new Date() <= new Date(s.fechaFin);
      return {
        Usuario: u?.nombre ?? '',
        Email: u?.email ?? '',
        Membresía: m?.nombre ?? '',
        'Fecha compra': s.fechaCompra ? new Date(s.fechaCompra).toLocaleDateString('es') : '',
        'Fecha inicio': s.fechaInicio ? new Date(s.fechaInicio).toLocaleDateString('es') : '',
        'Fecha fin': s.fechaFin ? new Date(s.fechaFin).toLocaleDateString('es') : '',
        Estado: activa ? 'Activa' : 'Vencida',
      };
    });
    exportToExcel(rows, `ventas-${new Date().toISOString().slice(0, 10)}`, 'Ventas');
  };

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ventas</h1>
          <p className="page-subtitle">Registra compras y asocia usuarios con membresías</p>
        </div>
        <div className="page-header-actions">
          {sales.length > 0 && (
            <button type="button" onClick={handleExportExcel} className="btn-secondary-with-icon btn-excel" title="Descargar Excel">
              <FileDown size={18} />
              Descargar Excel
            </button>
          )}
          <button type="button" onClick={openCreate} className="btn-primary-with-icon" title="Registrar nueva venta">
            <Plus size={18} />
            Nueva venta
          </button>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="card empty-state-card">
          <div className="empty-state-icon">
            <ShoppingCart size={40} strokeWidth={1.2} />
          </div>
          <p className="empty-state-title">No hay ventas registradas</p>
          <p className="empty-state-text">Registra la primera venta: elige usuario y membresía.</p>
          <button type="button" onClick={openCreate} className="btn-primary-with-icon">
            <Plus size={18} />
            Registrar venta
          </button>
        </div>
      ) : (
        <>
          <div className="page-filters card">
            <div className="page-filters-row">
              <div className="page-filter-field">
                <User size={14} />
                <input
                  type="text"
                  placeholder="Usuario"
                  value={filters.usuario}
                  onChange={(e) => setFilters((f) => ({ ...f, usuario: e.target.value }))}
                />
              </div>
              <div className="page-filter-field">
                <CreditCard size={14} />
                <input
                  type="text"
                  placeholder="Membresía"
                  value={filters.membersia}
                  onChange={(e) => setFilters((f) => ({ ...f, membresia: e.target.value }))}
                />
              </div>
              <div className="page-filter-field">
                <Calendar size={14} />
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
                >
                  <option value="">Todos los estados</option>
                  <option value="activa">Activa</option>
                  <option value="vencida">Vencida</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button type="button" className="secondary page-filter-clear" onClick={clearFilters} title="Limpiar filtros">
                  <X size={16} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          <div className="sales-list">
            {filteredSales.length === 0 ? (
              <p className="empty-message">Ninguna venta coincide con los filtros.</p>
            ) : (
              filteredSales.map((s) => {
                const u = getUser(s.userId);
                const m = getMembership(s.membershipId);
                const end = new Date(s.fechaFin);
                const active = new Date() <= end;
                return (
                  <div key={s.id} className="sale-card card">
                <div className="sale-card-main">
                  <div className="sale-card-user">
                    <Avatar name={u?.nombre} size={40} />
                    <div>
                      <span className="sale-card-user-name">{u?.nombre ?? 'Usuario'}</span>
                      <span className="sale-card-user-email">{u?.email ?? ''}</span>
                    </div>
                  </div>
                  <div className="sale-card-membership">
                    <CreditCard size={16} />
                    <span>{m?.nombre ?? '—'}</span>
                  </div>
                  <div className="sale-card-dates">
                    <Calendar size={14} />
                    <span>{formatDate(s.fechaInicio)} → {formatDate(s.fechaFin)}</span>
                  </div>
                  <span className={`badge ${active ? 'success' : 'danger'}`}>
                    {active ? 'Activa' : 'Vencida'}
                  </span>
                </div>
                <div className="sale-card-actions">
                  <ActionIcon icon={Pencil} label="Editar venta" variant="secondary" onClick={() => openEdit(s)} size={16} />
                  <ActionIcon icon={Trash2} label="Eliminar venta" variant="danger" onClick={() => handleDelete(s.id)} size={16} />
                </div>
              </div>
                );
              })
            )}
          </div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="card modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Editar venta' : 'Nueva venta'}</h3>
            <form onSubmit={handleSubmit} className="form-sale">
              <div className="form-row">
                <div className="form-group">
                  <label><User size={14} /> Usuario</label>
                  <select value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} required>
                    <option value="">Seleccionar usuario...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre || u.email || u.id}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label><CreditCard size={14} /> Membresía</label>
                  <select
                    value={form.membershipId}
                    onChange={(e) => onMembershipChange(e.target.value)}
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
                  <input type="date" value={form.fechaInicio} onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label><Calendar size={14} /> Fecha fin</label>
                  <input type="date" value={form.fechaFin} onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit">Guardar</button>
                <button type="button" className="secondary" onClick={() => setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
