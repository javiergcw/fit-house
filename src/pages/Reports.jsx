import { useState, useMemo, useEffect } from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Users, Package, FileText, ShoppingCart, ChevronLeft, ChevronRight, Search, Hash, FileDown } from 'lucide-react';
import { exportToExcelMultiSheet } from '../utils/exportExcel';
import { getReport } from '../useCases/getReport.js';

function getDefaultRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

const COLORS = ['#00A3FF', '#81c784', '#ffb74d', '#ba68c8', '#4dd0e1', '#ff8a65', '#9575cd', '#4db6ac', '#7986cb', '#a1887f'];

function formatCOP(n) {
  return `$${Number(n).toLocaleString('es-CO')} COP`;
}

export default function Reports() {
  const [range, setRange] = useState(getDefaultRange());
  const [appliedRange, setAppliedRange] = useState(range);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [productsPage, setProductsPage] = useState(1);
  const [productsPageSize, setProductsPageSize] = useState(10);
  const [productNameFilter, setProductNameFilter] = useState('');
  const [productQuantityMin, setProductQuantityMin] = useState('');
  const [productQuantityMax, setProductQuantityMax] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setReportError(null);
    getReport(appliedRange.start, appliedRange.end)
      .then((d) => {
        if (!cancelled) setReportData(d);
      })
      .catch((err) => {
        if (!cancelled) {
          setReportError(err.message || 'Error al generar el informe');
          setReportData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [appliedRange.start, appliedRange.end]);

  const applyReport = (e) => {
    e.preventDefault();
    setAppliedRange(range);
  };

  const salesByDay = reportData?.salesByDay ?? [];
  const topPayers = reportData?.topCustomers ?? [];
  const productsBySales = reportData?.salesByProduct ?? [];
  const pieProducts = reportData?.pieProducts ?? [];
  const totalRevenue = reportData?.totalRevenue ?? 0;
  const uniqueClients = reportData?.uniqueCustomersCount ?? 0;

  const productsFiltered = useMemo(() => {
    let list = productsBySales;
    const name = (productNameFilter || '').trim().toLowerCase();
    if (name) {
      list = list.filter((p) => (p.nombre || '').toLowerCase().includes(name));
    }
    const minQ = productQuantityMin !== '' ? Number(productQuantityMin) : null;
    const maxQ = productQuantityMax !== '' ? Number(productQuantityMax) : null;
    if (minQ != null && !Number.isNaN(minQ)) {
      list = list.filter((p) => p.count >= minQ);
    }
    if (maxQ != null && !Number.isNaN(maxQ)) {
      list = list.filter((p) => p.count <= maxQ);
    }
    return list;
  }, [productsBySales, productNameFilter, productQuantityMin, productQuantityMax]);

  const productsTotalPages = Math.max(1, Math.ceil(productsFiltered.length / productsPageSize));
  const effectiveProductsPage = Math.min(productsPage, productsTotalPages);
  const productsPaginated = useMemo(() => {
    const start = (effectiveProductsPage - 1) * productsPageSize;
    return productsFiltered.slice(start, start + productsPageSize);
  }, [productsFiltered, effectiveProductsPage, productsPageSize]);

  const hasProductFilters = productNameFilter.trim() !== '' || productQuantityMin !== '' || productQuantityMax !== '';
  const clearProductFilters = () => {
    setProductNameFilter('');
    setProductQuantityMin('');
    setProductQuantityMax('');
    setProductsPage(1);
  };

  const hasData = reportData != null && (reportData.salesQuantity > 0 || productsBySales.length > 0 || salesByDay.length > 0);

  const handleExportExcel = () => {
    const productosRows = productsFiltered.map((p) => ({
      'Producto / Membresía': p.nombre ?? '',
      'Cantidad vendida': p.count,
      'Ingresos (COP)': p.ingresos,
    }));
    const clientesRows = topPayers.map((c) => ({
      Cliente: c.nombre ?? '',
      'Total pagado (COP)': c.total,
    }));
    exportToExcelMultiSheet(
      [
        { name: 'Ventas por producto', data: productosRows },
        { name: 'Top clientes', data: clientesRows },
      ],
      `informe-${appliedRange.start}-${appliedRange.end}`
    );
  };

  return (
    <div className="reports-page">
      <h1 className="page-title">Informes</h1>
      <p className="page-subtitle">Analiza ventas e ingresos por intervalo de fechas</p>

      <form className="reports-filters card" onSubmit={applyReport}>
        <div className="reports-filters-row">
          <div className="reports-filter-group">
            <label><Calendar size={16} /> Desde</label>
            <input
              type="date"
              value={range.start}
              onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            />
          </div>
          <div className="reports-filter-group">
            <label><Calendar size={16} /> Hasta</label>
            <input
              type="date"
              value={range.end}
              onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn-primary-with-icon">
            <FileText size={18} />
            Generar informe
          </button>
          {hasData && (
            <button type="button" onClick={handleExportExcel} className="btn-secondary-with-icon btn-excel" title="Descargar Excel">
              <FileDown size={18} />
              Descargar Excel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="card">
          <p className="info-muted">Generando informe…</p>
        </div>
      ) : reportError ? (
        <div className="card">
          <p className="info-muted" style={{ color: 'var(--fit-danger, #ef5350)' }}>{reportError}</p>
        </div>
      ) : !hasData ? (
        <div className="card empty-state-card">
          <div className="empty-state-icon">
            <TrendingUp size={40} strokeWidth={1.2} />
          </div>
          <p className="empty-state-title">Sin ventas en este periodo</p>
          <p className="empty-state-text">
            No hay ventas entre {new Date(appliedRange.start).toLocaleDateString('es')} y {new Date(appliedRange.end).toLocaleDateString('es')}. Prueba otro intervalo.
          </p>
        </div>
      ) : (
        <>
          <div className="reports-summary">
            <div className="report-card card">
              <div className="report-card-icon" style={{ background: 'rgba(0, 163, 255, 0.15)', color: 'var(--fit-primary)' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <span className="report-card-label">Ventas</span>
                <span className="report-card-value">{reportData?.salesQuantity ?? 0}</span>
              </div>
            </div>
            <div className="report-card card">
              <div className="report-card-icon" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#81c784' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <span className="report-card-label">Ingresos totales</span>
                <span className="report-card-value">{formatCOP(totalRevenue)}</span>
              </div>
            </div>
            <div className="report-card card">
              <div className="report-card-icon" style={{ background: 'rgba(255, 183, 77, 0.2)', color: '#ffb74d' }}>
                <Users size={24} />
              </div>
              <div>
                <span className="report-card-label">Clientes únicos</span>
                <span className="report-card-value">{reportData?.uniqueCustomersCount ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="reports-split-row">
            <div className="card report-chart-card report-products-table-wrap report-split-col report-card-fill">
              <h3 className="section-title">
                <Package size={18} />
                Ventas por producto
              </h3>
              <div className="report-products-table-body">
            {productsBySales.length === 0 ? (
              <p className="empty-message">No hay ventas por producto en este periodo.</p>
            ) : (
              <>
                <div className="report-products-filters">
                  <div className="report-products-filters-row">
                    <div className="report-products-filter-group">
                      <label><Search size={16} /> Nombre de producto</label>
                      <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={productNameFilter}
                        onChange={(e) => { setProductNameFilter(e.target.value); setProductsPage(1); }}
                      />
                    </div>
                    <div className="report-products-filter-group">
                      <label><Hash size={16} /> Cant. mín.</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Mín"
                        value={productQuantityMin}
                        onChange={(e) => { setProductQuantityMin(e.target.value); setProductsPage(1); }}
                      />
                    </div>
                    <div className="report-products-filter-group">
                      <label><Hash size={16} /> Cant. máx.</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Máx"
                        value={productQuantityMax}
                        onChange={(e) => { setProductQuantityMax(e.target.value); setProductsPage(1); }}
                      />
                    </div>
                    {hasProductFilters && (
                      <button type="button" className="btn-secondary-sm" onClick={clearProductFilters}>
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </div>
                {productsFiltered.length === 0 ? (
                  <p className="empty-message">Ningún producto coincide con los filtros.</p>
                ) : (
                  <>
                    <div className="report-products-table-scroll">
                      <table className="report-products-table">
                        <thead>
                          <tr>
                            <th>Producto / Membresía</th>
                            <th className="report-products-th-num">Cantidad vendida</th>
                            <th className="report-products-th-num">Ingresos (COP)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsPaginated.map((p) => (
                            <tr key={p.membershipId ?? p.product ?? p.nombre}>
                              <td className="report-products-td-name">{p.nombre}</td>
                              <td className="report-products-td-num">{p.count}</td>
                              <td className="report-products-td-num report-products-td-ingresos">{formatCOP(p.ingresos)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="report-products-pagination">
                      <div className="report-products-pagination-info">
                        Mostrando {(effectiveProductsPage - 1) * productsPageSize + 1}–{Math.min(effectiveProductsPage * productsPageSize, productsFiltered.length)} de {productsFiltered.length}
                      </div>
                      <div className="report-products-pagination-controls">
                        <label className="report-products-page-size">
                          Filas:
                          <select
                            value={productsPageSize}
                            onChange={(e) => {
                              setProductsPageSize(Number(e.target.value));
                              setProductsPage(1);
                            }}
                          >
                            {[5, 10, 25, 50].map((n) => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </label>
                        <div className="report-products-page-btns">
                          <button
                            type="button"
                            className="btn-pagination"
                            disabled={effectiveProductsPage <= 1}
                            onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                            aria-label="Página anterior"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <span className="report-products-page-nums">
                            Página {effectiveProductsPage} de {productsTotalPages}
                          </span>
                          <button
                            type="button"
                            className="btn-pagination"
                            disabled={effectiveProductsPage >= productsTotalPages}
                            onClick={() => setProductsPage((p) => Math.min(productsTotalPages, p + 1))}
                            aria-label="Página siguiente"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
              </div>
            </div>

            <div className="card report-chart-card report-split-col">
              <h3 className="section-title">
                <TrendingUp size={18} />
                Ventas e ingresos por día
              </h3>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={salesByDay} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--fit-primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--fit-primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#81c784" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#81c784" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--fit-border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--fit-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: 'var(--fit-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--fit-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                    <Tooltip
                      contentStyle={{ background: 'var(--fit-card-bg)', border: '1px solid var(--fit-border)', borderRadius: 8, color: 'var(--fit-text)' }}
                      labelStyle={{ color: 'var(--fit-text)' }}
                      formatter={(value, name) => [name === 'ventas' ? value : formatCOP(value), name === 'ventas' ? 'Ventas' : 'Ingresos']}
                      labelFormatter={(label) => label}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="ventas" stroke="var(--fit-primary)" fill="url(#colorVentas)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="ingresos" stroke="#81c784" fill="url(#colorIngresos)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend-inline">
                <span><i style={{ background: 'var(--fit-primary)' }} /> Ventas</span>
                <span><i style={{ background: '#81c784' }} /> Ingresos (COP)</span>
              </div>
            </div>
          </div>

          <div className="reports-charts">
            <div className="reports-charts-row reports-two-col">
              <div className="card report-chart-card report-top-payers report-card-fill">
                <h3 className="section-title">
                  <Users size={18} />
                  Top 10 clientes que más pagaron
                </h3>
                <div className="report-top-payers-body">
                {topPayers.length === 0 ? (
                  <p className="empty-message">No hay datos en este periodo.</p>
                ) : (
                  <ol className="top-payers-list">
                    {topPayers.map((p, i) => (
                      <li key={p.customer_id ?? p.userId ?? i} className="top-payers-item">
                        <span className="top-payers-rank">{i + 1}</span>
                        <span className="top-payers-name">{p.nombre}</span>
                        <span className="top-payers-count">{p.count ?? 1} {(p.count ?? 1) === 1 ? 'compra' : 'compras'}</span>
                        <span className="top-payers-total">{formatCOP(p.total)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                </div>
              </div>
              <div className="card report-chart-card">
                <h3 className="section-title">
                  <Package size={18} />
                  Productos más vendidos
                </h3>
                <div className="chart-wrap">
                  {pieProducts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={pieProducts}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={{ stroke: '#e8e8e8', strokeWidth: 1 }}
                        >
                          {pieProducts.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'var(--fit-card-bg)', border: '1px solid var(--fit-border)', borderRadius: 8, color: 'var(--fit-text)' }}
                          formatter={(value) => [value, 'Ventas']}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="chart-empty">Sin datos</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
