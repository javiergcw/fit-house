import { useState, useEffect } from 'react';
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
  ChevronLeft,
  Ticket,
  ExternalLink,
  Search,
  X,
  FileDown,
  DollarSign,
  UserPlus,
} from 'lucide-react';
import ActionIcon from '../components/ActionIcon';
import { exportToExcel } from '../utils/exportExcel';
import { getCustomersList } from '../useCases/getCustomersList.js';
import { createCustomer as createCustomerUseCase } from '../useCases/createCustomer.js';
import { getMembershipsList } from '../useCases/getMembershipsList.js';
import { createCustomerMembership } from '../useCases/createCustomerMembership.js';
import { getCustomerMemberships } from '../useCases/getCustomerMemberships.js';

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

const DOC_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const initialForm = {
  doc_type: 'CC',
  doc_number: '',
  full_name: '',
  email: '',
  phone: '',
  birth_date: '',
  address: '',
  status: 'active',
};

const initialSaleForm = { membershipId: '' };

function CustomerDetailPanel({ customer, onAddPayment, customerMemberships, loadingMembershipsPanel }) {
  if (!customer) {
    return (
      <div className="user-panel-empty">
        <div className="user-panel-placeholder-icon">
          <User size={48} strokeWidth={1.2} />
        </div>
        <p>Selecciona un customer</p>
        <span>Haz clic en alguien de la lista para ver su información y membresía</span>
      </div>
    );
  }

  const current = customerMemberships?.current_membership ?? null;
  const memberships = customerMemberships?.memberships ?? [];

  const infoRows = [
    { icon: Mail, label: 'Email', value: customer.email },
    { icon: Phone, label: 'Teléfono', value: customer.telefono },
    { icon: FileText, label: 'Documento', value: customer.documento },
    { icon: MapPin, label: 'Dirección', value: customer.direccion },
  ].filter((r) => r.value);

  return (
    <div className="user-panel">
      <div className="user-panel-header">
        <Avatar name={customer.nombre} size={72} />
        <div className="user-panel-name">{customer.nombre || 'Sin nombre'}</div>
        <div className="user-panel-actions">
          <ActionIcon icon={DollarSign} label="Agregar pago" variant="secondary" onClick={() => onAddPayment(customer)} size={16} />
          <ActionIcon as={Link} to={`/customers/${customer.id}`} icon={ExternalLink} label="Ver customer detail" variant="secondary" size={16} />
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
        {loadingMembershipsPanel ? (
          <p className="info-muted">Cargando membresías…</p>
        ) : current ? (
          <div className="membership-status membership-active">
            <span className="badge success">Activa</span>
            <strong>{current.membership?.nombre ?? 'Membresía'}</strong>
            <span className="membership-days">{current.daysLeft ?? 0} días restantes</span>
            <span className="membership-date">Hasta {current.endDate ? current.endDate.toLocaleDateString('es') : current.end_date}</span>
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
          Historial de membresías
        </h4>
        {loadingMembershipsPanel ? (
          <p className="info-muted">Cargando…</p>
        ) : memberships.length === 0 ? (
          <p className="info-muted">No tiene membresías registradas</p>
        ) : (
          <ul className="purchases-list">
            {memberships.map((item) => (
              <li key={item.id} className="purchase-item">
                <div className="purchase-main">
                  <span className="purchase-name">{item.membership?.nombre ?? 'Membresía'}</span>
                  <span className={`badge ${item.isActive ? 'success' : 'danger'}`}>
                    {item.isActive ? 'Activa' : 'Vencida'}
                  </span>
                </div>
                <div className="purchase-dates">
                  <Calendar size={12} />
                  {item.startDate ? item.startDate.toLocaleDateString('es') : item.start_date} – {item.endDate ? item.endDate.toLocaleDateString('es') : item.end_date}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const initialFilters = { nombre: '', email: '', documento: '', telefono: '' };

function matchCustomer(c, filters) {
  const n = (filters.nombre || '').trim().toLowerCase();
  const e = (filters.email || '').trim().toLowerCase();
  const d = (filters.documento || '').trim().toLowerCase();
  const t = (filters.telefono || '').trim().toLowerCase();
  if (n && !(c.nombre || '').toLowerCase().includes(n)) return false;
  if (e && !(c.email || '').toLowerCase().includes(e)) return false;
  if (d && !(c.documento || '').toLowerCase().includes(d)) return false;
  if (t && !(c.telefono || '').toLowerCase().includes(t)) return false;
  return true;
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [membershipsList, setMembershipsList] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [customerMemberships, setCustomerMemberships] = useState(null);
  const [loadingMembershipsPanel, setLoadingMembershipsPanel] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saleModal, setSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState(initialSaleForm);
  const [saleSubmitting, setSaleSubmitting] = useState(false);
  const [saleError, setSaleError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getCustomersList({ page: pagination.page, limit: pagination.limit })
      .then((res) => {
        if (!cancelled) {
          setCustomers(res.data ?? []);
          setPagination((p) => ({ ...p, ...res.pagination }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Error al cargar customers');
          setCustomers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMemberships(true);
    getMembershipsList({ page: 1, limit: 100, status: 'active' })
      .then((res) => {
        if (!cancelled) setMembershipsList(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setMembershipsList([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMemberships(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setCustomerMemberships(null);
      setLoadingMembershipsPanel(false);
      return;
    }
    let cancelled = false;
    setLoadingMembershipsPanel(true);
    setCustomerMemberships(null);
    getCustomerMemberships(selectedId)
      .then((data) => {
        if (!cancelled) setCustomerMemberships(data);
      })
      .catch(() => {
        if (!cancelled) setCustomerMemberships({ current_membership: null, memberships: [] });
      })
      .finally(() => {
        if (!cancelled) setLoadingMembershipsPanel(false);
      });
    return () => { cancelled = true; };
  }, [selectedId]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, pagination.total_pages || 1));
    setPagination((prev) => ({ ...prev, page: p }));
  };

  const setLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };

  const filteredCustomers = customers.filter((c) => matchCustomer(c, filters));
  const hasActiveFilters = Object.values(filters).some((v) => (v || '').trim() !== '');
  const selectedCustomer = selectedId ? customers.find((c) => c.id === selectedId) : null;

  const clearFilters = () => setFilters(initialFilters);

  const openCreate = () => {
    setForm(initialForm);
    setFormError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await createCustomerUseCase(form);
      setModal(false);
      const res = await getCustomersList({ page: pagination.page, limit: pagination.limit });
      setCustomers(res.data ?? []);
      setPagination((p) => ({ ...p, ...res.pagination }));
    } catch (err) {
      setFormError(err.message || 'Error al crear customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredCustomers.map((c) => ({
      Nombre: c.nombre ?? '',
      Email: c.email ?? '',
      Teléfono: c.telefono ?? '',
      Documento: c.documento ?? '',
      Dirección: c.direccion ?? '',
    }));
    exportToExcel(rows, `customers-${new Date().toISOString().slice(0, 10)}`, 'Customers');
  };

  const openAddPayment = (customer) => {
    setSelectedId(customer.id);
    setSaleForm({ membershipId: '' });
    setSaleError('');
    setSaleModal(true);
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || !saleForm.membershipId) return;
    setSaleError('');
    setSaleSubmitting(true);
    try {
      await createCustomerMembership(selectedId, saleForm.membershipId);
      setSaleModal(false);
    } catch (err) {
      setSaleError(err.message || 'Error al asignar membresía');
    } finally {
      setSaleSubmitting(false);
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Gestiona los clientes y consulta su información y membresías</p>
        </div>
        <div className="page-header-actions">
          {customers.length > 0 && (
            <button type="button" onClick={handleExportExcel} className="btn-secondary-with-icon btn-excel" title="Descargar Excel">
              <FileDown size={18} />
              Descargar Excel
            </button>
          )}
          <button type="button" onClick={openCreate} className="btn-primary-with-icon">
            <UserPlus size={18} />
            Nuevo customer
          </button>
        </div>
      </div>

      {!loading && !loadError && (
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
      )}

      <div className="users-layout">
        <div className="users-list card">
          <div className="users-list-header">Lista de customers</div>
          {loading ? (
            <p className="empty-message">Cargando customers…</p>
          ) : loadError ? (
            <p className="empty-message" style={{ color: 'var(--fit-danger, #ef5350)' }}>{loadError}</p>
          ) : customers.length === 0 ? (
            <p className="empty-message">No hay customers.</p>
          ) : filteredCustomers.length === 0 ? (
            <p className="empty-message">Ningún customer coincide con los filtros.</p>
          ) : (
            <ul className="users-list-ul">
              {filteredCustomers.map((c) => {
                const isSelected = selectedId === c.id;
                const hasActiveMembership = isSelected && customerMemberships?.current_membership;
                return (
                  <li
                    key={c.id}
                    className={`user-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <Avatar name={c.nombre} size={44} />
                    <div className="user-list-info">
                      <span className="user-list-name">{c.nombre || 'Sin nombre'}</span>
                      <span className="user-list-email">{c.email || '—'}</span>
                      {hasActiveMembership && <span className="badge success badge-sm">Activa</span>}
                    </div>
                    <ChevronRight size={18} className="user-list-chevron" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="users-detail card">
          <CustomerDetailPanel
            customer={selectedCustomer}
            onAddPayment={openAddPayment}
            customerMemberships={customerMemberships}
            loadingMembershipsPanel={loadingMembershipsPanel}
          />
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo customer</h3>
            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)', marginBottom: '0.75rem' }}>{formError}</p>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo documento</label>
                  <select
                    value={form.doc_type}
                    onChange={(e) => setForm((f) => ({ ...f, doc_type: e.target.value }))}
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Número documento</label>
                  <input
                    value={form.doc_number}
                    onChange={(e) => setForm((f) => ({ ...f, doc_number: e.target.value }))}
                    placeholder="12345678"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  required
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="form-group">
                <label>Fecha nacimiento</label>
                <input
                  type="date"
                  value={form.birth_date}
                  onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value }))}
                  placeholder="1990-05-15"
                />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Calle Mayor 1"
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar'}</button>
                <button type="button" className="secondary" onClick={() => setModal(false)} disabled={submitting}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saleModal && selectedCustomer && (() => {
        const selectedMembership = membershipsList.find((m) => m.id === saleForm.membershipId);
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (selectedMembership) {
          endDate.setDate(endDate.getDate() + (selectedMembership.duracionDias ?? selectedMembership.duration_days ?? 0));
        }
        const fechaInicio = startDate.toISOString().slice(0, 10);
        const fechaFin = selectedMembership ? endDate.toISOString().slice(0, 10) : '';
        return (
          <div className="modal-overlay" onClick={() => !saleSubmitting && setSaleModal(false)}>
            <div className="card modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
              <h3>Agregar pago – {selectedCustomer.nombre || selectedCustomer.email || 'Customer'}</h3>
              <form onSubmit={handleSaleSubmit} className="form-sale">
                {saleError && (
                  <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)', marginBottom: '0.75rem' }}>{saleError}</p>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label><CreditCard size={14} /> Membresía</label>
                    <select
                      value={saleForm.membershipId}
                      onChange={(e) => setSaleForm((f) => ({ ...f, membershipId: e.target.value }))}
                      required
                      disabled={loadingMemberships}
                    >
                      <option value="">{loadingMemberships ? 'Cargando…' : 'Seleccionar membresía...'}</option>
                      {membershipsList.map((m) => (
                        <option key={m.id} value={m.id}>{m.nombre} ({m.duracionDias ?? m.duration_days ?? 0} días)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={14} /> Fecha inicio</label>
                    <input type="date" value={fechaInicio} readOnly aria-readonly="true" />
                  </div>
                  <div className="form-group">
                    <label><Calendar size={14} /> Fecha finalización</label>
                    <input type="date" value={fechaFin} readOnly aria-readonly="true" placeholder={selectedMembership ? undefined : '—'} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={saleSubmitting}>{saleSubmitting ? 'Guardando…' : 'Registrar pago'}</button>
                  <button type="button" className="secondary" onClick={() => setSaleModal(false)} disabled={saleSubmitting}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
