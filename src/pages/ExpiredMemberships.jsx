import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, User, ChevronLeft, ChevronRight, AlertCircle, UserX, Clock, UserMinus, Mail, Phone, LogOut } from 'lucide-react';
import { getExpiringMemberships } from '../useCases/getExpiringMemberships.js';
import { getLeftCustomers } from '../useCases/getLeftCustomers.js';
import { markCustomerAsLeft } from '../useCases/markCustomerAsLeft.js';

const TABS = [
  { id: 'all', label: 'Ver membresías por vencer / vencidas', icon: CreditCard },
  { id: 'left', label: 'Clientes dados de baja', icon: UserX },
];

function formatDate(value) {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getCustomerName(row) {
  return row.customer_name ?? row.customer?.full_name ?? row.customer?.nombre ?? row.customer_name ?? row.customer_id ?? '—';
}

function getMembershipName(row) {
  return row.membership_name ?? row.membership?.nombre ?? row.membership_name ?? '—';
}

export default function ExpiredMemberships() {
  const [fullList, setFullList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [markingAsLeftId, setMarkingAsLeftId] = useState(null);
  const [leftCustomersList, setLeftCustomersList] = useState(null);
  const [leftLoading, setLeftLoading] = useState(false);
  const [leftError, setLeftError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getExpiringMemberships()
      .then((res) => {
        if (!cancelled) {
          setFullList(res.data ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error al cargar suscripciones por vencer');
          setFullList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'left') return;
    if (leftCustomersList !== null) return;
    let cancelled = false;
    setLeftLoading(true);
    setLeftError(null);
    getLeftCustomers()
      .then((res) => {
        if (!cancelled) {
          setLeftCustomersList(res.data ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLeftError(err.message || 'Error al cargar clientes dados de baja');
          setLeftCustomersList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLeftLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, leftCustomersList]);

  const filteredByTab = useMemo(() => fullList, [fullList]);
  const leftList = leftCustomersList ?? [];
  const totalFiltered = activeTab === 'left' ? leftList.length : filteredByTab.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
  const data = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    if (activeTab === 'left') {
      return leftList.slice(start, start + pagination.limit);
    }
    return filteredByTab.slice(start, start + pagination.limit);
  }, [activeTab, filteredByTab, leftList, pagination.page, pagination.limit]);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setPagination((prev) => ({ ...prev, page: p }));
  };

  const setLimit = (limit) => {
    setPagination((prev) => ({ ...prev, limit: Number(limit), page: 1 }));
  };

  const isAlreadyLeft = (row) => row.customer?.left_at != null || (row.customer?.status ?? '').toLowerCase() === 'inactive';

  const handleMarkAsLeft = async (row) => {
    if (!row.customer_id || isAlreadyLeft(row)) return;
    setMarkingAsLeftId(row.customer_id);
    setError(null);
    try {
      await markCustomerAsLeft(row.customer_id);
      const res = await getExpiringMemberships();
      setFullList(res.data ?? []);
      if (leftCustomersList !== null) {
        const leftRes = await getLeftCustomers();
        setLeftCustomersList(leftRes.data ?? []);
      }
    } catch (err) {
      setError(err.message || 'Error al marcar como baja');
    } finally {
      setMarkingAsLeftId(null);
    }
  };

  return (
    <div className="expired-memberships-page">
      <h1 className="page-title">Membresías vencidas</h1>
      <p className="page-subtitle">
        Consulta membresías expiradas y las de personas que ya no están activas
      </p>

      <div className="expired-memberships-tabs card">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`expired-memberships-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            aria-selected={activeTab === tab.id}
            aria-controls="expired-memberships-panel"
            id={`tab-${tab.id}`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div id="expired-memberships-panel" className="card expired-memberships-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'left' ? (
          leftLoading ? (
            <p className="info-muted">Cargando clientes dados de baja…</p>
          ) : leftError ? (
            <div className="expired-memberships-error">
              <AlertCircle size={24} />
              <p>{leftError}</p>
              <p className="info-muted">Comprueba que el endpoint GET /customers/left esté disponible.</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-state-icon">
                <UserX size={40} strokeWidth={1.2} />
              </div>
              <p className="empty-state-title">Sin clientes dados de baja</p>
              <p className="empty-state-text">No hay clientes marcados como personas dadas de baja.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="report-products-table expired-memberships-table">
                  <thead>
                    <tr>
                      <th><User size={14} /> Cliente</th>
                      <th><Mail size={14} /> Email</th>
                      <th><Phone size={14} /> Teléfono</th>
                      <th><LogOut size={14} /> Fecha de baja</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Link to={`/customers/${c.id}`} className="expired-memberships-customer-link">
                            {c.nombre ?? c.full_name ?? c.email ?? '—'}
                          </Link>
                        </td>
                        <td>{c.email ?? '—'}</td>
                        <td>{c.telefono ?? c.phone ?? '—'}</td>
                        <td>{formatDate(c.left_at)}</td>
                        <td>
                          <Link to={`/customers/${c.id}`} className="btn-link-sm">Ver customer</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(totalPages > 1 || pagination.limit !== 20) && (
                <div className="report-products-pagination">
                  <div className="report-products-pagination-controls">
                    <div className="report-products-page-size">
                      <label htmlFor="expired-limit">Mostrar</label>
                      <select id="expired-limit" value={pagination.limit} onChange={(e) => setLimit(Number(e.target.value))} aria-label="Resultados por página">
                        {[10, 20, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
                      </select>
                      <span>· Total {totalFiltered}</span>
                    </div>
                    <div className="report-products-page-btns">
                      <span className="report-products-page-nums">Pág. {pagination.page}/{totalPages}</span>
                      <button type="button" className="btn-pagination" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1} aria-label="Página anterior">
                        <ChevronLeft size={18} />
                      </button>
                      <button type="button" className="btn-pagination" onClick={() => goToPage(pagination.page + 1)} disabled={pagination.page >= totalPages} aria-label="Página siguiente">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        ) : loading ? (
          <p className="info-muted">Cargando…</p>
        ) : error ? (
          <div className="expired-memberships-error">
            <AlertCircle size={24} />
            <p>{error}</p>
            <p className="info-muted">Comprueba que el endpoint GET /customer-memberships/expiring esté disponible.</p>
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <CreditCard size={40} strokeWidth={1.2} />
            </div>
            <p className="empty-state-title">Sin suscripciones por vencer</p>
            <p className="empty-state-text">No hay suscripciones por vencer o vencidas en este listado.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="report-products-table expired-memberships-table">
                <thead>
                  <tr>
                    <th><User size={14} /> Cliente</th>
                    <th><CreditCard size={14} /> Membresía</th>
                    <th><Calendar size={14} /> Inicio</th>
                    <th><Calendar size={14} /> Fin</th>
                    <th><Clock size={14} /> Días</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id ?? `${row.customer_id}-${row.membership_id}-${row.end_date}`}>
                      <td>
                        {row.customer_id ? (
                          <Link to={`/customers/${row.customer_id}`} className="expired-memberships-customer-link">
                            {getCustomerName(row)}
                          </Link>
                        ) : (
                          getCustomerName(row)
                        )}
                      </td>
                      <td>{getMembershipName(row)}</td>
                      <td>{formatDate(row.start_date ?? row.startDate)}</td>
                      <td>{formatDate(row.end_date ?? row.endDate)}</td>
                      <td>
                        {row.days_until_expiry != null
                          ? row.days_until_expiry <= 0
                            ? 'Vencida'
                            : `${row.days_until_expiry} día(s)`
                          : '—'}
                      </td>
                      <td>
                        {row.customer_id && (
                          <div className="expired-memberships-actions">
                            <Link to={`/customers/${row.customer_id}`} className="btn-link-sm">
                              Ver customer
                            </Link>
                            {!isAlreadyLeft(row) && (
                              <button
                                type="button"
                                className="btn-link-sm btn-mark-as-left"
                                onClick={() => handleMarkAsLeft(row)}
                                disabled={markingAsLeftId === row.customer_id}
                                title="Marcar a este cliente como persona dada de baja"
                              >
                                <UserMinus size={14} />
                                {markingAsLeftId === row.customer_id ? 'Procesando…' : 'Marcar como baja'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(totalPages > 1 || pagination.limit !== 20) && (
              <div className="report-products-pagination">
                <div className="report-products-pagination-controls">
                  <div className="report-products-page-size">
                    <label htmlFor="expired-limit">Mostrar</label>
                    <select
                      id="expired-limit"
                      value={pagination.limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      aria-label="Resultados por página"
                    >
                      {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <span>· Total {totalFiltered}</span>
                  </div>
                  <div className="report-products-page-btns">
                    <span className="report-products-page-nums">Pág. {pagination.page}/{totalPages}</span>
                    <button
                      type="button"
                      className="btn-pagination"
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      aria-label="Página anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn-pagination"
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= totalPages}
                      aria-label="Página siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
