import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Check, ArrowLeft, Link2, BarChart3, DollarSign, Users, Zap, Globe } from "lucide-react";
import edenDarkLogo from "@/assets/eden_dark_logo.png";
import { z } from "zod";

const safeUrlSchema = (domain: string) =>
  z.string().max(500)
    .refine(val => !val || val.startsWith("https://"), "Must use HTTPS")
    .refine(val => !val || new URL(val).hostname.includes(domain), `Must be a valid ${domain} URL`)
    .optional()
    .or(z.literal(""));

const schema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  country: z.string().trim().min(1, "Country is required").max(100),
  website: z.string().max(500).refine(val => !val || val.startsWith("https://"), "Must use HTTPS").optional().or(z.literal("")),
  promotion_method: z.string().max(500).optional(),
  audience_type: z.string().max(500).optional(),
  instagram_url: safeUrlSchema("instagram.com"),
  youtube_url: z.string().max(500).refine(val => !val || val.startsWith("https://"), "Must use HTTPS").refine(val => !val || val.includes("youtube.com") || val.includes("youtu.be"), "Must be a YouTube URL").optional().or(z.literal("")),
  tiktok_url: safeUrlSchema("tiktok.com"),
  linkedin_url: safeUrlSchema("linkedin.com"),
  audience_size: z.string().max(100).optional(),
});

const commissionTiers = [
  { plan: "Standard", amount: "25%", desc: "per subscriber/month" },
  { plan: "Silver", amount: "25%", desc: "per subscriber/month" },
  { plan: "Premium", amount: "25%", desc: "per subscriber/month" },
];

const howItWorks = [
  { icon: Link2, title: "Get Your Link", desc: "Apply and receive your unique affiliate referral link" },
  { icon: Users, title: "Share & Refer", desc: "Promote Eden Desk to your audience via your channels" },
  { icon: DollarSign, title: "Earn Monthly", desc: "Earn recurring commissions for the first 3 months per subscriber" },
];

const AffiliatePage = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", country: "", website: "",
    promotion_method: "", audience_type: "",
    instagram_url: "", youtube_url: "", tiktok_url: "", linkedin_url: "", audience_size: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast({ title: "Validation error", description: result.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("affiliates").insert({
      ...result.data, status: "pending",
    } as any);
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

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-card/30 text-xs font-medium text-muted-foreground mb-6">
            <Globe className="h-3.5 w-3.5" /> Partner Program
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Earn Recurring Income with Eden Desk
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Refer businesses and earn monthly commissions for the first 3 months of each subscriber's journey.
          </p>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <h2 className="text-lg font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="rounded-xl border border-border/40 bg-card/20 p-6 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="h-10 w-10 rounded-lg bg-foreground/10 flex items-center justify-center mx-auto mb-3 mt-2">
                  <step.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="mb-16">
          <h2 className="text-lg font-bold text-center mb-2">Commission Structure</h2>
          <p className="text-xs text-muted-foreground text-center mb-8">Earn for the first 3 billing cycles per referred subscriber</p>
          <div className="grid grid-cols-3 gap-4">
            {commissionTiers.map(t => (
              <div key={t.plan} className="rounded-xl border border-border/40 bg-card/30 p-5 text-center">
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.plan}</p>
                <p className="text-2xl font-extrabold">{t.amount}</p>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust section */}
        <div className="mb-16 rounded-xl border border-border/40 bg-card/10 p-8 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Instant Tracking", desc: "Real-time click & signup analytics" },
              { icon: BarChart3, label: "Transparent Dashboard", desc: "See all your earnings live" },
              { icon: DollarSign, label: "Reliable Payouts", desc: "Monthly payouts via PayPal or EFT" },
              { icon: Users, label: "Dedicated Support", desc: "Priority affiliate assistance" },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-lg bg-foreground/10 flex items-center justify-center mb-2">
                  <item.icon className="h-4 w-4 text-foreground/60" />
                </div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
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
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border/40 bg-card/20 p-8">
            <h2 className="text-lg font-bold mb-4">Apply Now</h2>

            {/* Basic Info */}
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
                <Label className="text-xs">Website</Label>
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

            {/* Social Media */}
            <div className="pt-2">
              <h3 className="text-sm font-semibold mb-3">Social Media Profiles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Instagram URL</Label>
                  <Input value={form.instagram_url} onChange={e => update("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <Label className="text-xs">YouTube Channel</Label>
                  <Input value={form.youtube_url} onChange={e => update("youtube_url", e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <Label className="text-xs">TikTok Profile</Label>
                  <Input value={form.tiktok_url} onChange={e => update("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@..." />
                </div>
                <div>
                  <Label className="text-xs">LinkedIn Profile</Label>
                  <Input value={form.linkedin_url} onChange={e => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <Label className="text-xs">Audience Size</Label>
                  <Input value={form.audience_size} onChange={e => update("audience_size", e.target.value)} placeholder="e.g. 10k followers" />
                </div>
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
