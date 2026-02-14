const logos = [
  { name: "Airbnb", svg: (
    <svg viewBox="0 0 2500 780" className="h-7 w-auto" fill="currentColor">
      <path d="M1248.7 410.4c0-37.8-30.7-68.5-68.5-68.5s-68.5 30.7-68.5 68.5 30.7 68.5 68.5 68.5 68.5-30.7 68.5-68.5zm-185.3 0c0-64.3 52.4-116.7 116.7-116.7s116.7 52.4 116.7 116.7-52.4 116.7-116.7 116.7-116.7-52.4-116.7-116.7zm698.2-116.7c-64.3 0-116.7 52.4-116.7 116.7s52.4 116.7 116.7 116.7 116.7-52.4 116.7-116.7-52.4-116.7-116.7-116.7zm0 185.3c-37.8 0-68.5-30.7-68.5-68.5s30.7-68.5 68.5-68.5 68.5 30.7 68.5 68.5-30.7 68.5-68.5 68.5zm-441.5-185.3c-64.3 0-116.7 52.4-116.7 116.7v116.7h48.2V410.4c0-37.8 30.7-68.5 68.5-68.5s68.5 30.7 68.5 68.5v116.7h48.2V410.4c0-64.3-52.4-116.7-116.7-116.7zm-480.3 0c-64.3 0-116.7 52.4-116.7 116.7s52.4 116.7 116.7 116.7c32.6 0 62-13.4 83.2-35l-34-34c-12.8 13.1-30.6 20.8-49.2 20.8-37.8 0-68.5-30.7-68.5-68.5s30.7-68.5 68.5-68.5c18.6 0 36.4 7.7 49.2 20.8l34-34c-21.2-21.6-50.6-35-83.2-35zm1107.2 0c-64.3 0-116.7 52.4-116.7 116.7s52.4 116.7 116.7 116.7 116.7-52.4 116.7-116.7-52.4-116.7-116.7-116.7zm0 185.3c-37.8 0-68.5-30.7-68.5-68.5s30.7-68.5 68.5-68.5 68.5 30.7 68.5 68.5-30.7 68.5-68.5 68.5zm253.3-300.5h-48.2v348.6h48.2V178.5zm48.1 0h-48.2v348.6h48.2V178.5zM624.8 293.7c-64.3 0-116.7 52.4-116.7 116.7s52.4 116.7 116.7 116.7c32.6 0 62-13.4 83.2-35l-34-34c-12.8 13.1-30.6 20.8-49.2 20.8-37.8 0-68.5-30.7-68.5-68.5s30.7-68.5 68.5-68.5c18.6 0 36.4 7.7 49.2 20.8l34-34c-21.2-21.6-50.6-35-83.2-35zm-326.3 0c-64.3 0-116.7 52.4-116.7 116.7v233.4h48.2V506.1c21 13.6 45.8 21 68.5 21 64.3 0 116.7-52.4 116.7-116.7s-52.4-116.7-116.7-116.7zm0 185.3c-37.8 0-68.5-30.7-68.5-68.5s30.7-68.5 68.5-68.5 68.5 30.7 68.5 68.5-30.7 68.5-68.5 68.5z"/>
    </svg>
  )},
  { name: "Booking.com", text: "Booking.com" },
  { name: "PepsiCo", text: "PEPSICO" },
  { name: "Woolworths", text: "WOOLWORTHS" },
];

export const LogoMarquee = () => {
  return (
    <section className="py-16 overflow-hidden border-y border-border">
      <div className="container mx-auto px-6 mb-8">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
          Trusted by teams worldwide
        </p>
      </div>
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <div className="flex animate-marquee">
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex shrink-0 items-center gap-16 px-8">
              {logos.map((logo) => (
                <div key={`${setIndex}-${logo.name}`} className="flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity shrink-0">
                  {logo.svg ? (
                    logo.svg
                  ) : (
                    <span className="text-xl md:text-2xl font-bold tracking-wider whitespace-nowrap">
                      {logo.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
