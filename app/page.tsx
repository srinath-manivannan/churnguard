/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Mail,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  LineChart,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Churn Prediction",
    description: "Multi-model ML pipeline with 85%+ accuracy. Analyzes behavior patterns, revenue trends, and engagement signals.",
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Smart Segmentation",
    description: "RFM analysis and behavioral clustering automatically groups customers for targeted retention strategies.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Mail,
    title: "Automated Campaigns",
    description: "AI-personalized retention emails and SMS. Multi-step campaign wizard with performance tracking.",
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: LineChart,
    title: "Real-time Analytics",
    description: "Live dashboards with anomaly detection, health scores, and revenue-at-risk monitoring.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: TrendingUp,
    title: "Actionable Reports",
    description: "AI-generated weekly reports with insights, recommendations, and exportable analytics.",
    gradient: "from-rose-500 to-red-500",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Sparkles,
    title: "RAG-Powered Chat",
    description: "Conversational AI enriched with your customer data for instant, context-aware insights.",
    gradient: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50 dark:bg-cyan-500/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Your Data",
    description: "Import customer data via CSV or connect your existing CRM in minutes.",
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our ML pipeline analyzes behavior patterns and predicts churn risk automatically.",
  },
  {
    step: "03",
    title: "Take Action",
    description: "Launch targeted retention campaigns and watch churn decrease in real-time.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For small teams getting started",
    features: ["Up to 100 customers", "AI churn prediction", "Basic analytics", "Email support"],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$49",
    period: "/month",
    description: "For growing businesses",
    features: ["Up to 1,000 customers", "Automated campaigns", "AI chatbot & RAG", "Weekly reports", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: ["Unlimited customers", "Custom integrations", "Dedicated account manager", "SLA guarantee", "API access"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ChurnGuard</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm font-medium mb-8">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">AI-Powered Customer Retention Platform</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Predict & Prevent
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Customer Churn
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            ChurnGuard uses advanced ML pipelines to identify at-risk customers,
            understand their behavior, and automate personalized retention campaigns.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                View Demo
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            No credit card required &bull; Free forever for up to 100 customers
          </p>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { label: "Accuracy", value: "85%+" },
              { label: "Customers Analyzed", value: "10K+" },
              { label: "Churn Reduced", value: "32%" },
              { label: "Revenue Saved", value: "$2M+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Reduce Churn
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade AI analytics designed for results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How ChurnGuard Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to transform your retention strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <span className="text-lg font-bold text-primary group-hover:text-primary-foreground transition-colors">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-2">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">Start free, scale as you grow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-primary bg-card shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border bg-card hover:-translate-y-1"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="block">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Reduce Customer Churn?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join hundreds of businesses using AI to improve retention rates
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-base px-8 h-12 shadow-xl">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
                  <Shield className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ChurnGuard</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered customer retention platform for modern businesses.
              </p>
            </div>

            {[
              { title: "Product", items: ["Features", "Pricing", "Demo", "Changelog"] },
              { title: "Company", items: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", items: ["Privacy", "Terms", "Security", "GDPR"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item}>
                      <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ChurnGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
