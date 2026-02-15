import { Receipt, FileText, CalendarDays, Bot, Mail, Shield, Zap, Globe } from "lucide-react";
import featureIconX from "@/assets/feature-icon-x.jpeg";
import abstractBg from "@/assets/abstract-bg.jpg";

const features = [
  {
    icon: Receipt,
    title: "Professional Invoices & Quotes",
    description: "Create polished invoices and quotes with your branding, line items, tax calculations, and auto totals. Send directly via email.",
  },
  {
    icon: FileText,
    title: "Create Letterhead",
    description: "Create and send letterhead with your company logo, details, and rich editable content. Multiple professional templates included.",
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
  {
    icon: Mail,
    title: "Email Integration",
    description: "Send invoices, quotes, and documents directly from the platform. No need to download, attach, or leave Eden Desk.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your data is encrypted and stored securely. Enterprise-grade security with 99.9% uptime guarantee.",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    description: "Download beautifully formatted PDFs in one click. Perfect for printing or sharing with clients.",
  },
  {
    icon: Globe,
    title: "Multi-Currency Support",
    description: "Work with clients globally. Support for ZAR, USD, EUR, GBP and more currencies out of the box.",
  },
];

export const LandingFeatures = () => {
  return (
    <section id="features" className="relative py-20 md:py-32 overflow-hidden">
      {/* Abstract background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={abstractBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Stats bar */}
        <div className="mb-20 md:mb-28 rounded-3xl border border-border/40 bg-gradient-to-b from-card/40 to-card/10 p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-3 font-medium">Active Users</p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-none">+2M</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">Across 120+ countries</p>
            </div>
            <div className="md:border-x border-border/20 md:px-8">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-3 font-medium">Documents Created</p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-none">Real-time</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">Instant generation & delivery</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-3 font-medium">System Reliability</p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-none">99%</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">Uptime you can rely on</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-14 md:mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-5 font-medium">Features</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5">
            Everything Your Business Needs
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            One platform for all your business documents and daily operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map(({ title, description }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/40 bg-gradient-to-b from-card/30 to-transparent p-7 md:p-8 transition-all duration-300 hover:from-card/60 hover:border-border/70 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.06)]"
            >
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl overflow-hidden mb-6 md:mb-7">
                <img src={featureIconX} alt="" className="h-full w-full object-cover" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
