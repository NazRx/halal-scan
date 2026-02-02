import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Scan, Command, Pill, Package, Loader2, MessageSquarePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

const placeholderExamples = [
  "Search for Tylenol...",
  "Search for Advil...",
  "Search for Atorvastatin...",
  "Search for Lisinopril...",
  "Search for Metformin...",
];

export function HeroSearchInput() {
  const navigate = useNavigate();
  const [placeholder, setPlaceholder] = useState(placeholderExamples[0]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { results, isLoading } = useGlobalSearch(query);
  const { isPro, isClinic } = useSubscription();
  const { user } = useAuth();
  
  const isPaidUser = isPro || isClinic;

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPlaceholder(placeholderExamples[placeholderIndex]);
  }, [placeholderIndex]);

  // Show dropdown when we have results or are loading or show not found
  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, results, isLoading]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : results.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    }
    // If no results, dropdown shows "not found" - don't navigate away
  };

  const handleRequestReview = () => {
    if (user) {
      navigate(`/feedback?subject=${encodeURIComponent(`Medication Request: ${query}`)}&type=suggestion`);
    } else {
      navigate('/auth?redirect=' + encodeURIComponent(`/feedback?subject=${encodeURIComponent(`Medication Request: ${query}`)}&type=suggestion`));
    }
  };

  const handleScan = () => {
    navigate("/otc/scan");
  };

  // Determine if we should show "not found" state
  const showNotFound = query.length >= 2 && !isLoading && results.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit}>
          <div
            className={cn(
              "relative flex items-center gap-3 rounded-2xl border-2 bg-card/80 backdrop-blur-xl px-4 py-3 transition-all duration-300",
              isFocused 
                ? "border-primary shadow-lg shadow-primary/10" 
                : "border-border hover:border-primary/50"
            )}
          >
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (query.length >= 2) {
                  setIsOpen(true);
                }
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg"
            />

            <div className="flex items-center gap-2 shrink-0">
              {/* Loading indicator */}
              {isLoading && (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              )}
              
              {/* Keyboard shortcut hint */}
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                <Command className="h-3 w-3" />
                <span>K</span>
              </div>

              {/* Scan button */}
              <button
                type="button"
                onClick={handleScan}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                <Scan className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>
        </form>

        {/* Dropdown Results */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full mt-2 w-full bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-[400px] overflow-y-auto"
            >
              {isLoading && results.length === 0 ? (
                <div className="p-6 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Searching medications...</p>
                </div>
              ) : showNotFound ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">We couldn't find "{query}"</p>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                    We're continuously expanding our medication library to serve our community better. 
                    Your input helps us prioritize which medications to review next.
                  </p>
                  
                  {isPaidUser && (
                    <p className="text-xs text-primary mb-4 bg-primary/10 rounded-lg px-3 py-2 inline-block">
                      ✨ As a Pro member, we'll notify you via email when this medication has been reviewed.
                    </p>
                  )}
                  
                  <button
                    onClick={handleRequestReview}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    Request a Review
                  </button>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    💡 Pro tip: Try the generic name (e.g., "acetaminophen" instead of "Tylenol")
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div ref={listRef}>
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-border/50 last:border-b-0",
                        selectedIndex === index 
                          ? "bg-accent" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      {/* Type Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        result.type === 'rx' 
                          ? "bg-blue-500/10 text-blue-500" 
                          : "bg-green-500/10 text-green-500"
                      )}>
                        {result.type === 'rx' ? (
                          <Pill className="h-5 w-5" />
                        ) : (
                          <Package className="h-5 w-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.primaryName}</span>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full uppercase",
                            result.type === 'rx' 
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                              : "bg-green-500/10 text-green-600 dark:text-green-400"
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
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick action pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
        <button
          onClick={() => navigate("/otc/scan")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          📦 Scan OTC
        </button>
        <button
          onClick={() => navigate("/rx/search")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          💊 Search Rx
        </button>
        <button
          onClick={() => navigate("/browse")}
          className="px-4 py-2 rounded-full border bg-card/50 hover:bg-card hover:border-primary/50 text-sm transition-all"
        >
          📋 Browse All
        </button>
      </div>
    </motion.div>
  );
}
