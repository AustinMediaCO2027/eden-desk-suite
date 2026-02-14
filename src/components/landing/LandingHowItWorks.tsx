import { Building2, Palette, Send } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Building2,
    title: "Set Up Your Company",
    description: "Add your company name, logo, address, and banking details. Your brand identity is stored securely for all future documents.",
  },
  {
    num: "02",
    icon: Palette,
    title: "Customize Your Brand",
    description: "Choose from multiple professional templates for invoices, quotes, and letterheads. Match your brand colors and style.",
  },
  {
    num: "03",
    icon: Send,
    title: "Create & Send",
    description: "Generate documents in seconds, download as PDF, or email directly to clients — all without leaving the platform.",
  },
];

export const LandingHowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28 md:py-40 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-5 font-medium">How It Works</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Three simple steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get started in under 5 minutes. No complex setup, no learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map(({ num, icon: Icon, title, description }, i) => (
            <div key={num} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-border/40 to-transparent" />
              )}
              
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-card/30 to-transparent p-9 transition-all duration-300 hover:from-card/60 hover:border-border/70 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-5 mb-7">
                  <span className="text-4xl font-extrabold text-foreground/10">{num}</span>
                  <div className="h-12 w-12 rounded-2xl border border-border/40 bg-card/40 flex items-center justify-center group-hover:border-foreground/15 group-hover:bg-card/60 transition-all duration-300">
                    <Icon className="h-5 w-5 text-foreground/80" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
