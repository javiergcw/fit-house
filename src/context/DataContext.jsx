import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  users: 'fit-house-users',
  memberships: 'fit-house-memberships',
  sales: 'fit-house-sales',
};

function load(key, defaultVal = []) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getExampleUsers() {
  return [
    { id: '1', nombre: 'María García', email: 'maria@email.com', telefono: '600 111 222', documento: '12345678A', direccion: 'Calle Mayor 1' },
    { id: '2', nombre: 'Carlos López', email: 'carlos@email.com', telefono: '600 333 444', documento: '87654321B', direccion: 'Av. Sol 15' },
    { id: '3', nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '600 555 666', documento: '11223344C', direccion: 'Plaza Central 3' },
    { id: '4', nombre: 'Pedro Sánchez', email: 'pedro@email.com', telefono: '600 777 888', documento: '55667788D', direccion: 'Calle Nueva 7' },
  ];
}

function getExampleMemberships() {
  return [
    { id: '1', nombre: '7 días', tipo: 'dias', duracionDias: 7, precio: '15' },
    { id: '2', nombre: 'Mensual', tipo: 'mes', duracionDias: 30, precio: '45' },
    { id: '3', nombre: 'Trimestral', tipo: 'mes', duracionDias: 90, precio: '120' },
    { id: '4', nombre: 'Anual', tipo: 'anio', duracionDias: 365, precio: '399' },
  ];
}

function getExampleSales() {
  const today = new Date();
  const base = [
    { id: '1', userId: '1', membershipId: '2', fechaCompra: addDays(today, -25), fechaInicio: addDays(today, -25), fechaFin: addDays(today, 5) },
    { id: '2', userId: '2', membershipId: '4', fechaCompra: addDays(today, -100), fechaInicio: addDays(today, -100), fechaFin: addDays(today, 265) },
    { id: '3', userId: '3', membershipId: '1', fechaCompra: addDays(today, -10), fechaInicio: addDays(today, -10), fechaFin: addDays(today, -3) },
    { id: '4', userId: '1', membershipId: '1', fechaCompra: addDays(today, -40), fechaInicio: addDays(today, -40), fechaFin: addDays(today, -33) },
    { id: '5', userId: '4', membershipId: '3', fechaCompra: addDays(today, -15), fechaInicio: addDays(today, -15), fechaFin: addDays(today, 75) },
  ];
  // Más ventas de ejemplo para informes (ventas por producto con más volumen)
  const extra = [];
  const userIds = ['1', '2', '3', '4'];
  const membershipIds = ['1', '2', '3', '4']; // 7 días, Mensual, Trimestral, Anual
  let id = 6;
  for (let i = 0; i < 24; i++) {
    const dayOffset = -20 + (i % 15);
    const d = addDays(today, dayOffset);
    const u = userIds[i % userIds.length];
    const m = membershipIds[i % membershipIds.length];
    const start = new Date(d);
    const end = new Date(start);
    const days = { '1': 7, '2': 30, '3': 90, '4': 365 }[m];
    end.setDate(end.getDate() + days);
    extra.push({
      id: String(id++),
      userId: u,
      membershipId: m,
      fechaCompra: d,
      fechaInicio: d,
      fechaFin: end.toISOString().slice(0, 10),
    });
  }
  return [...base, ...extra];
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const loaded = load(STORAGE_KEYS.users);
    if (loaded.length > 0) return loaded;
    return getExampleUsers();
  });
  const [memberships, setMemberships] = useState(() => {
    const loaded = load(STORAGE_KEYS.memberships);
    if (loaded.length > 0) return loaded;
    return getExampleMemberships();
  });
  const [sales, setSales] = useState(() => {
    const loaded = load(STORAGE_KEYS.sales);
    if (loaded.length > 0) return loaded;
    return getExampleSales();
  });

  useEffect(() => {
    save(STORAGE_KEYS.users, users);
  }, [users]);
  useEffect(() => {
    save(STORAGE_KEYS.memberships, memberships);
  }, [memberships]);
  useEffect(() => {
    save(STORAGE_KEYS.sales, sales);
  }, [sales]);

  const nextId = (arr) => String(Math.max(0, ...arr.map((x) => Number(x.id) || 0)) + 1);

  const addUser = useCallback((data) => {
    const id = nextId(users);
    setUsers((prev) => [...prev, { id, ...data }]);
    return id;
  }, [users]);
  const updateUser = useCallback((id, data) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  }, []);
  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSales((prev) => prev.filter((s) => s.userId !== id));
  }, []);
  const getUser = useCallback((id) => users.find((u) => u.id === id), [users]);

  const addMembership = useCallback((data) => {
    const id = nextId(memberships);
    setMemberships((prev) => [...prev, { id, ...data }]);
    return id;
  }, [memberships]);
  const updateMembership = useCallback((id, data) => {
    setMemberships((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);
  const deleteMembership = useCallback((id) => {
    setMemberships((prev) => prev.filter((m) => m.id !== id));
    setSales((prev) => prev.filter((s) => s.membershipId !== id));
  }, []);
  const getMembership = useCallback((id) => memberships.find((m) => m.id === id), [memberships]);

  const addSale = useCallback((data) => {
    const id = nextId(sales);
    setSales((prev) => [...prev, { id, ...data }]);
    return id;
  }, [sales]);
  const updateSale = useCallback((id, data) => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);
  const deleteSale = useCallback((id) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);
  const getSale = useCallback((id) => sales.find((s) => s.id === id), [sales]);
  const getPurchasesByUser = useCallback((userId) => {
    return sales.filter((s) => s.userId === userId);
  }, [sales]);

  const getActiveMembershipForUser = useCallback((userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userSales = sales.filter((s) => s.userId === userId);
    for (const sale of userSales) {
      const end = new Date(sale.fechaFin);
      end.setHours(0, 0, 0, 0);
      const start = new Date(sale.fechaInicio);
      start.setHours(0, 0, 0, 0);
      if (today >= start && today <= end) {
        const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return { sale, daysLeft, membership: getMembership(sale.membershipId) };
      }
    }
    return null;
  }, [sales, getMembership]);

  const value = {
    users,
    memberships,
    sales,
    addUser,
    updateUser,
    deleteUser,
    getUser,
    addMembership,
    updateMembership,
    deleteMembership,
    getMembership,
    addSale,
    updateSale,
    deleteSale,
    getSale,
    getPurchasesByUser,
    getActiveMembershipForUser,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
