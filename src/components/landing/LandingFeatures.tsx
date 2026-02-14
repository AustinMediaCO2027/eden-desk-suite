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
    <section id="features" className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        {/* Stats bar */}
        <div className="mb-24 rounded-2xl border border-border/50 bg-card/30 p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">Active Users</p>
              <p className="text-5xl md:text-6xl font-extrabold text-foreground">+2M</p>
              <p className="text-xs text-muted-foreground mt-2">Across 120+ countries</p>
            </div>
            <div className="border-x-0 md:border-x border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">Documents Created</p>
              <p className="text-5xl md:text-6xl font-extrabold text-foreground">Real-time</p>
              <p className="text-xs text-muted-foreground mt-2">Instant generation & delivery</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">System Reliability</p>
              <p className="text-5xl md:text-6xl font-extrabold text-foreground">99%</p>
              <p className="text-xs text-muted-foreground mt-2">Uptime you can rely on</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Everything Your Business Needs
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One platform for all your business documents and daily operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/50 bg-card/20 p-8 transition-all duration-300 hover:bg-card/40 hover:border-border hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl border border-border/50 bg-card/50 flex items-center justify-center mb-6 group-hover:border-foreground/20 transition-colors">
                <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
