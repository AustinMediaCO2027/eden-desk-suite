import lovableLogo from "@/assets/logos/lovable.png";
import canvaLogo from "@/assets/logos/canva.webp";
import pepsicoLogo from "@/assets/logos/pepsico.png";
import bookingLogo from "@/assets/logos/booking.webp";
import airbnbLogo from "@/assets/logos/airbnb.png";
import fiverrLogo from "@/assets/logos/fiverr.png";
import upworkLogo from "@/assets/logos/upwork.png";

const logos = [
  { name: "Lovable", src: lovableLogo, className: "h-8" },
  { name: "Canva", src: canvaLogo, className: "h-8" },
  { name: "PepsiCo", src: pepsicoLogo, className: "h-14" },
  { name: "Booking.com", src: bookingLogo, className: "h-8" },
  { name: "Airbnb", src: airbnbLogo, className: "h-8" },
  { name: "Fiverr", src: fiverrLogo, className: "h-8" },
  { name: "Upwork", src: upworkLogo, className: "h-8" },
];

export const LogoMarquee = () => {
  return (
    <section className="py-16 border-t border-border/30">
      <div className="container mx-auto px-6 mb-10">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium">
          Trusted by modern businesses worldwide
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex shrink-0 items-center gap-20 px-10">
              {logos.map((logo) => (
                <div key={`${setIndex}-${logo.name}`} className="flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity duration-300 shrink-0">
                  <img src={logo.src} alt={logo.name} className={`${logo.className} w-auto object-contain brightness-0 invert`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
