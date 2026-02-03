import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Pill, Star } from 'lucide-react';
import { OtcSearchResult } from '@/hooks/useOtcSearch';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OtcSearchResultsProps {
  results: OtcSearchResult[];
  onSelect?: (result: OtcSearchResult) => void;
}

export function OtcSearchResults({ results, onSelect }: OtcSearchResultsProps) {
  const navigate = useNavigate();

  // Group results by match type
  const brandMatches = results.filter(r => r.matchType === 'exact-synonym');
  const genericMatches = results.filter(r => r.matchType === 'exact-generic' || r.matchType === 'partial');

  const handleSelect = (result: OtcSearchResult) => {
    if (onSelect) {
      onSelect(result);
    } else {
      navigate(`/otc/${result.id}/report`);
    }
  };

  // Determine top match (first result overall)
  const topMatchId = results.length > 0 ? results[0].id : null;

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Brand Matches Section */}
      {brandMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Brand Matches
          </h3>
          <div className="grid gap-2">
            {brandMatches.map((result, index) => (
              <ResultCard
                key={result.id}
                result={result}
                isTopMatch={result.id === topMatchId}
                index={index}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generic Matches Section */}
      {genericMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Generic Matches
          </h3>
          <div className="grid gap-2">
            {genericMatches.map((result, index) => (
              <ResultCard
                key={result.id}
                result={result}
                isTopMatch={result.id === topMatchId}
                index={brandMatches.length + index}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ResultCardProps {
  result: OtcSearchResult;
  isTopMatch: boolean;
  index: number;
  onSelect: (result: OtcSearchResult) => void;
}

function ResultCard({ result, isTopMatch, index, onSelect }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md hover:border-primary/50',
          isTopMatch && 'ring-2 ring-primary/20 border-primary/30'
        )}
        onClick={() => onSelect(result)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              result.isVitamin ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'
            )}>
              {result.isVitamin ? <Pill className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold truncate">{result.displayName}</span>
                {isTopMatch && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Top match
                  </Badge>
                )}
                {result.matchType === 'exact-generic' && (
                  <Badge variant="outline" className="text-xs">Exact</Badge>
                )}
                {result.matchType === 'exact-synonym' && (
                  <Badge variant="secondary" className="text-xs">Brand</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {result.category} • {result.commonUses || result.genericName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
