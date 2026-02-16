import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, FileText, MapPin, CreditCard, Calendar, Ticket, ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';

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

export default function UserDetail() {
  const { id } = useParams();
  const { getUser, getPurchasesByUser, getActiveMembershipForUser, getMembership } = useData();
  const user = getUser(id);
  const purchases = getPurchasesByUser(id);
  const active = getActiveMembershipForUser(id);

  if (!user) {
    return (
      <div className="card">
        <p>Usuario no encontrado.</p>
        <Link to="/usuarios" className="btn-back">
          <ArrowLeft size={16} />
          Volver a usuarios
        </Link>
      </div>
    );
  }

  const infoRows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Teléfono', value: user.telefono },
    { icon: FileText, label: 'Documento', value: user.documento },
    { icon: MapPin, label: 'Dirección', value: user.direccion },
  ];

  return (
    <div className="user-detail-page">
      <Link to="/usuarios" className="back-link">
        <ArrowLeft size={16} />
        Volver a usuarios
      </Link>

      <div className="user-detail-header card">
        <Avatar name={user.nombre} size={80} />
        <div className="user-detail-header-text">
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{user.nombre || 'Sin nombre'}</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Detalle del usuario</p>
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
          {active ? (
            <div className="membership-status membership-active">
              <span className="badge success">Activa</span>
              <strong>{active.membership?.nombre}</strong>
              <span className="membership-days">{active.daysLeft} días restantes</span>
              <span className="membership-date">Válida hasta {new Date(active.sale.fechaFin).toLocaleDateString('es')}</span>
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
          Historial de compras
        </h3>
        {purchases.length === 0 ? (
          <p className="info-muted">No tiene compras registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha compra</th>
                  <th>Membresía</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((s) => {
                  const m = getMembership(s.membershipId);
                  const end = new Date(s.fechaFin);
                  const isActive = new Date() <= end;
                  return (
                    <tr key={s.id}>
                      <td>{new Date(s.fechaCompra).toLocaleDateString('es')}</td>
                      <td>{m?.nombre ?? '-'}</td>
                      <td>{new Date(s.fechaInicio).toLocaleDateString('es')}</td>
                      <td>{new Date(s.fechaFin).toLocaleDateString('es')}</td>
                      <td>
                        <span className={`badge ${isActive ? 'success' : 'danger'}`}>
                          {isActive ? 'Activa' : 'Vencida'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
