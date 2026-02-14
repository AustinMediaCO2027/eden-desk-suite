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
    <section id="how-it-works" className="py-28 md:py-36 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">How It Works</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold">
            Three simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map(({ num, icon: Icon, title, description }, i) => (
            <div key={num} className="relative group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-border/50 to-transparent" />
              )}
              
              <div className="rounded-2xl border border-border/40 bg-card/20 p-8 transition-all duration-300 hover:bg-card/40 hover:border-border hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-extrabold text-muted-foreground/30">{num}</span>
                  <div className="h-10 w-10 rounded-xl border border-border/50 bg-card/50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
