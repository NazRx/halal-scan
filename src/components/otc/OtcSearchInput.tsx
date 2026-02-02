import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2, Package, Pill } from 'lucide-react';
import { useOtcSearch, OtcSearchResult } from '@/hooks/useOtcSearch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OtcSearchInputProps {
  placeholder?: string;
  className?: string;
  onResultSelect?: (result: OtcSearchResult) => void;
}

export function OtcSearchInput({ 
  placeholder = 'Search by name, brand, or ingredient...', 
  className,
  onResultSelect
}: OtcSearchInputProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { results, isLoading } = useOtcSearch(query);

  useEffect(() => {
    if (query.length >= 2 && results.length > 0) {
      setShowDropdown(true);
    } else if (query.length < 2) {
      setShowDropdown(false);
    }
  }, [query, results]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleSelect = (result: OtcSearchResult) => {
    setShowDropdown(false);
    setQuery('');
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      navigate(`/otc/${result.id}/report`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowDropdown(true)}
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

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {results.length === 0 && !isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No products found for "{query}"
              </div>
            ) : (
              <ul className="py-1">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(result)}
                      className={cn(
                        'w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors',
                        selectedIndex === index && 'bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        result.isVitamin ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      )}>
                        {result.isVitamin ? <Pill className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.displayName}</span>
                          {result.matchType === 'exact-generic' && (
                            <Badge variant="outline" className="text-xs">Exact</Badge>
                          )}
                          {result.matchType === 'exact-synonym' && (
                            <Badge variant="secondary" className="text-xs">Brand Match</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.category} • {result.commonUses || result.genericName}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
