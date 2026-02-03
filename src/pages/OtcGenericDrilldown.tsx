import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { mapDbStatus } from '@/lib/status-labels';

interface OtcVariant {
  id: string;
  display_name: string | null;
  generic_name: string;
  primary_category: string | null;
  is_combo: boolean | null;
  manufacturer: string | null;
  notes: string | null;
}

interface OtcVerdict {
  product_id: string;
  status: string;
}

const OtcGenericDrilldown = () => {
  const { genericName } = useParams<{ genericName: string }>();
  const navigate = useNavigate();
  
  // Convert URL param back to search term (replace hyphens with spaces)
  const searchTerm = genericName?.replace(/-/g, ' ') || '';

  const { data: variants, isLoading } = useQuery({
    queryKey: ['otc-generic-variants', searchTerm],
    queryFn: async () => {
      // Fetch all products matching this generic name
      const { data: products, error } = await supabase
        .from('otc_products')
        .select('id, display_name, generic_name, primary_category, is_combo, manufacturer, notes')
        .ilike('generic_name', `%${searchTerm}%`)
        .order('is_combo', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) throw error;
      return products as OtcVariant[];
    },
    enabled: !!searchTerm,
  });

  const { data: verdicts } = useQuery({
    queryKey: ['otc-generic-verdicts', variants?.map(v => v.id)],
    queryFn: async () => {
      if (!variants?.length) return {};
      
      const { data, error } = await supabase
        .from('otc_verdicts')
        .select('product_id, status')
        .in('product_id', variants.map(v => v.id));

      if (error) throw error;
      
      const verdictMap: Record<string, string> = {};
      (data || []).forEach((v: OtcVerdict) => {
        verdictMap[v.product_id] = v.status;
      });
      return verdictMap;
    },
    enabled: !!variants?.length,
  });

  const handleVariantClick = (variantId: string) => {
    navigate(`/otc/${variantId}/report`);
  };

  // Capitalize generic name for display
  const displayGenericName = searchTerm
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{displayGenericName}</h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `${variants?.length || 0} product variants`}
          </p>
        </div>

        {/* Variants List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : variants?.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No variants found</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't find any products for "{displayGenericName}".
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {variants?.map((variant) => {
              const status = mapDbStatus(verdicts?.[variant.id] || null);
              
              return (
                <Card
                  key={variant.id}
                  onClick={() => handleVariantClick(variant.id)}
                  className="p-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">
                          {variant.display_name || variant.generic_name}
                        </h3>
                        {variant.is_combo && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex-shrink-0">
                            Combo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {variant.primary_category && (
                          <span className="capitalize">{variant.primary_category.replace(/_/g, ' ')}</span>
                        )}
                        {variant.manufacturer && (
                          <>
                            <span>•</span>
                            <span className="truncate">{variant.manufacturer}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default OtcGenericDrilldown;
