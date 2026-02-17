import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Users, CreditCard, ShoppingCart, TrendingUp } from 'lucide-react';
import { getDashboard } from '../useCases/getDashboard.js';

const CARD_COLORS = {
  users: 'var(--fit-primary)',
  memberships: '#81c784',
  sales: '#ffb74d',
  month: '#00A3FF',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error al cargar el dashboard');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = data?.stats ?? { users: 0, memberships_total: 0, total_sales: 0, sales_this_month: 0 };
  const salesByMonth = data?.salesByMonth ?? [];
  const activeVsExpired = data?.activeVsExpired ?? [];
  const lastSalesRows = data?.lastSalesRows ?? [];

  const cards = [
    { title: 'Usuarios', value: stats.users, icon: Users, color: CARD_COLORS.users },
    { title: 'Membresías', value: stats.memberships_total, icon: CreditCard, color: CARD_COLORS.memberships },
    { title: 'Ventas totales', value: stats.total_sales, icon: ShoppingCart, color: CARD_COLORS.sales },
    { title: 'Ventas este mes', value: stats.sales_this_month, icon: TrendingUp, color: CARD_COLORS.month },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen de tu negocio</p>
        <div className="card">
          <p className="info-muted">Cargando dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen de tu negocio</p>
        <div className="card">
          <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Resumen de tu negocio</p>

      <section className="dashboard-cards">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="dashboard-card" style={{ borderLeftColor: c.color }}>
              <div className="dashboard-card-icon" style={{ color: c.color }}>
                <Icon size={22} strokeWidth={2} />
              </div>
              <div>
                <span className="dashboard-card-label">{c.title}</span>
                <span className="dashboard-card-value" style={{ color: c.color }}>{c.value}</span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="dashboard-charts">
        <div className="card chart-card">
          <h3 className="section-title">
            <TrendingUp size={18} />
            Ventas por mes
          </h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByMonth} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fit-border)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: 'var(--fit-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--fit-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--fit-card-bg)', border: '1px solid var(--fit-border)', borderRadius: 6, color: 'var(--fit-text)' }}
                  labelStyle={{ color: 'var(--fit-text)' }}
                  formatter={(value) => [value, 'Ventas']}
                />
                <Bar dataKey="ventas" fill="var(--fit-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card">
          <h3 className="section-title">
            <CreditCard size={18} />
            Estado de membresías
          </h3>
          <div className="chart-wrap pie-wrap">
            {activeVsExpired.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={activeVsExpired}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: '#e8e8e8', strokeWidth: 1 }}
                  >
                    {activeVsExpired.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--fit-card-bg)', border: '1px solid var(--fit-border)', borderRadius: 6, color: 'var(--fit-text)' }}
                  formatter={(value) => [value, 'Ventas']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="chart-empty">Sin datos de ventas</p>
            )}
          </div>
        </div>
      </div>

      <section className="card">
        <h3 className="section-title">
          <ShoppingCart size={18} />
          Últimas ventas
        </h3>
        {lastSalesRows.length === 0 ? (
          <p className="empty-message">No hay ventas registradas</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Membresía</th>
                  <th>Vigencia</th>
                </tr>
              </thead>
              <tbody>
                {lastSalesRows.slice(0, 8).map((row) => {
                  const vigenciaDate = row.vigencia ? new Date(row.vigencia) : null;
                  const today = new Date();
                  const active = vigenciaDate && today <= vigenciaDate;
                  return (
                    <tr key={row.id}>
                      <td>{row.fecha || '—'}</td>
                      <td>{row.usuario}</td>
                      <td>{row.membresia}</td>
                      <td>
                        {row.vigencia ? (
                          <span className={`badge ${active ? 'success' : 'danger'}`}>
                            {active ? 'Activa' : 'Vencida'}
                          </span>
                        ) : (
                          '—'
                        )}
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
