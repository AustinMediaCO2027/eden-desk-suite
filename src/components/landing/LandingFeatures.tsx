import { FileText, Receipt, Mail, CalendarDays, Bot, Download } from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Invoices",
    description: "Create professional invoices with your logo, line items, tax calculations, and auto totals.",
  },
  {
    icon: FileText,
    title: "Quotes",
    description: "Generate and send quotes to clients. Track status from pending to accepted.",
  },
  {
    icon: Mail,
    title: "Letterheads",
    description: "Design branded letterheads with company details, logo, and editable content.",
  },
  {
    icon: CalendarDays,
    title: "Task Manager",
    description: "Calendar-style task management. Set dates, mark complete, and stay organized.",
  },
  {
    icon: Bot,
    title: "AI Drafting",
    description: "Let AI help you draft professional letterheads and documents instantly.",
  },
  {
    icon: Download,
    title: "PDF & Email",
    description: "Download documents as PDF or send directly via email without leaving the platform.",
  },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        {/* Stats bar */}
        <div className="mb-20 rounded-2xl border border-border bg-gradient-to-r from-card via-violet-500/5 to-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Active Users</p>
              <p className="text-4xl md:text-5xl font-bold text-violet-400">+2M</p>
              <p className="text-xs text-muted-foreground mt-1">Across 120+ countries</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Insights Delivered</p>
              <p className="text-4xl md:text-5xl font-bold text-foreground">Real-time</p>
              <p className="text-xs text-muted-foreground mt-1">Total Transaction Volume</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">System Reliability</p>
              <p className="text-4xl md:text-5xl font-bold text-violet-400">99%</p>
              <p className="text-xs text-muted-foreground mt-1">Uptime you can rely on</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            One platform for all your business documents and daily operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm p-8 eden-card-hover"
            >
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-5 group-hover:bg-violet-500/20 transition-colors">
                <Icon className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
