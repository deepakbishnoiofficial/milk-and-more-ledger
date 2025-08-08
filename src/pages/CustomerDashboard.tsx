import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLedgerStore } from "@/hooks/useLedgerStore";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";

const CustomerDashboard = () => {
  const { findCustomerByPhone } = useLedgerStore();
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const open = () => {
    const c = findCustomerByPhone(phone.trim());
    if (!c) {
      toast({ title: "Not found", description: "No customer with that phone." });
      return;
    }
    navigate(`/customer/${c.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Customer Panel – Milk & Grocery Ledger"
        description="View and edit your daily milk and items, and see monthly dues."
        canonicalPath="/customer"
      />
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="font-semibold">Milk & More Ledger</Link>
          <nav className="text-sm">
            <Link to="/seller" className="hover:underline">Seller Panel</Link>
          </nav>
        </div>
      </header>

      <main className="container py-10">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Find your ledger</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your WhatsApp number (e.g., 9198…)" />
            <Button onClick={open}>Open</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomerDashboard;
