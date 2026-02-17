import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, FileText, MapPin, Shield, ToggleLeft, ArrowLeft } from 'lucide-react';
import { getUserDetail } from '../useCases/getUserDetail.js';

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

export default function UsuarioDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let cancelled = false;
    setLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(() => {
      getUserDetail(id, { signal })
        .then((data) => {
          if (!cancelled) setUser(data);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          if (!cancelled) {
            setError(err.message || 'Error al cargar usuario');
            setUser(null);
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

  if (loading) {
    return (
      <div className="card">
        <p className="info-muted">Cargando usuario…</p>
        <Link to="/usuarios" className="btn-back">
          <ArrowLeft size={16} />
          Volver a usuarios
        </Link>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="card">
        <p>{error || 'Usuario no encontrado.'}</p>
        <Link to="/usuarios" className="btn-back">
          <ArrowLeft size={16} />
          Volver a usuarios
        </Link>
      </div>
    );
  }

  const infoRows = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Teléfono', value: user.telefono ?? user.phone },
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
        <Avatar name={user.nombre ?? user.name} size={80} />
        <div className="user-detail-header-text">
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            {(user.nombre ?? user.name) || 'Sin nombre'}
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Detalle del usuario</p>
          <div className="usuario-detail-badges" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge secondary">
              <Shield size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {user.role ?? '—'}
            </span>
            <span className={`badge ${user.status === 'active' ? 'success' : 'danger'}`}>
              <ToggleLeft size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {user.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
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
      </div>
    </div>
  );
}
