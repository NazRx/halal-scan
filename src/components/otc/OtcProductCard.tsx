import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Pill, Layers, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { OtcBrowseProduct } from '@/hooks/useOtcBrowseList';

interface OtcProductCardProps {
  product: OtcBrowseProduct;
  index?: number;
}

export function OtcProductCard({ product, index = 0 }: OtcProductCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      <Card
        className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
        onClick={() => navigate(`/otc/${product.id}/report`)}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            product.isVitamin 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-primary/10 text-primary'
          )}>
            {product.isVitamin ? (
              <Pill className="h-5 w-5" />
            ) : (
              <Package className="h-5 w-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{product.displayName}</h3>
              {product.isCombo && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Combo
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground truncate">
              {product.commonUses || product.genericName}
            </p>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
              {product.isVitamin && (
                <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Vitamin/Supplement
                </Badge>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {/* Manufacturer placeholder */}
        <div className="mt-3 pt-3 border-t border-dashed">
          <p className="text-xs text-muted-foreground italic">
            Manufacturer details coming soon
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
