import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ClipboardList, Loader2, Lock } from "lucide-react";

type ReviewRequest = {
  id: string;
  created_at: string;
  status: string;
  drug_name: string | null;
  brand_or_manufacturer: string | null;
  ndc_number: string | null;
  upc_number: string | null;
  notes_text: string | null;
  resolved_summary: string | null;
  notify_user_on_resolve: boolean;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-muted text-muted-foreground" },
  triaged: { label: "Triaged", className: "bg-primary/10 text-primary" },
  researching: { label: "Researching", className: "bg-warning/10 text-warning-foreground" },
  resolved: { label: "Resolved", className: "bg-status-halal-bg text-status-halal" },
};

export default function MyRequests() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("review_requests") as any)
        .select("id, created_at, status, drug_name, brand_or_manufacturer, ndc_number, upc_number, notes_text, resolved_summary, notify_user_on_resolve")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-3xl px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-1">My Review Requests</h1>
            <p className="text-muted-foreground">
              Track the status of ingredient research requests you've submitted.
            </p>
          </div>

          {authLoading || loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-12">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : !user ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-1">Sign in to view your requests</p>
              <p className="text-sm text-muted-foreground mb-4">
                Your review requests are private and require authentication to view.
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <ClipboardList className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-semibold mb-1">No requests yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                When you request a medication review, it will appear here.
              </p>
              <Button asChild variant="outline">
                <Link to="/rx/search">Search Medications</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const statusInfo = STATUS_LABELS[req.status] ?? { label: req.status, className: "bg-muted text-muted-foreground" };
                const name = req.drug_name || req.brand_or_manufacturer || "(Product not specified)";
                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-border bg-card p-5 space-y-3"
                    style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        {req.brand_or_manufacturer && req.drug_name && (
                          <p className="text-sm text-muted-foreground">{req.brand_or_manufacturer}</p>
                        )}
                        {(req.ndc_number || req.upc_number) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {req.ndc_number ? `NDC: ${req.ndc_number}` : ""}
                            {req.ndc_number && req.upc_number ? " · " : ""}
                            {req.upc_number ? `UPC: ${req.upc_number}` : ""}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {req.status === "resolved" && req.resolved_summary && (
                      <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
                        <p className="text-xs font-semibold text-foreground mb-1">Research outcome</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{req.resolved_summary}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Submitted {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                      {req.notify_user_on_resolve && req.status !== "resolved" && (
                        <Badge variant="secondary" className="text-xs">Notifications on</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
