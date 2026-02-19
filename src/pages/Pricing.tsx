import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Minus, CreditCard, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanFeature {
  label: string;
  included: boolean;
}

interface Plan {
  id: string;
  tier: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaNote?: string;
  badge?: string;
  highlighted?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const individualPlans: Plan[] = [
  {
    id: "free",
    tier: "Individual",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential ingredient visibility for occasional use.",
    features: [
      "OTC medication scans",
      "Limited prescription scans",
      "Structured ingredient summaries",
      "Clear classification categories",
      "Educational context and community explanations",
    ],
    cta: "Start Free",
    ctaNote: "No credit card required.",
  },
  {
    id: "pro",
    tier: "Individual",
    name: "Plus",
    price: "$6.99",
    period: "month",
    description: "For individuals who want deeper visibility and an uninterrupted experience.",
    features: [
      "Everything in Free",
      "Unlimited OTC and prescription scans",
      "Manufacturer-level comparison (when applicable)",
      "Source-reference citations from public databases",
      "Structured confidence framework with explanation",
      "Downloadable PDF summaries",
      "Ad-free experience",
      "Priority support",
    ],
    cta: "Start 7-Day Trial",
    ctaNote: "No credit card required.",
    badge: "Most Used Individual Plan",
    highlighted: true,
  },
];

const professionalPlans: Plan[] = [
  {
    id: "professional",
    tier: "Professional",
    name: "Professional",
    price: "$79",
    period: "month",
    description: "For individual providers or small clinics.",
    features: [
      "Multi-user access (up to 3 users)",
      "Unlimited lookups",
      "Bulk medication search",
      "Patient-ready summary exports",
      "Documentation-ready PDF reports",
      "Source references and manufacturer variation tracking",
      "Priority support",
    ],
    cta: "Start Professional Plan",
    ctaNote: "Cancel anytime.",
  },
  {
    id: "practice",
    tier: "Professional",
    name: "Practice",
    price: "$149",
    period: "month",
    description: "For mid-size clinics or multi-location pharmacies.",
    features: [
      "Up to 10 users",
      "Bulk uploads",
      "API access",
      "Custom branding",
      "Dedicated onboarding",
      "Priority support",
    ],
    cta: "Start Practice Plan",
    ctaNote: "Annual options available.",
  },
];

const comparisonFeatures = [
  { label: "Unlimited scans", free: false, plus: true, professional: true, practice: true, institutional: true },
  { label: "Manufacturer comparison", free: false, plus: true, professional: true, practice: true, institutional: true },
  { label: "Source references", free: false, plus: true, professional: true, practice: true, institutional: true },
  { label: "Confidence framework", free: false, plus: true, professional: true, practice: true, institutional: true },
  { label: "Multi-user access", free: false, plus: false, professional: true, practice: true, institutional: true },
  { label: "Bulk uploads", free: false, plus: false, professional: false, practice: true, institutional: true },
  { label: "API access", free: false, plus: false, professional: false, practice: true, institutional: true },
  { label: "Custom branding", free: false, plus: false, professional: false, practice: true, institutional: true },
  { label: "Training sessions", free: false, plus: false, professional: false, practice: false, institutional: true },
  { label: "Administrative controls", free: false, plus: false, professional: false, practice: false, institutional: true },
  { label: "Annual reporting", free: false, plus: false, professional: false, practice: false, institutional: true },
];

const scanPacks = [
  { credits: 25, price: "$3.99", note: "Ideal for occasional use." },
  { credits: 100, price: "$9.99", note: "Best value for extended use.", highlight: true },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">{label}</span>
      <div className="flex-1 h-px bg-primary/10" />
    </div>
  );
}

function PlanCard({
  plan,
  onSubscribe,
  isLoading,
  isCurrentPlan,
}: {
  plan: Plan;
  onSubscribe: (id: string) => void;
  isLoading: boolean;
  isCurrentPlan: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative flex flex-col"
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col flex-1 rounded-2xl border bg-card p-7 transition-shadow duration-200",
          plan.highlighted
            ? "border-primary/40 shadow-[0_12px_40px_rgba(47,111,100,0.10)]"
            : "border-border shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]",
          plan.badge && "pt-8"
        )}
      >
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{plan.tier}</p>
          <h3 className="text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
          <div className="flex items-baseline gap-1 mt-3 mb-2">
            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
            {plan.period !== "forever" && (
              <span className="text-muted-foreground text-sm">/ {plan.period}</span>
            )}
            {plan.period === "forever" && (
              <span className="text-muted-foreground text-sm">forever</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
        </div>

        {plan.id === "free" && (
          <p className="text-xs text-muted-foreground/70 italic mb-4">
            Supported through integrated advertising.
          </p>
        )}
        {(plan.id === "professional") && (
          <p className="text-xs text-muted-foreground/70 italic mb-4">
            Annual billing available.
          </p>
        )}

        <ul className="space-y-2.5 mb-6 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
              <span className="text-foreground/80">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto">
          <Button
            className={cn(
              "w-full rounded-xl font-medium transition-all duration-200",
              plan.highlighted
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                : "border border-border hover:border-primary/40 hover:bg-primary/5 hover:-translate-y-0.5"
            )}
            variant={plan.highlighted ? "default" : "outline"}
            size="lg"
            onClick={() => onSubscribe(plan.id)}
            disabled={isLoading || isCurrentPlan}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isCurrentPlan ? "Current Plan" : plan.cta}
          </Button>
          {plan.ctaNote && !isCurrentPlan && (
            <p className="text-xs text-center text-muted-foreground mt-2.5">{plan.ctaNote}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ComparisonCheck({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-4 w-4 text-primary mx-auto" />
  ) : (
    <Minus className="h-4 w-4 text-muted-foreground/30 mx-auto" />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { tier, isPro, isClinic } = useSubscription();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") { navigate("/app"); return; }
    if (planId === "professional" || planId === "practice") {
      toast.info("Contact us for Professional plans", {
        description: "Email us at support@amanahrx.com for professional plan access.",
      });
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please sign in first");
      navigate("/auth");
      return;
    }
    setLoadingAction(`subscribe-${planId}`);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan: planId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first");
      navigate("/auth");
      return;
    }
    setLoadingAction(`credits-${credits}`);
    try {
      const { data, error } = await supabase.functions.invoke("create-credit-purchase", {
        body: { credits },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Failed to start checkout.");
    } finally {
      setLoadingAction(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (planId === "free" && tier === "free") return true;
    if (planId === "pro" && isPro && !isClinic) return true;
    if (planId === "clinic" && isClinic) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-tight">
              Access Designed for Individuals
              <span className="block text-primary"> and Institutions</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-xl mx-auto">
              Structured medication transparency tools for personal use, professional practice,
              and healthcare organizations.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Transparent pricing.{" "}
              <span className="text-muted-foreground">No contracts.</span>{" "}
              Cancel anytime.
            </p>
          </motion.div>
        </section>

        {/* ── INDIVIDUAL PLANS ─────────────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/40">
          <div className="max-w-4xl mx-auto">
            <SectionLabel label="Individual" />
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Individual</h2>
              <p className="text-muted-foreground mt-1">For personal medication transparency.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {individualPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isLoading={loadingAction === `subscribe-${plan.id}`}
                  isCurrentPlan={isCurrentPlan(plan.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── PROFESSIONAL PLANS ───────────────────────────────────── */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <SectionLabel label="Professional" />
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Professional</h2>
              <p className="text-muted-foreground mt-1">
                For pharmacists and healthcare providers.
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Designed for structured use in clinical conversations and patient education.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {professionalPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isLoading={loadingAction === `subscribe-${plan.id}`}
                  isCurrentPlan={false}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTITUTIONAL SUMMARY ────────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/40">
          <div className="max-w-4xl mx-auto">
            <SectionLabel label="Institutional" />
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Institutional</h2>
              <p className="text-muted-foreground mt-1">
                For healthcare systems and coordinated networks.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-bold text-foreground">Custom</span>
                    <span className="text-muted-foreground text-sm">pricing</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-lg">
                    For hospital systems, Islamic medical associations, and healthcare networks
                    seeking organization-wide implementation.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                    {[
                      "Unlimited users",
                      "API integration",
                      "Training sessions",
                      "Annual reporting",
                      "Dedicated support",
                      "Administrative controls",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground/70 italic">
                    HIPAA-aware workflows. No patient identifiers stored.
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-3">
                  <Link to="/institutional">
                    <Button
                      size="lg"
                      className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Explore Institutional Options
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">No commitment required.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ONE-TIME CREDITS ─────────────────────────────────────── */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-xl mx-auto text-center">
            <SectionLabel label="One-Time Access" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Prefer one-time access?
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              Purchase scan credits. Credits do not expire.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {scanPacks.map((pack) => (
                <motion.div
                  key={pack.credits}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={cn(
                    "rounded-2xl border bg-card p-6 flex flex-col items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
                    pack.highlight ? "border-primary/30" : "border-border"
                  )}
                >
                  <CreditCard className="h-5 w-5 text-primary mb-1" />
                  <span className="text-2xl font-bold text-foreground">{pack.credits} scans</span>
                  <span className="text-lg font-semibold text-primary">{pack.price}</span>
                  <span className="text-xs text-muted-foreground text-center">{pack.note}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={!!loadingAction?.startsWith("credits")}
                  >
                    {loadingAction === `credits-${pack.credits}` && (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    )}
                    Purchase {pack.credits}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON TABLE ─────────────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/40">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <SectionLabel label="Comparison" />
              <h2 className="text-2xl font-semibold text-foreground">Plan Comparison</h2>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-4 px-5 font-medium text-muted-foreground w-44">Feature</th>
                      {["Individual Free", "Individual Plus", "Professional", "Practice", "Institutional"].map((col) => (
                        <th key={col} className="text-center py-4 px-4 font-medium text-foreground text-xs">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, i) => (
                      <tr
                        key={row.label}
                        className={cn(
                          "border-b border-border/50 transition-colors hover:bg-muted/20",
                          i % 2 === 0 ? "" : "bg-muted/10"
                        )}
                      >
                        <td className="py-3.5 px-5 text-foreground/80">{row.label}</td>
                        <td className="py-3.5 px-4 text-center"><ComparisonCheck value={row.free} /></td>
                        <td className="py-3.5 px-4 text-center bg-primary/3"><ComparisonCheck value={row.plus} /></td>
                        <td className="py-3.5 px-4 text-center"><ComparisonCheck value={row.professional} /></td>
                        <td className="py-3.5 px-4 text-center"><ComparisonCheck value={row.practice} /></td>
                        <td className="py-3.5 px-4 text-center"><ComparisonCheck value={row.institutional} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── CLOSING TRUST SECTION ────────────────────────────────── */}
        <section className="py-20 px-4 bg-background">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center space-y-4"
          >
            <div className="w-10 h-px bg-primary/30 mx-auto mb-6" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              AmanahRx is an independent medication transparency initiative developed by Muslim
              healthcare professionals.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our mission is to provide structured ingredient clarity — without issuing religious
              rulings — so individuals and institutions can make informed decisions grounded in
              both clinical understanding and spiritual consideration.
            </p>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
