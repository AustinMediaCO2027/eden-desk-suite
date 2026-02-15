import fiverrLogo from "@/assets/logos/fiverr.png";
import upworkLogo from "@/assets/logos/upwork.png";
import bookingLogo from "@/assets/logos/booking-white.webp";
import airbnbLogo from "@/assets/logos/airbnb-white.png";


const logos = [
  { name: "Fiverr", src: fiverrLogo, className: "h-10 md:h-12", invert: true },
  { name: "Upwork", src: upworkLogo, className: "h-10 md:h-12", invert: true },
  { name: "Booking.com", src: bookingLogo, className: "h-8 md:h-10", invert: false },
  { name: "Airbnb", src: airbnbLogo, className: "h-8 md:h-10", invert: false },
  
];

export const LogoMarquee = () => {
  return (
    <section className="py-14 md:py-20 border-t border-border/30">
      <div className="container mx-auto px-6 mb-10 md:mb-12">
        <p className="text-center text-xs text-muted-foreground uppercase tracking-[0.25em] font-medium">
          Trusted by modern businesses worldwide
        </p>
      </div>
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...Array(4)].map((_, setIndex) => (
            <div key={setIndex} className="flex shrink-0 items-center gap-16 md:gap-24 px-8 md:px-12">
              {logos.map((logo) => (
                <div key={`${setIndex}-${logo.name}`} className="flex items-center justify-center shrink-0">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.className} w-auto object-contain`}
                    style={{ filter: logo.invert ? "brightness(0) invert(1)" : "none", opacity: 1 }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
