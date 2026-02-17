import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Mail, X, ChevronLeft, ChevronRight, ExternalLink, Power, UserPlus, FileDown } from 'lucide-react';
import ActionIcon from '../components/ActionIcon';
import { exportToExcel } from '../utils/exportExcel';
import { getUsersList } from '../useCases/getUsersList.js';
import { createUser as createUserUseCase } from '../useCases/createUser.js';
import { updateUserStatus } from '../useCases/updateUserStatus.js';

const initialFilters = { nombre: '', email: '' };
const initialForm = { nombre: '', email: '', telefono: '', password: '', role: 'member', status: 'active' };

function matchUser(u, filters) {
  const n = (filters.nombre || '').trim().toLowerCase();
  const e = (filters.email || '').trim().toLowerCase();
  if (n && !(u.nombre ?? u.name ?? '').toLowerCase().includes(n)) return false;
  if (e && !(u.email || '').toLowerCase().includes(e)) return false;
  return true;
}

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [togglingId, setTogglingId] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getUsersList({ page: pagination.page, limit: pagination.limit })
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data ?? []);
          setPagination((p) => ({ ...p, ...res.pagination }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message || 'Error al cargar usuarios');
          setUsers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [pagination.page, pagination.limit]);

  const goToPage = (page) => {
    setPagination((prev) => ({ ...prev, page: Math.max(1, Math.min(page, prev.total_pages || 1)) }));
  };
  const setLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };

  const filteredUsers = users.filter((u) => matchUser(u, filters));
  const hasActiveFilters = Object.values(filters).some((v) => (v || '').trim() !== '');
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
      await createUserUseCase(form);
      setModal(false);
      const res = await getUsersList({ page: pagination.page, limit: pagination.limit });
      setUsers(res.data ?? []);
      setPagination((p) => ({ ...p, ...res.pagination }));
    } catch (err) {
      setFormError(err.message || 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    const rows = filteredUsers.map((u) => ({
      Nombre: u.nombre ?? u.name ?? '',
      Email: u.email ?? '',
      Teléfono: u.telefono ?? u.phone ?? '',
      Rol: u.role ?? '',
      Estado: u.status === 'active' ? 'Activo' : 'Inactivo',
    }));
    exportToExcel(rows, `usuarios-${new Date().toISOString().slice(0, 10)}`, 'Usuarios');
  };

  const handleToggleStatus = (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    setTogglingId(u.id);
    updateUserStatus(u.id, newStatus)
      .then(() => {
        setUsers((prev) =>
          prev.map((user) => (user.id === u.id ? { ...user, status: newStatus } : user))
        );
      })
      .catch(() => {})
      .finally(() => setTogglingId(null));
  };

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Tabla de usuarios del sistema</p>
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

      {loading ? (
        <div className="card">
          <p className="info-muted">Cargando usuarios…</p>
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
                  placeholder="Nombre"
                  value={filters.nombre}
                  onChange={(e) => setFilters((f) => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="page-filter-field">
                <Mail size={14} />
                <input
                  type="text"
                  placeholder="Email"
                  value={filters.email}
                  onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
                />
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

          <div className="card">
            <div className="table-container">
              {filteredUsers.length === 0 ? (
                <p className="empty-message">No hay usuarios o ningún resultado coincide con los filtros.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="table-user-cell">{u.nombre ?? u.name ?? '—'}</td>
                        <td>{u.email ?? '—'}</td>
                        <td>{u.telefono ?? u.phone ?? '—'}</td>
                        <td>
                          <span className="badge secondary">{u.role ?? '—'}</span>
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'active' ? 'success' : 'danger'}`}>
                            {u.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <Link to={`/usuarios/${u.id}`} className="action-link" title="Ver detalle del usuario">
                              <ExternalLink size={16} />
                              Ver
                            </Link>
                            <ActionIcon
                              icon={Power}
                              label={u.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                              variant="secondary"
                              size={16}
                              onClick={() => handleToggleStatus(u)}
                              disabled={togglingId === u.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Nuevo usuario</h3>
            <form onSubmit={handleSubmit}>
              {formError && (
                <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)', marginBottom: '0.75rem' }}>{formError}</p>
              )}
              <div className="form-group">
                <label>Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                  placeholder="Nombre completo"
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
                <label>Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="600 000 000"
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
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
    </div>
  );
}
