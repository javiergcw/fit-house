import { useState, useEffect } from 'react';
import { ShoppingCart, CreditCard, Calendar, Search, X, FileDown, ChevronLeft, ChevronRight, DollarSign, User } from 'lucide-react';
import { exportToExcel } from '../utils/exportExcel';
import { getSalesList } from '../useCases/getSalesList.js';
import { getMembershipsList } from '../useCases/getMembershipsList.js';

const initialFilters = { status: '', user_name: '', membership_id: '', date_from: '', date_to: '' };

function matchSale(sale, filters) {
  const statusFilter = (filters.status || '').trim().toLowerCase();
  if (statusFilter && (sale.status || '').toLowerCase() !== statusFilter) return false;
  return true;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedUserName, setAppliedUserName] = useState('');
  const [appliedMembershipId, setAppliedMembershipId] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [membershipsList, setMembershipsList] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getMembershipsList({ page: 1, limit: 100 })
      .then((res) => {
        if (!cancelled) setMembershipsList(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setMembershipsList([]);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const params = { page: pagination.page, limit: pagination.limit };
    if (appliedUserName) params.user_name = appliedUserName;
    if (appliedMembershipId) params.membership_id = appliedMembershipId;
    if (appliedDateFrom) params.date_from = appliedDateFrom;
    if (appliedDateTo) params.date_to = appliedDateTo;
    getSalesList(params)
      .then((res) => {
        if (!cancelled) {
          setSales(res.data ?? []);
          setPagination((p) => ({ ...p, ...res.pagination }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Error al cargar ventas');
          setSales([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pagination.page, pagination.limit, appliedUserName, appliedMembershipId, appliedDateFrom, appliedDateTo]);

  const handleSearch = () => {
    setAppliedUserName((filters.user_name || '').trim());
    setAppliedMembershipId((filters.membership_id || '').trim());
    setAppliedDateFrom((filters.date_from || '').trim());
    setAppliedDateTo((filters.date_to || '').trim());
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const goToPage = (page) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, Math.min(page, prev.total_pages || 1)) }));
  };
  const setLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };

  const filteredSales = sales.filter((s) => matchSale(s, filters));
  const hasActiveFilters = appliedUserName !== '' || appliedMembershipId !== '' || appliedDateFrom !== '' || appliedDateTo !== '' || (filters.status || '').trim() !== '' || (filters.user_name || '').trim() !== '' || (filters.membership_id || '').trim() !== '' || (filters.date_from || '').trim() !== '' || (filters.date_to || '').trim() !== '';
  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedUserName('');
    setAppliedMembershipId('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleExportExcel = () => {
    const rows = filteredSales.map((s) => ({
      ID: s.id ?? '',
      'Fecha venta': s.sale_date ? formatDate(s.sale_date) : '',
      Cliente: (s.customerName || s.customer?.nombre || s.customer?.full_name || s.customer_id) ?? '',
      Subtotal: s.subtotal ?? '',
      Total: s.total ?? '',
      Estado: s.status ?? '',
    }));
    exportToExcel(rows, `ventas-${new Date().toISOString().slice(0, 10)}`, 'Ventas');
  };

  const statusLabel = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'paid') return 'Pagada';
    if (v === 'pending') return 'Pendiente';
    if (v === 'cancelled') return 'Cancelada';
    return s || '—';
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
        </div>
      </div>

      {loading ? (
        <div className="card">
          <p className="info-muted">Cargando ventas…</p>
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
                <User size={16} />
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={filters.user_name}
                  onChange={(e) => setFilters((f) => ({ ...f, user_name: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                  aria-label="Nombre del cliente"
                />
              </div>
              <div className="page-filter-field">
                <CreditCard size={16} />
                <select
                  value={filters.membership_id}
                  onChange={(e) => setFilters((f) => ({ ...f, membership_id: e.target.value }))}
                  aria-label="Membresía"
                >
                  <option value="">Todas las membresías</option>
                  {membershipsList.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre ?? m.id} ({m.duracionDias ?? m.duration_days ?? 0} días)</option>
                  ))}
                </select>
              </div>
              <div className="page-filter-field">
                <Calendar size={16} />
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
                  aria-label="Desde"
                />
              </div>
              <div className="page-filter-field">
                <Calendar size={16} />
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
                  aria-label="Hasta"
                />
              </div>
              <button type="button" className="btn-primary-with-icon" onClick={handleSearch} title="Buscar">
                <Search size={18} />
                Buscar
              </button>
              <div className="page-filter-field">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  aria-label="Estado"
                >
                  <option value="">Todos los estados</option>
                  <option value="paid">Pagada</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Cancelada</option>
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

          {sales.length === 0 ? (
            <div className="card empty-state-card">
              <div className="empty-state-icon">
                <ShoppingCart size={40} strokeWidth={1.2} />
              </div>
              <p className="empty-state-title">No hay ventas registradas</p>
              <p className="empty-state-text">Las ventas aparecerán aquí.</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <p className="empty-message">Ninguna venta coincide con los filtros.</p>
          ) : (
            <div className="sales-list">
              {filteredSales.map((s) => (
                <div key={s.id} className="sale-card card">
                  <div className="sale-card-main">
                    <div className="sale-card-dates">
                      <Calendar size={14} />
                      <span>{formatDate(s.sale_date)}</span>
                    </div>
                    <div className="sale-card-membership">
                      <CreditCard size={16} />
                      <span>Cliente: {(s.customerName || s.customer?.nombre || s.customer?.full_name || s.customer_id) ?? '—'}</span>
                    </div>
                    <div className="sale-card-total">
                      <DollarSign size={16} />
                      <span>{s.totalFormatted ?? s.total ?? '—'}</span>
                    </div>
                    <span className={`badge ${s.status === 'paid' ? 'success' : s.status === 'pending' ? 'secondary' : 'danger'}`}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
