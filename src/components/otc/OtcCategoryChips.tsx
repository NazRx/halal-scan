import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface OtcCategoryChipsProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  className?: string;
}

export function OtcCategoryChips({ 
  categories, 
  selected, 
  onSelect,
  className 
}: OtcCategoryChipsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(null)}
        className="focus:outline-none"
      >
        <Badge
          variant={selected === null ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors px-3 py-1',
            selected === null && 'bg-primary text-primary-foreground'
          )}
        >
          All
        </Badge>
      </motion.button>

      {categories.map((category) => (
        <motion.button
          key={category}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(category === selected ? null : category)}
          className="focus:outline-none"
        >
          <Badge
            variant={selected === category ? 'default' : 'outline'}
            className={cn(
              'cursor-pointer transition-colors px-3 py-1',
              selected === category && 'bg-primary text-primary-foreground'
            )}
          >
            {category}
          </Badge>
        </motion.button>
      ))}
    </div>
  );
}
