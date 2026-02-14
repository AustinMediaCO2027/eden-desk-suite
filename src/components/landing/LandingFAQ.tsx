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
    a: "Sign up and get instant access to the Silver plan features for 7 days. No credit card required. After the trial, choose a plan that fits your needs.",
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
    <section id="faq" className="py-24 md:py-32">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Questions? Answers.
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 data-[state=open]:bg-card">
              <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
