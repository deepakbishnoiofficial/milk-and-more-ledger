import { useCallback, useMemo } from "react";

export type Customer = {
  id: string;
  name: string;
  phone: string; // digits only preferred
  milkPrice: number; // per liter
};

export type OtherItem = { id: string; name: string; price: number };

export type DayEntry = {
  date: string; // YYYY-MM-DD
  amQty?: number; // liters
  pmQty?: number; // liters
  otherItems?: OtherItem[];
  note?: string;
};

export type MonthTotals = {
  totalMilkLiters: number;
  milkAmount: number;
  otherAmount: number;
  grandTotal: number;
};

export type PaymentStatus = {
  yearMonth: string; // YYYY-MM
  paid: boolean;
  method?: "cash" | "online";
  reference?: string; // txn/ref no
};

type LedgerDB = {
  customers: Record<string, Customer>;
  // entries[customerId][YYYY-MM] = DayEntry[]
  entries: Record<string, Record<string, DayEntry[]>>;
  // payments[customerId][YYYY-MM] = PaymentStatus
  payments: Record<string, Record<string, PaymentStatus>>;
};

const STORAGE_KEY = "ledger_v1";

const readDB = (): LedgerDB => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { customers: {}, entries: {}, payments: {} };
    return JSON.parse(raw) as LedgerDB;
  } catch {
    return { customers: {}, entries: {}, payments: {} };
  }
};

const writeDB = (db: LedgerDB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const uid = () => Math.random().toString(36).slice(2, 10);

export const useLedgerStore = () => {
  const getCustomers = useCallback((): Customer[] => {
    const db = readDB();
    return Object.values(db.customers).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const createCustomer = useCallback((data: Omit<Customer, "id">) => {
    const db = readDB();
    const id = uid();
    db.customers[id] = { id, ...data };
    writeDB(db);
    return id;
  }, []);

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    const db = readDB();
    if (!db.customers[id]) return;
    db.customers[id] = { ...db.customers[id], ...patch };
    writeDB(db);
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    const db = readDB();
    delete db.customers[id];
    delete db.entries[id];
    delete db.payments[id];
    writeDB(db);
  }, []);

  const getCustomer = useCallback((id: string): Customer | undefined => {
    const db = readDB();
    return db.customers[id];
  }, []);

  const findCustomerByPhone = useCallback((phone: string): Customer | undefined => {
    const db = readDB();
    return Object.values(db.customers).find(c => c.phone === phone);
  }, []);

  const getMonthEntries = useCallback((customerId: string, date: Date): DayEntry[] => {
    const db = readDB();
    const key = ym(date);
    return db.entries[customerId]?.[key] ?? [];
  }, []);

  const upsertDayEntry = useCallback((customerId: string, entry: DayEntry) => {
    const db = readDB();
    const d = new Date(entry.date);
    const key = ym(d);
    db.entries[customerId] ||= {};
    db.entries[customerId][key] ||= [];
    const list = db.entries[customerId][key];
    const idx = list.findIndex(e => e.date === entry.date);
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    // sort by date
    list.sort((a, b) => a.date.localeCompare(b.date));
    writeDB(db);
  }, []);

  const removeOtherItem = useCallback((customerId: string, dateStr: string, itemId: string) => {
    const db = readDB();
    const d = new Date(dateStr);
    const key = ym(d);
    const list = db.entries[customerId]?.[key];
    if (!list) return;
    const idx = list.findIndex(e => e.date === dateStr);
    if (idx < 0) return;
    const e = list[idx];
    e.otherItems = (e.otherItems || []).filter(i => i.id !== itemId);
    writeDB(db);
  }, []);

  const computeTotals = useCallback((customer: Customer, date: Date): MonthTotals => {
    const entries = getMonthEntries(customer.id, date);
    const totalMilkLiters = entries.reduce((sum, e) => sum + (e.amQty || 0) + (e.pmQty || 0), 0);
    const otherAmount = entries.reduce(
      (sum, e) => sum + (e.otherItems || []).reduce((s, i) => s + (i.price || 0), 0),
      0
    );
    const milkAmount = totalMilkLiters * (customer.milkPrice || 0);
    return {
      totalMilkLiters: +totalMilkLiters.toFixed(2),
      milkAmount: +milkAmount.toFixed(2),
      otherAmount: +otherAmount.toFixed(2),
      grandTotal: +(milkAmount + otherAmount).toFixed(2),
    };
  }, [getMonthEntries]);

  const getPaymentStatus = useCallback((customerId: string, date: Date): PaymentStatus => {
    const db = readDB();
    const key = ym(date);
    const defaultVal: PaymentStatus = { yearMonth: key, paid: false };
    return db.payments[customerId]?.[key] || defaultVal;
  }, []);

  const setPaymentStatus = useCallback(
    (customerId: string, date: Date, status: Partial<PaymentStatus>) => {
      const db = readDB();
      const key = ym(date);
      db.payments[customerId] ||= {};
      const prev = db.payments[customerId][key] || { yearMonth: key, paid: false };
      db.payments[customerId][key] = { ...prev, ...status, yearMonth: key };
      writeDB(db);
    },
    []
  );

  const buildWhatsAppMessage = useCallback(
    (customer: Customer, date: Date) => {
      const { totalMilkLiters, milkAmount, otherAmount, grandTotal } = computeTotals(customer, date);
      const yearMonth = ym(date);
      const header = `Monthly Bill - ${yearMonth}`;
      const lines = [
        header,
        `Name: ${customer.name}`,
        `Phone: ${customer.phone}`,
        `Milk price: ₹${customer.milkPrice}/L`,
        `Total milk: ${totalMilkLiters} L = ₹${milkAmount}`,
        `Other items: ₹${otherAmount}`,
        `Grand total: ₹${grandTotal}`,
        `\nPlease pay your dues. Thank you!`,
      ];
      const text = encodeURIComponent(lines.join("\n"));
      return `https://wa.me/${customer.phone}?text=${text}`;
    },
    [computeTotals]
  );

  return {
    // customers
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerByPhone,

    // entries
    getMonthEntries,
    upsertDayEntry,
    removeOtherItem,
    computeTotals,

    // payments
    getPaymentStatus,
    setPaymentStatus,

    // messaging
    buildWhatsAppMessage,

    // helpers
    ym,
    ymd,
    uid,
  };
};
