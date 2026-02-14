const testimonials = [
  {
    quote: "Eden Desk completely replaced our clunky invoicing tool. Everything is now in one place and our clients love the professional documents.",
    name: "Sarah M.",
    role: "Freelance Designer",
    initials: "SM",
  },
  {
    quote: "The AI drafting feature alone saves me hours every week. I can generate letterheads and proposals in seconds.",
    name: "James K.",
    role: "Agency Owner",
    initials: "JK",
  },
  {
    quote: "Simple, clean, and powerful. We switched our entire team to Eden Desk and haven't looked back since.",
    name: "Linda T.",
    role: "Operations Manager",
    initials: "LT",
  },
  {
    quote: "The best invoicing platform I've used in 10 years of freelancing. The PDF exports look incredibly professional.",
    name: "David R.",
    role: "Consultant",
    initials: "DR",
  },
  {
    quote: "We manage 50+ clients and Eden Desk handles it all flawlessly. Task management keeps our team on track every day.",
    name: "Priya N.",
    role: "Project Manager",
    initials: "PN",
  },
  {
    quote: "From quote to invoice to payment — the entire workflow is seamless. Our revenue collection improved by 40%.",
    name: "Michael B.",
    role: "Small Business Owner",
    initials: "MB",
  },
];

export const LandingTestimonials = () => {
  return (
    <section className="py-28 md:py-40 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] mb-5 font-medium">Testimonials</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">
            Loved by businesses
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Join thousands of professionals who trust Eden Desk daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border/40 bg-gradient-to-b from-card/30 to-transparent p-9 flex flex-col transition-all duration-300 hover:from-card/50 hover:border-border/60 hover:-translate-y-1"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-4 h-4 text-foreground/60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-8">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-xs font-bold text-foreground/70">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
