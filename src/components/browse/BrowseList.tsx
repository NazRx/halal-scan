import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Building2, Pill, Package } from 'lucide-react';
import type { RxBrowseItem, OtcBrowseItem } from '@/hooks/useBrowseData';
import { cn } from '@/lib/utils';
import { NoRxResultsEmpty, NoOtcResultsEmpty } from './EmptyStates';

interface RxListProps {
  items: RxBrowseItem[];
  isLoading: boolean;
  mode: 'alpha-generic' | 'alpha-brand' | 'drug-class';
  brandIndex?: { brand: string; rxMedId: string; genericName: string }[];
}

export function RxBrowseList({ items, isLoading, mode, brandIndex }: RxListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  // For brand index mode, show brands linking to meds
  if (mode === 'alpha-brand' && brandIndex && brandIndex.length > 0) {
    return (
      <div className="space-y-2">
        {brandIndex.map((item, index) => (
          <motion.div
            key={`${item.brand}-${item.rxMedId}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
          >
            <Card
              className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
              onClick={() => navigate(`/rx/med/${item.rxMedId}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{item.brand}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    Generic: {item.genericName}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">Rx</Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <NoRxResultsEmpty />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
        >
          <Card
            className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => navigate(`/rx/med/${item.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-accent" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{item.genericName}</h3>
                  <StatusBadge 
                    status={item.status === 'varies' ? 'questionable' : item.status} 
                    size="sm" 
                    showLabel={false}
                  />
                  {item.status === 'varies' && (
                    <Badge variant="outline" className="text-xs">Varies by Mfr</Badge>
                  )}
                </div>
                
                {item.brandNames.length > 0 && (
                  <p className="text-sm text-muted-foreground truncate">
                    {item.brandNames.slice(0, 3).join(', ')}
                    {item.brandNames.length > 3 && ` +${item.brandNames.length - 3} more`}
                  </p>
                )}
                
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {item.drugClass && (
                    <span className="truncate">{item.drugClass}</span>
                  )}
                  {item.variantCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {item.variantCount} variant{item.variantCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              <Badge variant="outline" className="text-xs flex-shrink-0">Rx</Badge>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface OtcListProps {
  items: OtcBrowseItem[];
  isLoading: boolean;
  mode: 'alpha-name' | 'alpha-brand' | 'category';
}

export function OtcBrowseList({ items, isLoading, mode }: OtcListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <NoOtcResultsEmpty />;
  }

  // Group by category or brand if in those modes
  const groupedItems = mode === 'category' 
    ? groupByKey(items, 'category')
    : mode === 'alpha-brand'
    ? groupByKey(items, 'brand')
    : null;

  if (groupedItems) {
    return (
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <div key={group}>
            <h3 className="font-semibold text-lg mb-3 sticky top-0 bg-background py-2">
              {group || 'Uncategorized'}
            </h3>
            <div className="space-y-2">
              {groupItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => navigate(`/otc/product/${item.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{item.name}</h4>
                          <StatusBadge status={item.status} size="sm" showLabel={false} />
                        </div>
                        {mode !== 'alpha-brand' && item.brand && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.brand}
                          </p>
                        )}
                        {mode !== 'category' && item.category && (
                          <p className="text-sm text-muted-foreground truncate">
                            {item.category}
                          </p>
                        )}
                      </div>

                      <Badge variant="outline" className="text-xs flex-shrink-0">OTC</Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
        >
          <Card
            className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => navigate(`/otc/product/${item.id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <StatusBadge status={item.status} size="sm" showLabel={false} />
                </div>
                
                <p className="text-sm text-muted-foreground truncate">
                  {[item.brand, item.category].filter(Boolean).join(' • ')}
                </p>
              </div>

              <Badge variant="outline" className="text-xs flex-shrink-0">OTC</Badge>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Helper to group items by a key
function groupByKey<T extends Record<string, any>>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = String(item[key] || 'Other');
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
