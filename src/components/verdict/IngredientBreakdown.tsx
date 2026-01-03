import { ExternalLink, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { IngredientVerdict } from '@/types/verdict';
import { cn } from '@/lib/utils';

interface IngredientBreakdownProps {
  ingredients: IngredientVerdict[];
  showRole?: boolean; // Show active/inactive role for Rx
}

function StatusIcon({ status }: { status: IngredientVerdict['status'] }) {
  switch (status) {
    case 'halal':
      return <CheckCircle className="h-4 w-4 text-status-halal" />;
    case 'questionable':
      return <AlertTriangle className="h-4 w-4 text-status-questionable" />;
    case 'not_halal':
      return <XCircle className="h-4 w-4 text-status-not-halal" />;
    case 'unknown':
    default:
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: IngredientVerdict['status'] }) {
  const variants = {
    halal: 'bg-status-halal/15 text-status-halal border-status-halal/30',
    questionable: 'bg-status-questionable/15 text-status-questionable border-status-questionable/30',
    not_halal: 'bg-status-not-halal/15 text-status-not-halal border-status-not-halal/30',
    unknown: 'bg-muted text-muted-foreground border-border',
  };

  const labels = {
    halal: 'OK',
    questionable: 'Check',
    not_halal: 'Issue',
    unknown: '?',
  };

  return (
    <Badge variant="outline" className={cn('text-xs', variants[status])}>
      {labels[status]}
    </Badge>
  );
}

function RoleBadge({ role }: { role?: 'active' | 'inactive' }) {
  if (!role) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'text-xs ml-2',
        role === 'active' 
          ? 'bg-primary/10 text-primary border-primary/30' 
          : 'bg-muted text-muted-foreground border-border'
      )}
    >
      {role === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function IngredientBreakdown({ ingredients, showRole = false }: IngredientBreakdownProps) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">No Ingredient Data</h3>
        <p className="text-sm text-muted-foreground">
          Ingredient information is not available for this product.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-semibold">Ingredient Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} analyzed
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Ingredient</TableHead>
              {showRole && <TableHead className="w-24">Role</TableHead>}
              <TableHead>Concern</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="w-20">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((ingredient) => (
              <TableRow 
                key={ingredient.ingredientId}
                className={cn(
                  ingredient.status === 'not_halal' && 'bg-status-not-halal/5',
                  ingredient.status === 'questionable' && 'bg-status-questionable/5'
                )}
              >
                <TableCell>
                  <StatusIcon status={ingredient.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{ingredient.ingredientName}</span>
                    <StatusBadge status={ingredient.status} />
                  </div>
                </TableCell>
                {showRole && (
                  <TableCell>
                    <RoleBadge role={ingredient.role} />
                  </TableCell>
                )}
                <TableCell>
                  {ingredient.concern ? (
                    <span className="text-sm text-muted-foreground">
                      {ingredient.concern}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {ingredient.sourceUrl ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      asChild
                    >
                      <a 
                        href={ingredient.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        {ingredient.sourceTitle || 'View'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  ) : ingredient.sourceTitle ? (
                    <span className="text-sm">{ingredient.sourceTitle}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {ingredient.notes ? (
                    <span className="text-sm text-muted-foreground">
                      {ingredient.notes}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
