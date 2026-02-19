import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Check,
  Building2,
  Users,
  FileText,
  HeadphonesIcon,
  Settings,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const features = [
  { icon: Users, label: "Unlimited user access", description: "Organization-wide access without per-seat constraints." },
  { icon: Settings, label: "Administrative controls and user management", description: "Manage permissions, access levels, and user activity." },
  { icon: FileText, label: "API integration support", description: "Structured endpoints for integration into existing workflows." },
  { icon: HeadphonesIcon, label: "Dedicated onboarding and training sessions", description: "Coordinated rollout with your team and stakeholders." },
  { icon: BarChart3, label: "Annual transparency reporting", description: "Documentation of usage, coverage, and methodology updates." },
  { icon: HeadphonesIcon, label: "Priority support", description: "Direct channel to the AmanahRx team for institutional accounts." },
];

const idealFor = [
  "Hospital systems",
  "Islamic medical associations",
  "Multi-location pharmacy networks",
  "Coordinated care organizations",
];

const processSteps = [
  { step: "01", title: "Introductory consultation", description: "Understand your organization's scope, workflows, and requirements." },
  { step: "02", title: "Workflow review", description: "Assess how medication transparency tools fit into your current practice." },
  { step: "03", title: "Custom configuration", description: "Set up access levels, integrations, and branding aligned with your organization." },
  { step: "04", title: "Team onboarding", description: "Structured training and rollout support for your staff." },
];

const Institutional = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    organization: "",
    name: "",
    email: "",
    role: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Consultation request received", {
      description: "A member of our team will be in contact within 2–3 business days.",
    });
    setShowForm(false);
    setSubmitting(false);
    setFormData({ organization: "", name: "", email: "", role: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-24">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
              <Building2 className="h-3.5 w-3.5" />
              Institutional Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-5 leading-tight">
              Institutional Partnerships
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-3">
              Structured medication transparency for healthcare networks and systems.
            </p>
            <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto">
              Designed for coordinated implementation across clinics, hospital systems, and
              healthcare organizations.
            </p>
          </motion.div>
        </section>

        {/* ── WHAT'S INCLUDED ──────────────────────────────────── */}
        <section className="py-16 px-4 bg-muted/40">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">Access</span>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">What Institutional Access Includes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-5 flex gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground mb-0.5">{f.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── IDEAL FOR ────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-2xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">Fit</span>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Ideal For</h2>
            </div>
            <div className="space-y-3">
              {idealFor.map((org) => (
                <div
                  key={org}
                  className="flex items-center gap-3 py-3 px-5 rounded-xl border border-border bg-card"
                >
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{org}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── IMPLEMENTATION PROCESS ───────────────────────────── */}
        <section className="py-16 px-4 bg-muted/40">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary/60">Process</span>
                <div className="flex-1 h-px bg-primary/10" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Implementation Process</h2>
            </div>
            <div className="space-y-4">
              {processSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-5 items-start py-5 px-6 rounded-2xl border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
                >
                  <span className="text-2xl font-bold text-primary/20 flex-shrink-0 leading-none mt-0.5">
                    {s.step}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{s.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA / CONTACT FORM ───────────────────────────────── */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-10 h-px bg-primary/30 mx-auto mb-8" />
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              Request Institutional Consultation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Our team will reach out within 2–3 business days to schedule an introductory
              conversation and understand your organization's needs.
            </p>

            {!showForm ? (
              <Button
                size="lg"
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setShowForm(true)}
              >
                Request Consultation
              </Button>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="text-left rounded-2xl border border-border bg-card p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-4"
              >
                {[
                  { key: "organization", label: "Organization name", type: "text", required: true },
                  { key: "name", label: "Your name", type: "text", required: true },
                  { key: "email", label: "Email address", type: "email", required: true },
                  { key: "role", label: "Your role or title", type: "text", required: false },
                ].map(({ key, label, type, required }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      {label}
                      {required && <span className="text-primary ml-0.5">*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Brief description of your organization's needs
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    {submitting ? "Submitting…" : "Submit Request"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}

            <p className="text-xs text-muted-foreground mt-6">
              AmanahRx is an independent research initiative and is not affiliated with any
              regulatory agency or religious authority.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Institutional;
