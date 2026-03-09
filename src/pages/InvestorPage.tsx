import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useTheme } from "@/hooks/useTheme";
import {
  TrendingUp,
  Users,
  Target,
  Briefcase,
  Shield,
  Bot,
  FileText,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Receipt,
  Mail,
  ChevronRight,
  Building2,
  Rocket,
  DollarSign,
  Globe,
  Heart,
} from "lucide-react";
import businessTeamImg from "@/assets/investor/business-team.jpg";
import entrepreneurImg from "@/assets/investor/entrepreneur.jpg";
import partnershipImg from "@/assets/investor/partnership.jpg";

const InvestorPage = () => {
  const { theme, toggleTheme } = useTheme();
  const prevThemeRef = useRef(theme);

  useEffect(() => {
    prevThemeRef.current = theme;
    if (theme !== "dark") toggleTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (prevThemeRef.current === "light") {
        const root = document.documentElement;
        root.classList.remove("dark");
        root.classList.add("light");
        localStorage.setItem("eden-theme", "light");
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={businessTeamImg} alt="Business team in boardroom" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20">
            Investor Pitch
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Building the Operating System for{" "}
            <span className="text-primary">Small Businesses</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Eden Desk is a modern all-in-one platform designed to simplify how small businesses manage their daily operations. From quotes and invoices to document drafting, task management and file storage.
          </p>
          <p className="text-xl md:text-2xl font-bold text-foreground mb-8">
            Help businesses run their operations from one desk.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 text-base">
              Get Started <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">The Opportunity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">A Massive Underserved Market</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Small businesses represent one of the largest and fastest growing markets globally. Millions of entrepreneurs, freelancers and service-based businesses require digital tools to manage their work.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                However, many existing solutions are either too expensive, too complex, or designed for large enterprises rather than entrepreneurs.
              </p>
              <p className="text-foreground font-semibold">
                Eden Desk focuses on the underserved small business market, providing a simple, affordable and powerful solution.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Briefcase, label: "Lawyers & Legal" },
                { icon: Building2, label: "Restaurants & Hospitality" },
                { icon: Shield, label: "Construction & Contractors" },
                { icon: FileText, label: "Printing & Design" },
                { icon: Users, label: "Freelancers & Consultants" },
                { icon: Globe, label: "Small Business Owners" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Product */}
      <section className="py-20 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-6 text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">The Product</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Everything in One Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">The platform removes the need for multiple tools and simplifies everyday business operations.</p>
        </div>
        <div className="container mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          {[
            { icon: Receipt, title: "Quotes & Invoices", desc: "Create professional quotes and invoices and send them directly to clients." },
            { icon: Mail, title: "Letterhead Generator", desc: "Generate professional business documents instantly." },
            { icon: Bot, title: "AI Business Assistant", desc: "Draft professional letters and documents with AI assistance." },
            { icon: CalendarDays, title: "Task & Meeting Manager", desc: "Organize meetings, deadlines and tasks from one dashboard." },
            { icon: FolderOpen, title: "File Management", desc: "Upload, store and securely share files with clients." },
            { icon: LayoutDashboard, title: "Central Dashboard", desc: "Everything managed from one simple interface." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border/50 bg-card p-6 text-left">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden">
              <img src={entrepreneurImg} alt="Entrepreneur working" className="w-full h-80 object-cover rounded-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">Revenue Model</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Scalable SaaS Subscriptions</h2>
              <div className="space-y-4">
                {[
                  { plan: "Standard Plan", price: "R49.99/month", desc: "Send quotes and invoices." },
                  { plan: "Silver Plan", price: "R85.99/month", desc: "Quotes, invoices, letterheads and AI assistant." },
                  { plan: "Premium Plan", price: "R99.99/month", desc: "Full access including tasks, meetings, AI and file management." },
                  { plan: "Yearly Plan", price: "R985 once-off", desc: "Full access billed annually." },
                ].map(({ plan, price, desc }) => (
                  <div key={plan} className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{plan}</span>
                      <span className="text-primary font-bold text-sm">{price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">This model creates predictable recurring revenue while remaining affordable for small businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Strategy */}
      <section className="py-20 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Growth Strategy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Targeting <span className="text-primary">30,000+</span> Active Users
          </h2>
          <p className="text-muted-foreground mb-10">Our goal is to scale Eden Desk to over 30,000 active users within the next three years.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {[
              "Digital advertising campaigns",
              "Strategic partnerships with business networks",
              "Affiliate and referral programs",
              "Direct outreach to professional industries",
              "Product improvements and feature expansion",
              "Community-driven growth",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4">
                <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use of Investment */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Use of Investment</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Accelerating Growth</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Investment will be used to accelerate product growth and expand market reach.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: FileText, title: "Platform Development", desc: "Continuous development of new features and system improvements." },
              { icon: Target, title: "Marketing & Acquisition", desc: "Targeted campaigns to acquire users across multiple industries." },
              { icon: Shield, title: "Infrastructure & Security", desc: "Scaling the platform to support tens of thousands of users." },
              { icon: Bot, title: "AI Expansion", desc: "Further development of AI tools to assist business operations." },
              { icon: Users, title: "Customer Support", desc: "Building a strong support infrastructure for users." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border/50 bg-card p-6">
                <Icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction */}
      <section className="py-20 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Traction</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Early Launch Phase</h2>
          </div>
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>Eden Desk is currently in its early launch phase, with the platform now live and actively onboarding its first group of users.</p>
            <p>The initial rollout focuses on entrepreneurs, freelancers, and small business owners who require simple tools to manage quotes, invoices, documents, tasks, and client communication in one place.</p>
            <p>Early adopters are being introduced through existing client networks, direct outreach, and business communities — representing professionals from industries such as legal services, hospitality, construction, printing, photography, and other service-based businesses.</p>
            <p>As adoption increases, Eden Desk will scale into a widely used platform designed to support thousands of businesses managing their daily operations.</p>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">Founder Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Built from Real-World Experience</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Eden Desk was built from real-world experience working with business owners across multiple industries.</p>
              <p>While providing services to clients such as lawyers, restaurants, construction companies, printing businesses, photographers, and other entrepreneurs, it became clear that many struggled with managing everyday business operations efficiently.</p>
              <p>Many available solutions were either too expensive, overly complex, or not designed with small businesses in mind.</p>
              <p className="text-foreground font-semibold">Eden Desk represents a commitment to empowering entrepreneurs with tools that make running a business easier, more organized, and more efficient.</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden">
            <img src={partnershipImg} alt="Business partnership" className="w-full h-80 object-cover rounded-2xl" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30 bg-muted/20">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Investment Opportunity</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Eden Desk is currently open to discussions with investors and partners interested in supporting the growth of the platform. By investing in Eden Desk, you are supporting a platform built to empower entrepreneurs and simplify business operations.
          </p>
          <p className="text-xl font-bold text-primary mb-8">One platform. One desk. Total business control.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:support@edendesk.com">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8">
                Contact Us
              </Button>
            </a>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="rounded-xl px-8">
                Try Eden Desk Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default InvestorPage;
