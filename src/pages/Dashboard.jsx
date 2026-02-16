import { useMemo } from 'react';
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
import { useData } from '../context/DataContext';

const CARD_COLORS = {
  users: 'var(--fit-primary)',
  memberships: '#81c784',
  sales: '#ffb74d',
  month: '#00A3FF',
};

export default function Dashboard() {
  const { users, memberships, sales, getUser, getMembership } = useData();

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const salesThisMonth = sales.filter((s) => {
    const d = new Date(s.fechaCompra);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const salesByMonth = useMemo(() => {
    const byMonth = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = { mes: d.toLocaleDateString('es', { month: 'short', year: '2-digit' }), ventas: 0 };
    }
    sales.forEach((s) => {
      const d = new Date(s.fechaCompra);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (byMonth[key]) byMonth[key].ventas += 1;
    });
    return Object.values(byMonth);
  }, [sales]);

  const activeVsExpired = useMemo(() => {
    const today = new Date();
    let active = 0;
    let expired = 0;
    sales.forEach((s) => {
      if (new Date(s.fechaFin) >= today) active += 1;
      else expired += 1;
    });
    return [
      { name: 'Activas', value: active, color: '#81c784' },
      { name: 'Vencidas', value: expired, color: '#e57373' },
    ].filter((d) => d.value > 0);
  }, [sales]);

  const cards = [
    { title: 'Usuarios', value: users.length, icon: Users, color: CARD_COLORS.users },
    { title: 'Membresías', value: memberships.length, icon: CreditCard, color: CARD_COLORS.memberships },
    { title: 'Ventas totales', value: sales.length, icon: ShoppingCart, color: CARD_COLORS.sales },
    { title: 'Ventas este mes', value: salesThisMonth.length, icon: TrendingUp, color: CARD_COLORS.month },
  ];

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
        {sales.length === 0 ? (
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
                {[...sales].reverse().slice(0, 8).map((s) => {
                  const u = getUser(s.userId);
                  const m = getMembership(s.membershipId);
                  const end = new Date(s.fechaFin);
                  const today = new Date();
                  const active = today <= end;
                  return (
                    <tr key={s.id}>
                      <td>{new Date(s.fechaCompra).toLocaleDateString('es')}</td>
                      <td>{u?.nombre ?? '-'}</td>
                      <td>{m?.nombre ?? '-'}</td>
                      <td>
                        <span className={`badge ${active ? 'success' : 'danger'}`}>
                          {active ? 'Activa' : 'Vencida'}
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
