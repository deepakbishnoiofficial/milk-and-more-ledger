import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { useLedgerStore, DayEntry, OtherItem } from "@/hooks/useLedgerStore";
import SEO from "@/components/SEO";

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);

const CustomerLedger = () => {
  const params = useParams();
  const location = useLocation();
  const role = location.pathname.startsWith("/seller") ? "seller" : "customer";
  const id = params.id!;

  const {
    getCustomer,
    updateCustomer,
    getMonthEntries,
    upsertDayEntry,
    computeTotals,
    getPaymentStatus,
    setPaymentStatus,
    buildWhatsAppMessage,
    ymd,
    uid,
  } = useLedgerStore();

  const customer = getCustomer(id);
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [selected, setSelected] = useState<Date>(new Date());
  const [version, setVersion] = useState(0);

  // Local editable state for the selected day
  const [day, setDay] = useState<DayEntry>(() => ({ date: ymd(new Date()), amQty: 0, pmQty: 0, otherItems: [] }));

  const entries = useMemo(() => getMonthEntries(id, month), [id, month, getMonthEntries, version]);

  useEffect(() => {
    // Load entry for selected day
    const key = ymd(selected);
    const existing = entries.find((e) => e.date === key) || { date: key, amQty: 0, pmQty: 0, otherItems: [] };
    setDay(existing);
  }, [selected, entries, ymd]);

  if (!customer) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">Customer not found.</p>
        <Link to={role === "seller" ? "/seller" : "/customer"} className="underline">Go back</Link>
      </div>
    );
  }

  const totals = computeTotals(customer, month);
  const pay = getPaymentStatus(id, month);

  const saveEntry = () => {
    upsertDayEntry(id, day);
    setVersion((v) => v + 1);
  };

  const addOtherItem = () => {
    setDay((d) => ({ ...d, otherItems: [...(d.otherItems || []), { id: uid(), name: "", price: 0 }] }));
  };

  const openWhatsApp = () => {
    const url = buildWhatsAppMessage(customer, month);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${customer.name} – Monthly Ledger`}
        description={`Edit milk entries, items and view totals for ${customer.name}.`}
        canonicalPath={role === "seller" ? `/seller/customer/${id}` : `/customer/${id}`}
      />

      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold">Milk & More Ledger</Link>
          <nav className="text-sm">
            <Link to={role === "seller" ? "/seller" : "/customer"} className="hover:underline">Back</Link>
          </nav>
        </div>
      </header>

      <main className="container py-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setMonth((m) => addMonths(m, -1))}>Prev</Button>
              <div className="font-medium">{month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <Button variant="outline" onClick={() => setMonth((m) => addMonths(m, +1))}>Next</Button>
            </div>
            <Calendar mode="single" selected={selected} onSelect={(d) => d && setSelected(d)} month={month} onMonthChange={setMonth} />
            {role === "seller" && (
              <div className="grid gap-2">
                <Label>Milk Price (₹/L)</Label>
                <Input
                  className="w-28"
                  type="number"
                  defaultValue={customer.milkPrice}
                  onBlur={(e) => { updateCustomer(customer.id, { milkPrice: parseFloat(e.target.value || "0") }); setVersion(v=>v+1); }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Entry – {day.date}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>AM Milk (L)</Label>
                <Input type="number" value={day.amQty || 0} onChange={(e) => setDay({ ...day, amQty: parseFloat(e.target.value || "0") })} />
              </div>
              <div className="grid gap-2">
                <Label>PM Milk (L)</Label>
                <Input type="number" value={day.pmQty || 0} onChange={(e) => setDay({ ...day, pmQty: parseFloat(e.target.value || "0") })} />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Other Items</div>
                <Button variant="outline" onClick={addOtherItem}>Add Item</Button>
              </div>
              <div className="grid gap-2">
                {(day.otherItems || []).map((it) => (
                  <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <Input
                        placeholder="Item name"
                        value={it.name}
                        onChange={(e) => {
                          const updated = (day.otherItems || []).map((x) => x.id === it.id ? { ...x, name: e.target.value } : x);
                          setDay({ ...day, otherItems: updated });
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={it.price}
                        onChange={(e) => {
                          const updated = (day.otherItems || []).map((x) => x.id === it.id ? { ...x, price: parseFloat(e.target.value || "0") } : x);
                          setDay({ ...day, otherItems: updated });
                        }}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button variant="destructive" size="sm" onClick={() => {
                        const updated = (day.otherItems || []).filter((x) => x.id !== it.id);
                        setDay({ ...day, otherItems: updated });
                      }}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Note</Label>
              <Input placeholder="e.g., On leave" value={day.note || ""} onChange={(e) => setDay({ ...day, note: e.target.value })} />
            </div>

            <div className="flex gap-3">
              <Button onClick={saveEntry}>Save Day</Button>
              <Button variant="outline" onClick={() => { setDay({ ...day, amQty: 0, pmQty: 0, otherItems: [], note: "null" }); upsertDayEntry(customer.id, { ...day, amQty: 0, pmQty: 0, otherItems: [], note: "null" }); setVersion(v=>v+1); }}>Mark None</Button>
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Monthly Summary</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Stat label="Milk (L)" value={totals.totalMilkLiters.toString()} />
                <Stat label="Milk (₹)" value={totals.milkAmount.toString()} />
                <Stat label="Other (₹)" value={totals.otherAmount.toString()} />
                <Stat label="Total (₹)" value={totals.grandTotal.toString()} />
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                <Button onClick={openWhatsApp}>Send WhatsApp Bill</Button>
                {!pay.paid ? (
                  <>
                    <Button variant="outline" onClick={() => { setPaymentStatus(customer.id, month, { paid: true, method: "cash" }); setVersion(v=>v+1); }}>Mark Paid (Cash)</Button>
                    <Button variant="outline" onClick={() => { const ref = prompt("Enter online Txn / Ref No.") || ""; setPaymentStatus(customer.id, month, { paid: true, method: "online", reference: ref }); setVersion(v=>v+1); }}>Mark Paid (Online)</Button>
                  </>
                ) : (
                  <Button variant="destructive" onClick={() => { setPaymentStatus(customer.id, month, { paid: false, method: undefined, reference: undefined }); setVersion(v=>v+1); }}>Mark Unpaid</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

export default CustomerLedger;
