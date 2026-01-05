import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { StatusFilter, DRUG_CLASSES, OTC_CATEGORIES } from '@/hooks/useBrowseData';

interface RxFiltersProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  formFilter: string;
  onFormFilterChange: (value: string) => void;
  drugClassFilter: string | null;
  onDrugClassFilterChange: (value: string | null) => void;
  dosageForms: string[];
  showDrugClass?: boolean;
}

export function RxFilters({
  statusFilter,
  onStatusFilterChange,
  formFilter,
  onFormFilterChange,
  drugClassFilter,
  onDrugClassFilterChange,
  dosageForms,
  showDrugClass = false,
}: RxFiltersProps) {
  const hasActiveFilters = statusFilter !== 'all' || formFilter !== 'all' || drugClassFilter !== null;

  const clearFilters = () => {
    onStatusFilterChange('all');
    onFormFilterChange('all');
    onDrugClassFilterChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="questionable">Questionable</SelectItem>
            <SelectItem value="not-halal">Not Halal</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        {/* Form Filter */}
        <Select value={formFilter} onValueChange={onFormFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Dosage Form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            {dosageForms.map(form => (
              <SelectItem key={form} value={form.toLowerCase()}>
                {form}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Drug Class Filter */}
        {showDrugClass && (
          <Select 
            value={drugClassFilter || 'all'} 
            onValueChange={(v) => onDrugClassFilterChange(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Drug Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {DRUG_CLASSES.map(cls => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onStatusFilterChange('all')} 
              />
            </Badge>
          )}
          {formFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Form: {formFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFormFilterChange('all')} 
              />
            </Badge>
          )}
          {drugClassFilter && (
            <Badge variant="secondary" className="gap-1">
              Class: {drugClassFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onDrugClassFilterChange(null)} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface OtcFiltersProps {
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  categories: string[];
}

export function OtcFilters({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: OtcFiltersProps) {
  const hasActiveFilters = statusFilter !== 'all' || categoryFilter !== 'all';

  const clearFilters = () => {
    onStatusFilterChange('all');
    onCategoryFilterChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="questionable">Questionable</SelectItem>
            <SelectItem value="not-halal">Not Halal</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.length > 0 ? (
              categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))
            ) : (
              OTC_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onStatusFilterChange('all')} 
              />
            </Badge>
          )}
          {categoryFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Category: {categoryFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryFilterChange('all')} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
