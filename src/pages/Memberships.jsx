import { useState, useEffect } from 'react';
import { CreditCard, Plus, Calendar, DollarSign, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Power } from 'lucide-react';
import ActionIcon from '../components/ActionIcon';
import { useData } from '../context/DataContext';
import { getMembershipsList } from '../useCases/getMembershipsList.js';
import { updateMembership as updateMembershipStatus } from '../useCases/updateMembership.js';

const TIPOS = [
  { value: 'dias', label: 'Por días' },
  { value: 'mes', label: 'Mensual' },
  { value: 'anio', label: 'Anual' },
];

const initialForm = { nombre: '', tipo: 'mes', duracionDias: 30, precio: '' };
const initialFilters = { nombre: '', tipo: '' };

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
];

function matchMembership(m, filters) {
  const n = (filters.nombre || '').trim().toLowerCase();
  const t = (filters.tipo || '').trim();
  if (n && !(m.nombre || '').toLowerCase().includes(n)) return false;
  if (t && m.tipo !== t) return false;
  return true;
}

export default function Memberships() {
  const { addMembership, updateMembership, deleteMembership } = useData();
  const [memberships, setMemberships] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [statusFilter, setStatusFilter] = useState(''); // '' = todas, 'active', 'inactive'
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const params = { page: pagination.page, limit: pagination.limit };
    if (statusFilter) params.status = statusFilter;
    getMembershipsList(params)
      .then((res) => {
        if (!cancelled) {
          setMemberships(res.data ?? []);
          setPagination((p) => ({ ...p, ...res.pagination }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Error al cargar membresías');
          setMemberships([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pagination.page, pagination.limit, statusFilter]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, pagination.total_pages || 1));
    setPagination((prev) => ({ ...prev, page: p }));
  };
  const setLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };
  const onStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const filteredMemberships = memberships.filter((m) => matchMembership(m, filters));
  const hasActiveFilters = Object.values(filters).some((v) => (v || '').trim() !== '');
  const clearFilters = () => setFilters(initialFilters);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setModal(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({
      nombre: m.nombre ?? '',
      tipo: m.tipo ?? 'mes',
      duracionDias: m.duracionDias ?? 30,
      precio: m.precio ?? '',
    });
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      duracionDias: Number(form.duracionDias) || 30,
      precio: String(form.precio ?? ''),
    };
    if (editingId) {
      updateMembership(editingId, data);
    } else {
      addMembership(data);
    }
    setModal(false);
  };

  const handleDelete = (id, nombre) => {
    if (window.confirm(`¿Eliminar membresía "${nombre}"?`)) {
      deleteMembership(id);
    }
  };

  const handleToggleStatus = async (m) => {
    const newStatus = m.status === 'active' ? 'inactive' : 'active';
    setUpdatingStatusId(m.id);
    try {
      await updateMembershipStatus(m.id, { status: newStatus });
      const params = { page: pagination.page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;
      const res = await getMembershipsList(params);
      setMemberships(res.data ?? []);
      setPagination((p) => ({ ...p, ...res.pagination }));
    } catch (_) {
      // Opcional: mostrar toast o mensaje
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="memberships-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Membresías</h1>
          <p className="page-subtitle">Planes por días, mes o año. Crea y edita desde aquí.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary-with-icon" title="Crear nueva membresía">
          <Plus size={18} />
          Nueva membresía
        </button>
      </div>

      {loading ? (
        <div className="card">
          <p className="info-muted">Cargando membresías…</p>
        </div>
      ) : loadError ? (
        <div className="card">
          <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)' }}>{loadError}</p>
        </div>
      ) : (
        <>
          <div className="page-filters card">
            <div className="page-filters-row">
              <div className="page-filter-field">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Nombre del plan"
                  value={filters.nombre}
                  onChange={(e) => setFilters((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="page-filter-field">
                <CreditCard size={14} />
                <select
                  value={filters.tipo}
                  onChange={(e) => setFilters((f) => ({ ...f, tipo: e.target.value }))}
                >
                  <option value="">Todos los tipos</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="page-filter-field">
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  aria-label="Estado"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <button type="button" className="secondary page-filter-clear" onClick={clearFilters} title="Limpiar filtros">
                  <X size={16} />
                  Limpiar filtros
                </button>
              )}
              <div className="users-pagination-inline">
                <span>Mostrar</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="users-pagination-select"
                  aria-label="Elementos por página"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span>· Total {pagination.total}</span>
                <span className="users-pagination-page">Pág. {pagination.page}/{pagination.total_pages || 1}</span>
                <button
                  type="button"
                  className="btn-pagination"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="btn-pagination"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= (pagination.total_pages || 1) || loading}
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {memberships.length === 0 ? (
            <div className="card empty-state-card">
              <div className="empty-state-icon">
                <CreditCard size={40} strokeWidth={1.2} />
              </div>
              <p className="empty-state-title">No hay membresías</p>
              <p className="empty-state-text">Crea tu primer plan o cambia el filtro de estado (Todas, Activas, Inactivas).</p>
              <button type="button" onClick={openCreate} className="btn-primary-with-icon">
                <Plus size={18} />
                Crear membresía
              </button>
            </div>
          ) : (
            <>
              <div className="memberships-summary">
                <div className="memberships-summary-item">
                  <CreditCard size={20} />
                  <span><strong>{filteredMemberships.length}</strong> de {pagination.total} planes</span>
                </div>
              </div>

              <div className="memberships-grid">
                {filteredMemberships.length === 0 ? (
                  <p className="empty-message" style={{ gridColumn: '1 / -1' }}>Ninguna membresía coincide con los filtros.</p>
                ) : (
                  filteredMemberships.map((m) => (
              <div key={m.id} className="membership-card card">
                <div className="membership-card-header">
                  <div className="membership-card-icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="membership-card-actions">
                    <ActionIcon
                      icon={Power}
                      label={m.status === 'active' ? 'Desactivar' : 'Activar'}
                      variant="secondary"
                      onClick={() => handleToggleStatus(m)}
                      disabled={updatingStatusId === m.id}
                    />
                    <ActionIcon icon={Pencil} label="Editar membresía" variant="secondary" onClick={() => openEdit(m)} />
                    <ActionIcon icon={Trash2} label="Eliminar membresía" variant="danger" onClick={() => handleDelete(m.id, m.nombre)} />
                  </div>
                </div>
                <div className="membership-card-status-row">
                  <span className={`badge ${m.status === 'active' ? 'success' : 'danger'}`}>
                    {m.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <h3 className="membership-card-name">{m.nombre || 'Sin nombre'}</h3>
                <div className="membership-card-badge">
                  {TIPOS.find((t) => t.value === m.tipo)?.label ?? m.tipo}
                </div>
                <div className="membership-card-details">
                  <div className="membership-card-row">
                    <Calendar size={14} />
                    <span>{m.duracionDias ?? 0} días</span>
                  </div>
                  <div className="membership-card-row membership-card-price">
                    <DollarSign size={14} />
                    <span>{m.precio != null && m.precio !== '' ? `$${Number(m.precio).toLocaleString('es-CO')} COP` : '—'}</span>
                  </div>
                </div>
              </div>
            ))
            )}
              </div>
            </>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Editar membresía' : 'Nueva membresía'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Mensual 30 días" required />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Duración (días)</label>
                <input type="number" min={1} value={form.duracionDias} onChange={(e) => setForm((f) => ({ ...f, duracionDias: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Precio (COP)</label>
                <input type="number" min={0} value={form.precio} onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))} placeholder="0" />
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
