import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLedgerStore } from "@/hooks/useLedgerStore";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  const { getCustomers, createCustomer, updateCustomer, deleteCustomer } = useLedgerStore();
  const [customers, setCustomers] = useState(() => getCustomers());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [milkPrice, setMilkPrice] = useState(40);
  const { toast } = useToast();

  const refresh = () => setCustomers(getCustomers());

  useEffect(() => {
    refresh();
  }, []);

  const add = () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: "Missing info", description: "Enter name and phone." });
      return;
    }
    const id = createCustomer({ name: name.trim(), phone: phone.trim(), milkPrice });
    setName("");
    setPhone("");
    toast({ title: "Customer added", description: `#${id}` });
    refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Seller Panel – Milk & Grocery Ledger"
        description="Manage customers, calendars, pricing, and monthly bills."
        canonicalPath="/seller"
      />
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold">Milk & More Ledger</Link>
          <nav className="text-sm">
            <Link to="/customer" className="hover:underline">Customer Panel</Link>
          </nav>
        </div>
      </header>

      <main className="container py-10">
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Add Customer</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Rohan Kumar" />
              </div>
              <div className="grid gap-2">
                <Label>Phone (WhatsApp)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., 919876543210" />
              </div>
              <div className="grid gap-2">
                <Label>Milk Price (₹/L)</Label>
                <Input type="number" value={milkPrice} onChange={(e) => setMilkPrice(parseFloat(e.target.value || "0"))} />
              </div>
              <Button onClick={add}>Add</Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Price (₹/L)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.phone}</TableCell>
                      <TableCell>
                        <Input
                          className="w-24"
                          type="number"
                          defaultValue={c.milkPrice}
                          onBlur={(e) => {
                            updateCustomer(c.id, { milkPrice: parseFloat(e.target.value || "0") });
                            refresh();
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/seller/customer/${c.id}`}>
                            <Button size="sm">Open Ledger</Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => { deleteCustomer(c.id); refresh(); }}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default SellerDashboard;
