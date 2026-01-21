import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, FileText, Users, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useScanCredits } from '@/hooks/useScanCredits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UpgradeReason = 'rx_limit' | 'manufacturer_compare' | 'export' | 'general';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: UpgradeReason;
}

const MODAL_CONTENT: Record<UpgradeReason, {
  icon: typeof Shield;
  title: string;
  description: string;
  showCredits: boolean;
}> = {
  rx_limit: {
    icon: Shield,
    title: "You've used your free Rx scans",
    description: "Prescription medications can differ by manufacturer. Unlock full access to compare variants and ingredients confidently.",
    showCredits: true,
  },
  manufacturer_compare: {
    icon: Users,
    title: "Manufacturer differences detected",
    description: "Different manufacturers may use different excipients. Protect gives you visibility before you take the medication.",
    showCredits: false,
  },
  export: {
    icon: FileText,
    title: "Export your report",
    description: "Share halal screening results with family or healthcare providers.",
    showCredits: false,
  },
  general: {
    icon: Sparkles,
    title: "Upgrade to Protect",
    description: "Get unlimited scans, manufacturer comparison, and detailed ingredient rulings.",
    showCredits: false,
  },
};

const SCAN_PACKS = [
  { credits: 25, price: 299, display: '$2.99' },
  { credits: 100, price: 699, display: '$6.99' },
];

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { freeScansRemaining, purchasedCredits } = useScanCredits();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const content = MODAL_CONTENT[reason];
  const Icon = content.icon;

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in first");
      navigate("/auth");
      onOpenChange(false);
      return;
    }

    setLoadingAction('subscribe');
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'pro' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBuyCredits = async (credits: number) => {
    if (!isAuthenticated) {
      toast.info("Please sign in first");
      navigate("/auth");
      onOpenChange(false);
      return;
    }

    setLoadingAction(`credits-${credits}`);
    try {
      const { data, error } = await supabase.functions.invoke('create-credit-purchase', {
        body: { credits },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Credit purchase error:', err);
      toast.error("Failed to start checkout");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pro subscription option */}
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">Protect (Pro)</span>
              </div>
              <span className="text-sm font-medium">$4.99/mo</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Unlimited scans, manufacturer comparison, exports, no ads
            </p>
            <Button 
              className="w-full gradient-hero" 
              onClick={handleSubscribe}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'subscribe' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Start 7-Day Free Trial
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              No credit card required for trial
            </p>
          </div>

          {/* Scan credits option */}
          {content.showCredits && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or buy scan credits
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SCAN_PACKS.map((pack) => (
                  <Button
                    key={pack.credits}
                    variant="outline"
                    className="flex flex-col h-auto py-3"
                    onClick={() => handleBuyCredits(pack.credits)}
                    disabled={loadingAction !== null}
                  >
                    {loadingAction === `credits-${pack.credits}` && (
                      <Loader2 className="h-4 w-4 mb-1 animate-spin" />
                    )}
                    <span className="font-semibold">{pack.credits} Scans</span>
                    <span className="text-xs text-muted-foreground">{pack.display}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Credits never expire • No subscription required
              </p>
            </>
          )}

          {/* Trust badges */}
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Designed by a PharmD · Islamic necessity (darura) respected
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
