import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Sparkles, FileText, Users, CreditCard, Loader2, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useScanCredits } from '@/hooks/useScanCredits';
import { useRamadan } from '@/hooks/useRamadan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UpgradeReason = 'rx_limit' | 'manufacturer_compare' | 'export' | 'general';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: UpgradeReason;
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const navigate = useNavigate();
  const { isAuthenticated, session } = useAuth();
  const { freeScansRemaining, purchasedCredits } = useScanCredits();
  const { isRamadan, pricing } = useRamadan();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Dynamic content based on reason and Ramadan status
  const getContent = () => {
    if (isRamadan) {
      // Ramadan-specific gentle, intention-based copy
      const ramadanContent: Record<UpgradeReason, {
        icon: typeof Shield;
        title: string;
        description: string;
        showCredits: boolean;
      }> = {
        rx_limit: {
          icon: Moon,
          title: "Continue with clarity",
          description: "Ramadan is a time of intention. Unlock full medication transparency to make informed choices with peace of mind.",
          showCredits: true,
        },
        manufacturer_compare: {
          icon: Moon,
          title: "Manufacturer details available",
          description: "Different manufacturers may use different excipients. Gain visibility to support your informed decisions during this blessed month.",
          showCredits: false,
        },
        export: {
          icon: FileText,
          title: "Share your findings",
          description: "Share halal screening results with family or healthcare providers to support their wellbeing.",
          showCredits: false,
        },
        general: {
          icon: Moon,
          title: "Support your journey",
          description: "Unlock unlimited scans, manufacturer comparison, and detailed ingredient rulings during Ramadan.",
          showCredits: false,
        },
      };
      return ramadanContent[reason];
    }

    // Normal content
    const normalContent: Record<UpgradeReason, {
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
    return normalContent[reason];
  };

  const content = getContent();
  const Icon = content.icon;

  // Dynamic scan packs
  const scanPacks = isRamadan 
    ? [
        { credits: 50, price: 299, display: '$2.99', label: 'Ramadan Pack' },
        { credits: 200, price: 699, display: '$6.99', label: 'Family Pack' },
      ]
    : [
        { credits: 25, price: 299, display: '$2.99' },
        { credits: 100, price: 699, display: '$6.99' },
      ];

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
        body: { plan: 'pro', isRamadanOffer: isRamadan },
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
          <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            isRamadan ? 'bg-amber-100 dark:bg-amber-900' : 'bg-primary/10'
          }`}>
            <Icon className={`h-6 w-6 ${isRamadan ? 'text-amber-600' : 'text-primary'}`} />
          </div>
          <DialogTitle className="text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pro subscription option */}
          <div className={`rounded-lg border-2 p-4 ${
            isRamadan 
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
              : 'border-primary bg-primary/5'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isRamadan ? (
                  <Moon className="h-5 w-5 text-amber-600" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                <span className="font-semibold">
                  {isRamadan ? 'Ramadan Protect' : 'Protect (Pro)'}
                </span>
              </div>
              <span className="text-sm font-medium">
                {isRamadan ? '$2.99/mo' : '$4.99/mo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isRamadan 
                ? 'Unlimited scans, manufacturer comparison, exports, no ads'
                : 'Unlimited scans, manufacturer comparison, exports, no ads'
              }
            </p>
            <Button 
              className={`w-full ${
                isRamadan 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : 'gradient-hero'
              }`}
              onClick={handleSubscribe}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'subscribe' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isRamadan ? 'Unlock Ramadan Offer' : 'Start 7-Day Free Trial'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {isRamadan 
                ? 'Cancel anytime · No guilt · No pressure'
                : 'No credit card required for trial'
              }
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
                    {isRamadan ? 'Or buy Ramadan scan packs' : 'Or buy scan credits'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {scanPacks.map((pack) => (
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
                    {'label' in pack && (
                      <span className="text-xs text-amber-600">{pack.label}</span>
                    )}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {isRamadan 
                  ? 'No subscription. Use anytime. Even after Ramadan.'
                  : 'Credits never expire • No subscription required'
                }
              </p>
            </>
          )}

          {/* Trust badges */}
          <div className="pt-2 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Designed by a PharmD · Islamic necessity (darura) respected
            </p>
            {isRamadan && (
              <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-1">
                Many users choose to upgrade during Ramadan to support independent halal research.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
