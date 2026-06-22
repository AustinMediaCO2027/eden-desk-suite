import { Building2, Palette, Send } from "lucide-react";
import abstractBg from "@/assets/abstract-bg.jpg";

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
    <section id="how-it-works" className="relative py-28 md:py-40 overflow-hidden">
      {/* Abstract background */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={abstractBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-[10px] text-brand uppercase tracking-[0.25em] mb-5 font-semibold">How It Works</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Three simple steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get started in under 5 minutes. No complex setup, no learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map(({ num, icon: Icon, title, description }, i) => (
            <div key={num} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-brand/30 to-transparent" />
              )}
              
              <div className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-sm p-8 md:p-9 transition-all duration-300 hover:bg-background/80 hover:border-brand/40 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_hsl(var(--brand)/0.15)]">
                <div className="flex items-center gap-5 mb-7">
                  <span className="text-4xl font-extrabold text-foreground/10">{num}</span>
                  <div className="h-12 w-12 rounded-2xl border border-brand/30 bg-brand/5 flex items-center justify-center group-hover:border-brand/50 group-hover:bg-brand/10 transition-all duration-300">
                    <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
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
