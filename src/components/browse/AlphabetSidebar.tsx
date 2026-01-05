import { cn } from '@/lib/utils';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface AlphabetSidebarProps {
  selectedLetter: string | null;
  onLetterSelect: (letter: string | null) => void;
  className?: string;
}

export function AlphabetSidebar({ 
  selectedLetter, 
  onLetterSelect, 
  className 
}: AlphabetSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <button
        onClick={() => onLetterSelect(null)}
        className={cn(
          "w-8 h-6 text-xs font-medium rounded transition-colors",
          selectedLetter === null
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground"
        )}
      >
        All
      </button>
      {LETTERS.map(letter => (
        <button
          key={letter}
          onClick={() => onLetterSelect(letter)}
          className={cn(
            "w-8 h-6 text-xs font-medium rounded transition-colors",
            selectedLetter === letter
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          )}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

// Horizontal version for mobile
export function AlphabetBar({ 
  selectedLetter, 
  onLetterSelect, 
  className 
}: AlphabetSidebarProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto pb-2 scrollbar-hide", className)}>
      <button
        onClick={() => onLetterSelect(null)}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded flex-shrink-0 transition-colors",
          selectedLetter === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80 text-muted-foreground"
        )}
      >
        All
      </button>
      {LETTERS.map(letter => (
        <button
          key={letter}
          onClick={() => onLetterSelect(letter)}
          className={cn(
            "px-2 py-1 text-xs font-medium rounded flex-shrink-0 transition-colors",
            selectedLetter === letter
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}
