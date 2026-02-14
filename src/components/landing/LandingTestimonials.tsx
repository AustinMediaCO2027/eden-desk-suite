const testimonials = [
  {
    quote: "Eden Desk completely replaced our clunky invoicing tool. Everything is now in one place and our clients love the professional documents.",
    name: "Sarah M.",
    role: "Freelance Designer",
  },
  {
    quote: "The AI drafting feature alone saves me hours every week. I can generate letterheads and proposals in seconds.",
    name: "James K.",
    role: "Agency Owner",
  },
  {
    quote: "Simple, clean, and powerful. We switched our entire team to Eden Desk and haven't looked back since.",
    name: "Linda T.",
    role: "Operations Manager",
  },
];

export const LandingTestimonials = () => {
  return (
    <section className="py-28 md:py-36 border-t border-border/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">Testimonials</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold">
            Loved by businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border/40 bg-card/20 p-8 flex flex-col"
            >
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-8">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
