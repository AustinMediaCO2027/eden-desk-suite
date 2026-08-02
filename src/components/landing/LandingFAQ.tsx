import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What industries is Eden Desk for?",
    a: "Eden Desk is built for businesses across all industries — law firms, construction companies, freelancers, agencies, and more. Anyone who needs professional documents and task management.",
  },
  {
    q: "How does the 7-day free trial work?",
    a: "Every plan starts with a 3-month free trial. Your payment details are collected at checkout, but you are not charged today. Billing begins automatically after the 3-month free trial unless you cancel before renewal.",
  },
  {
    q: "Can I send documents via email?",
    a: "Yes! Connect your Gmail account and send invoices, quotes, and letterheads directly from the platform without leaving Eden Desk.",
  },
  {
    q: "What does the AI assistant do?",
    a: "The AI assistant helps you draft professional letterheads and documents. Silver plan users get 5 prompts per day, while Premium and Yearly users get unlimited access.",
  },
  {
    q: "How do payments work?",
    a: "We use PayFast for secure payments. You can choose monthly or yearly billing. Cancel anytime.",
  },
  {
    q: "Can I upload my company logo?",
    a: "Absolutely. Upload your logo in PNG or JPG format and it will appear on all your invoices, quotes, and letterheads.",
  },
];

export const LandingFAQ = () => {
  return (
    <section id="faq" className="py-28 md:py-36 border-t border-border/30">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4">FAQ</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold">
            Questions? Answers.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border/40 rounded-2xl px-6 data-[state=open]:bg-card/30">
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-5 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
