import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2 } from 'lucide-react';
import { useOtcSearch, OtcSearchResult } from '@/hooks/useOtcSearch';
import { OtcSearchResults } from './OtcSearchResults';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OtcSearchInputProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: OtcSearchResult) => void;
  /** Show results inline as cards instead of dropdown */
  showInlineResults?: boolean;
}

export function OtcSearchInput({ 
  placeholder = 'Search by name, brand, or ingredient...', 
  className,
  onResultSelect,
  showInlineResults = false
}: OtcSearchInputProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useOtcSearch(query);

  // Separate brand matches and generic matches for dropdown display
  const brandMatches = results.filter(r => r.matchType === 'exact-synonym');
  const genericMatches = results.filter(r => r.matchType === 'exact-generic' || r.matchType === 'partial');
  const topMatchId = results.length > 0 ? results[0].id : null;

  useEffect(() => {
    if (!showInlineResults && query.length >= 2 && results.length > 0) {
      setShowDropdown(true);
    } else if (query.length < 2) {
      setShowDropdown(false);
    }
  }, [query, results, showInlineResults]);

  const handleSelect = (result: OtcSearchResult) => {
    setShowDropdown(false);
    if (!showInlineResults) {
      setQuery('');
    }
    if (onResultSelect) {
      onResultSelect(result);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    if (showInlineResults) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInlineResults]);

  const showResults = query.length >= 2 && results.length > 0;

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => !showInlineResults && query.length >= 2 && results.length > 0 && setShowDropdown(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Inline Results (card grid) */}
      {showInlineResults && showResults && (
        <div className="mt-4">
          <OtcSearchResults results={results} onSelect={handleSelect} />
        </div>
      )}

      {/* Dropdown Results */}
      {!showInlineResults && (
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {results.length === 0 && !isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No products found for "{query}"
                </div>
              ) : (
                <ScrollArea className="max-h-[min(400px,50vh)]">
                  <div className="py-2 pb-3">
                    {/* Brand Matches Section */}
                    {brandMatches.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">
                          Brand Matches
                        </div>
                        {brandMatches.map((result) => (
                          <DropdownResultItem
                            key={result.id}
                            result={result}
                            isTopMatch={result.id === topMatchId}
                            onSelect={handleSelect}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Generic Matches Section */}
                    {genericMatches.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30">
                          Generic Matches
                        </div>
                        {genericMatches.map((result) => (
                          <DropdownResultItem
                            key={result.id}
                            result={result}
                            isTopMatch={result.id === topMatchId}
                            onSelect={handleSelect}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* No results message for inline mode */}
      {showInlineResults && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="mt-4 p-6 text-center border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No products found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

// Dropdown item component
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Package, Pill, Star } from 'lucide-react';

interface DropdownResultItemProps {
  result: OtcSearchResult;
  isTopMatch: boolean;
  onSelect: (result: OtcSearchResult) => void;
}

function DropdownResultItem({ result, isTopMatch, onSelect }: DropdownResultItemProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    onSelect(result);
    navigate(`/otc/${result.id}/report`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors',
        isTopMatch && 'bg-primary/5'
      )}
    >
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        result.isVitamin ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary/10 text-primary'
      )}>
        {result.isVitamin ? <Pill className="h-4 w-4" /> : <Package className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{result.displayName}</span>
          {isTopMatch && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1 px-1.5 py-0">
              <Star className="h-2.5 w-2.5 fill-current" />
              Top
            </Badge>
          )}
          {result.matchType === 'exact-generic' && (
            <Badge variant="outline" className="text-xs">Exact</Badge>
          )}
          {result.matchType === 'exact-synonym' && (
            <Badge variant="secondary" className="text-xs">Brand</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {result.category} • {result.commonUses || result.genericName}
        </p>
      </div>
    </button>
  );
}
