import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import edenDarkLogo from "@/assets/eden_dark_logo.png";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  country: z.string().trim().min(1, "Country is required").max(100),
  website: z.string().max(500).optional(),
  promotion_method: z.string().max(500).optional(),
  audience_type: z.string().max(500).optional(),
});

const commissionTiers = [
  { plan: "Standard", amount: "R10", desc: "per subscriber/month" },
  { plan: "Silver", amount: "R20", desc: "per subscriber/month" },
  { plan: "Premium", amount: "R30", desc: "per subscriber/month" },
];

const AffiliatePage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", country: "", website: "",
    promotion_method: "", audience_type: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast({ title: "Validation error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("affiliates" as any).insert({
      ...result.data, status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={edenDarkLogo} alt="Eden Desk" className="h-7" />
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Button>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Earn Recurring Income with Eden Desk
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Refer businesses and earn monthly commissions for as long as they stay subscribed.
          </p>
        </div>

        {/* Commission Tiers */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {commissionTiers.map(t => (
            <div key={t.plan} className="rounded-xl border border-border/40 bg-card/30 p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.plan}</p>
              <p className="text-2xl font-extrabold">{t.amount}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="text-center py-16">
            <div className="h-14 w-14 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-7 w-7 text-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-sm text-muted-foreground">
              We'll review your application and get back to you via email. Thank you!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/40 bg-card/20 p-8">
            <h2 className="text-lg font-bold mb-4">Apply Now</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input value={form.full_name} onChange={e => update("full_name", e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Country *</Label>
                <Input value={form.country} onChange={e => update("country", e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Website / Social Media</Label>
                <Input value={form.website} onChange={e => update("website", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Promotion Method</Label>
                <Input value={form.promotion_method} onChange={e => update("promotion_method", e.target.value)} placeholder="Blog, YouTube, Social..." />
              </div>
              <div>
                <Label className="text-xs">Audience Type</Label>
                <Input value={form.audience_type} onChange={e => update("audience_type", e.target.value)} placeholder="Small businesses, freelancers..." />
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Submitting..." : "Apply Now"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AffiliatePage;
