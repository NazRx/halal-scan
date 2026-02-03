import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Pill, Package, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function GlobalSearch({ 
  className, 
  placeholder = "Search medications & products...",
  autoFocus = false 
}: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const { results, isLoading } = useGlobalSearch(query);

  // Show dropdown when we have results or are loading
  useEffect(() => {
    if (query.length >= 2 && (results.length > 0 || isLoading)) {
      setIsOpen(true);
    } else if (query.length < 2) {
      setIsOpen(false);
    }
  }, [query, results, isLoading]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleSelect = useCallback((result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    
    if (result.type === 'rx') {
      navigate(`/rx/med/${result.id}`);
    } else {
      navigate(`/otc/${result.id}/report`);
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="pl-10 pr-4"
          autoFocus={autoFocus}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div 
          ref={listRef}
          className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg overflow-hidden"
        >
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-medium mb-1">No results for "{query}"</p>
              <p className="text-xs text-muted-foreground mb-2">
                Try generic name, brand, or dosage form
              </p>
              <p className="text-xs text-muted-foreground">
                Examples: "lisinopril", "Tylenol", "capsule"
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[min(400px,50vh)]">
              <div className="pb-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0",
                      selectedIndex === index 
                        ? "bg-accent" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    {/* Type Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      result.type === 'rx' 
                        ? "bg-accent/20 text-accent" 
                        : "bg-primary/20 text-primary"
                    )}>
                      {result.type === 'rx' ? (
                        <Pill className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.primaryName}</span>
                        <span className={cn(
                          "text-xs font-medium px-1.5 py-0.5 rounded uppercase flex-shrink-0",
                          result.type === 'rx' 
                            ? "bg-accent/10 text-accent" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {result.type === 'rx' ? 'Rx' : 'OTC'}
                        </span>
                      </div>
                      {result.secondaryLabel && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.secondaryLabel}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <StatusBadge 
                      status={result.status} 
                      size="sm" 
                      showLabel={false}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
