import { Receipt, FileText, CalendarDays, Bot } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Professional Invoices & Quotes",
    description: "Create polished invoices and quotes with your branding, line items, tax calculations, and auto totals. Send directly via email.",
  },
  {
    icon: FileText,
    title: "Letterhead Designer",
    description: "Design branded letterheads with your company logo, details, and rich editable content. Multiple professional templates included.",
  },
  {
    icon: CalendarDays,
    title: "Task Management",
    description: "Calendar-style task management. Set dates, assign priorities, mark complete, and keep your team organized effortlessly.",
  },
  {
    icon: Bot,
    title: "AI Document Drafting",
    description: "Let AI help you draft professional documents instantly. Generate letterheads, content, and more with a single prompt.",
  },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-28 md:py-40">
      <div className="container mx-auto px-6">
        {/* Stats bar */}
        <div className="mb-28 rounded-3xl border border-border/40 bg-gradient-to-b from-card/40 to-card/10 p-12 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-4 font-medium">Active Users</p>
              <p className="text-6xl md:text-7xl font-extrabold text-foreground leading-none">+2M</p>
              <p className="text-sm text-muted-foreground mt-3">Across 120+ countries</p>
            </div>
            <div className="md:border-x border-border/20 md:px-8">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-4 font-medium">Documents Created</p>
              <p className="text-6xl md:text-7xl font-extrabold text-foreground leading-none">Real-time</p>
              <p className="text-sm text-muted-foreground mt-3">Instant generation & delivery</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-4 font-medium">System Reliability</p>
              <p className="text-6xl md:text-7xl font-extrabold text-foreground leading-none">99%</p>
              <p className="text-sm text-muted-foreground mt-3">Uptime you can rely on</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-5 font-medium">Features</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Everything Your Business Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One platform for all your business documents and daily operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/40 bg-gradient-to-b from-card/30 to-transparent p-8 transition-all duration-300 hover:from-card/60 hover:border-border/70 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.04)]"
            >
              <div className="h-14 w-14 rounded-2xl border border-border/40 bg-card/40 flex items-center justify-center mb-7 group-hover:border-foreground/15 group-hover:bg-card/60 transition-all duration-300">
                <Icon className="h-6 w-6 text-foreground/80 group-hover:text-foreground transition-colors" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-bold mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
