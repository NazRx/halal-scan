import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface BrandChip {
  brand: string;
  generic: string;
}

interface PopularBrandChipsProps {
  category: string;
  brands: BrandChip[];
  className?: string;
}

export function PopularBrandChips({ category, brands, className }: PopularBrandChipsProps) {
  const navigate = useNavigate();

  const handleBrandClick = async (brand: BrandChip) => {
    // Search for the product by generic name pattern
    const searchTerm = brand.generic.toLowerCase();
    
    const { data: products } = await supabase
      .from('otc_products')
      .select('id, generic_name')
      .ilike('generic_name', `%${searchTerm}%`)
      .limit(1);

    if (products && products.length > 0) {
      navigate(`/otc/${products[0].id}/report`);
    } else {
      // Fallback: search by synonym
      const { data: synonymMatch } = await supabase
        .from('otc_synonyms')
        .select('otc_product_id')
        .ilike('synonym', `%${brand.brand.toLowerCase()}%`)
        .limit(1);

      if (synonymMatch && synonymMatch.length > 0) {
        navigate(`/otc/${synonymMatch[0].otc_product_id}/report`);
      } else {
        // Last resort: go to search with brand name
        navigate(`/otc/browse?search=${encodeURIComponent(brand.brand)}`);
      }
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Popular brands</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <Badge
            key={brand.brand}
            variant="secondary"
            className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1"
            onClick={() => handleBrandClick(brand)}
          >
            {brand.brand}
          </Badge>
        ))}
      </div>
    </div>
  );
}
