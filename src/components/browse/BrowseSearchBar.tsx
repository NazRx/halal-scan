import { useNavigate } from 'react-router-dom';
import { Search, ScanLine } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BrowseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function BrowseSearchBar({
  value,
  onChange,
  placeholder = "Search drug name, brand, NDC, or barcode…",
}: BrowseSearchBarProps) {
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/otc/scan')}
        className="flex-shrink-0 gap-1.5 hover:bg-accent/10 transition-colors"
      >
        <ScanLine className="h-4 w-4" />
        Scan
      </Button>
    </div>
  );
}
