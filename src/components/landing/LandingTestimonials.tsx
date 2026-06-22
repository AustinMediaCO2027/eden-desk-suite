import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import sarahImg from "@/assets/testimonials/sarah.jpg";
import jamesImg from "@/assets/testimonials/james.jpg";
import lindaImg from "@/assets/testimonials/linda.jpg";
import davidImg from "@/assets/testimonials/david.jpg";
import priyaImg from "@/assets/testimonials/priya.jpg";
import michaelImg from "@/assets/testimonials/michael.jpg";

const testimonials = [
  {
    quote: "Eden Desk completely replaced our clunky invoicing tool. Everything is now in one place and our clients love the professional documents.",
    name: "Sarah M.",
    role: "Freelance Designer",
    photo: sarahImg,
  },
  {
    quote: "The AI drafting feature alone saves me hours every week. I can generate letterheads and proposals in seconds.",
    name: "James K.",
    role: "Agency Owner",
    photo: jamesImg,
  },
  {
    quote: "Simple, clean, and powerful. We switched our entire team to Eden Desk and haven't looked back since.",
    name: "Linda T.",
    role: "Operations Manager",
    photo: lindaImg,
  },
  {
    quote: "The best invoicing platform I've used in 10 years of freelancing. The PDF exports look incredibly professional.",
    name: "David R.",
    role: "Consultant",
    photo: davidImg,
  },
  {
    quote: "We manage 50+ clients and Eden Desk handles it all flawlessly. Task management keeps our team on track every day.",
    name: "Priya N.",
    role: "Project Manager",
    photo: priyaImg,
  },
  {
    quote: "From quote to invoice to payment — the entire workflow is seamless. Our revenue collection improved by 40%.",
    name: "Michael B.",
    role: "Small Business Owner",
    photo: michaelImg,
  },
];

export const LandingTestimonials = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);

  const onApiChange = (a: CarouselApi) => {
    setApi(a);
    if (!a) return;
    a.on("select", () => setCurrent(a.selectedScrollSnap() + 1));
  };

  return (
    <section className="py-28 md:py-40 border-t border-border/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-[10px] text-brand uppercase tracking-[0.25em] mb-5 font-semibold">Testimonials</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5">
              Loved by businesses
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg">
              Join thousands of professionals who trust Eden Desk daily.
            </p>
          </div>
          <span className="hidden md:inline-block text-sm text-muted-foreground font-medium shrink-0">
            {current} / {testimonials.length}
          </span>
        </div>

        <Carousel setApi={onApiChange} opts={{ align: "start", loop: true }} className="max-w-6xl mx-auto">
          <CarouselContent>
            {testimonials.map((t) => (
              <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                <div className="h-full rounded-2xl border border-border/40 bg-gradient-to-b from-card/30 to-transparent p-9 flex flex-col transition-all duration-300 hover:from-card/50 hover:border-brand/40">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-8">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover border border-border/50"
                    />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex items-center justify-center gap-3 mt-10">
            <CarouselPrevious className="static translate-y-0 border-border/50 hover:border-brand/50 hover:text-brand" />
            <CarouselNext className="static translate-y-0 border-border/50 hover:border-brand/50 hover:text-brand" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
