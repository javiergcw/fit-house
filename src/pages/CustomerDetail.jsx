import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, FileText, MapPin, CreditCard, Ticket, ArrowLeft } from 'lucide-react';
import { getCustomerDetail } from '../useCases/getCustomerDetail.js';
import { getCustomerMemberships } from '../useCases/getCustomerMemberships.js';

function Avatar({ name, size = 64 }) {
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

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [customerMemberships, setCustomerMemberships] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [error, setError] = useState(null);

  const timeoutRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;
    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      getCustomerDetail(id, { signal })
        .then((data) => {
          if (!cancelled) setCustomer(data);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          if (!cancelled) {
            setError(err.message || 'Error al cargar customer');
            setCustomer(null);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    if (!id) {
      setCustomerMemberships(null);
      setLoadingMemberships(false);
      return;
    }
    let cancelled = false;
    setLoadingMemberships(true);
    getCustomerMemberships(id)
      .then((data) => {
        if (!cancelled) setCustomerMemberships(data);
      })
      .catch(() => {
        if (!cancelled) setCustomerMemberships({ current_membership: null, memberships: [] });
      })
      .finally(() => {
        if (!cancelled) setLoadingMemberships(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const current = customerMemberships?.current_membership ?? null;
  const memberships = customerMemberships?.memberships ?? [];

  if (loading) {
    return (
      <div className="card">
        <p className="info-muted">Cargando customer…</p>
        <Link to="/customers" className="btn-back">
          <ArrowLeft size={16} />
          Volver a customers
        </Link>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="card">
        <p>{error || 'Customer no encontrado.'}</p>
        <Link to="/customers" className="btn-back">
          <ArrowLeft size={16} />
          Volver a customers
        </Link>
      </div>
    );
  }

  const infoRows = [
    { icon: Mail, label: 'Email', value: customer.email },
    { icon: Phone, label: 'Teléfono', value: customer.telefono },
    { icon: FileText, label: 'Documento', value: customer.documento },
    { icon: MapPin, label: 'Dirección', value: customer.direccion },
  ];

  return (
    <div className="user-detail-page">
      <Link to="/customers" className="back-link">
        <ArrowLeft size={16} />
        Volver a customers
      </Link>

      <div className="user-detail-header card">
        <Avatar name={customer.nombre} size={80} />
        <div className="user-detail-header-text">
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{customer.nombre || 'Sin nombre'}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Customer detail</p>
        </div>
      </div>

      <div className="user-detail-grid">
        <section className="card">
          <h3 className="section-title">
            <User size={18} />
            Información de contacto
          </h3>
          <ul className="info-list">
            {infoRows.filter((r) => r.value).length ? (
              infoRows.filter((r) => r.value).map(({ icon: Icon, label, value }) => (
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
        </section>

        <section className="card">
          <h3 className="section-title">
            <CreditCard size={18} />
            Membresía actual
          </h3>
          {loadingMemberships ? (
            <p className="info-muted">Cargando membresías…</p>
          ) : current ? (
            <div className="membership-status membership-active">
              <span className="badge success">Activa</span>
              <strong>{current.membership?.nombre ?? 'Membresía'}</strong>
              <span className="membership-days">{current.daysLeft ?? 0} días restantes</span>
              <span className="membership-date">Válida hasta {current.endDate ? current.endDate.toLocaleDateString('es') : current.end_date}</span>
            </div>
          ) : (
            <div className="membership-status membership-inactive">
              <span className="badge danger">Sin membresía activa</span>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h3 className="section-title">
          <Ticket size={18} />
          Historial de membresías
        </h3>
        {loadingMemberships ? (
          <p className="info-muted">Cargando…</p>
        ) : memberships.length === 0 ? (
          <p className="info-muted">No tiene membresías registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Membresía</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((item) => (
                  <tr key={item.id}>
                    <td>{item.membership?.nombre ?? '-'}</td>
                    <td>{item.startDate ? item.startDate.toLocaleDateString('es') : item.start_date}</td>
                    <td>{item.endDate ? item.endDate.toLocaleDateString('es') : item.end_date}</td>
                    <td>
                      <span className={`badge ${item.isActive ? 'success' : 'danger'}`}>
                        {item.isActive ? 'Activa' : 'Vencida'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
