import lovableLogo from "@/assets/logos/lovable.png";
import canvaLogo from "@/assets/logos/canva.webp";
import pepsicoLogo from "@/assets/logos/pepsico.png";
import bookingLogo from "@/assets/logos/booking.webp";
import airbnbLogo from "@/assets/logos/airbnb.png";
import fiverrLogo from "@/assets/logos/fiverr.png";
import upworkLogo from "@/assets/logos/upwork.png";

const logos = [
  { name: "Lovable", src: lovableLogo, className: "h-12" },
  { name: "Canva", src: canvaLogo, className: "h-12" },
  { name: "PepsiCo", src: pepsicoLogo, className: "h-20" },
  { name: "Booking.com", src: bookingLogo, className: "h-12" },
  { name: "Airbnb", src: airbnbLogo, className: "h-12" },
  { name: "Fiverr", src: fiverrLogo, className: "h-12" },
  { name: "Upwork", src: upworkLogo, className: "h-12" },
];

export const LogoMarquee = () => {
  return (
    <section className="py-16 overflow-hidden border-y border-border/50">
      <div className="container mx-auto px-6 mb-8">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">
          Trusted by teams worldwide
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex shrink-0 items-center gap-16 px-8">
              {logos.map((logo) => (
                <div key={`${setIndex}-${logo.name}`} className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity shrink-0">
                  <img src={logo.src} alt={logo.name} className={`${logo.className} w-auto object-contain invert brightness-0 invert`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
