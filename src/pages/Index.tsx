import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, MessageCircle, Milk, Receipt, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleCTA = (role: "seller" | "customer") => {
    toast({
      title: `Welcome, ${role === "seller" ? "Seller" : "Customer"}!`,
      description:
        "Dashboards are coming next. For now, explore features below and confirm if you'd like me to build the panels.",
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Milk & Grocery Ledger",
    applicationCategory: "BusinessApplication",
    description:
      "Daily milk and grocery tracking with customer-wise pricing, monthly bills, and WhatsApp sharing.",
    operatingSystem: "Web",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Milk & Grocery Ledger – Simple Daily Tracking"
        description="Track daily milk and items, custom prices per customer, monthly bills, and WhatsApp sharing. Clean seller and customer panels."
        structuredData={structuredData}
      />

      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <a href="#" className="font-semibold">
            Milk & More Ledger
          </a>
          <nav className="flex items-center gap-2">
            <a href="#features" className="text-sm hover:underline">
              Features
            </a>
            <a href="#how-it-works" className="text-sm hover:underline">
              How it works
            </a>
            <a href="#get-started" className="text-sm hover:underline">
              Get started
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background">
          <div className="container grid gap-6 py-16 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Milk & Grocery Ledger for Sellers and Customers
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Record daily morning/evening milk, other items, custom price per
                customer, and send monthly bills on WhatsApp—fast and simple.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => handleCTA("seller")}>I'm a Seller</Button>
                <Button variant="outline" onClick={() => handleCTA("customer")}>
                  I'm a Customer
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Milk className="h-5 w-5" /> Track Milk (AM/PM)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Quick entry for morning and evening quantities with per-day notes.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Customer List
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Save name and contact; open calendar per customer to record daily items.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Monthly Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Edit any day—milk, other items, mark null if nothing taken.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" /> Custom Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Set milk price per customer (30, 35, 40, 45, 50, etc.). Auto totals.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> WhatsApp Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Create bill with milk + other items and send on WhatsApp in one click.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Payment & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Track paid/unpaid. Auto reminders until paid; verify cash or online.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-b bg-card/50">
          <div className="container py-16 md:py-20">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-xl font-semibold">1. Add customers</h3>
                <p className="mt-2 text-muted-foreground">
                  Enter name, phone, and price per liter. Open their calendar.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">2. Record daily</h3>
                <p className="mt-2 text-muted-foreground">
                  AM/PM milk, other items, or mark none. Customer can also edit.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">3. Send bill</h3>
                <p className="mt-2 text-muted-foreground">
                  Auto total at month end and share the bill via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section id="get-started" className="container py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>For Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage customers, calendars, pricing, bills, and reminders.
                </p>
                <Button onClick={() => handleCTA("seller")}>Open Seller Panel</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and edit your daily entries, see totals and monthly dues.
                </p>
                <Button variant="outline" onClick={() => handleCTA("customer")}>
                  Open Customer Panel
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Milk & More Ledger
        </div>
      </footer>
    </div>
  );
};

export default Index;
