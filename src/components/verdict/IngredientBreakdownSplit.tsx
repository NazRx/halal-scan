import { ExternalLink, CheckCircle, AlertTriangle, XCircle, HelpCircle, Pill, Beaker } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import type { IngredientVerdict } from '@/types/verdict';
import { cn } from '@/lib/utils';

interface IngredientBreakdownSplitProps {
  ingredients: IngredientVerdict[];
  showTriggerReason?: boolean;
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

function IngredientTable({ 
  ingredients, 
  title,
  icon: Icon,
  emptyMessage 
}: { 
  ingredients: IngredientVerdict[];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
}) {
  if (ingredients.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Icon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Concern</TableHead>
              <TableHead>Source</TableHead>
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ingredient.ingredientName}</span>
                    <StatusBadge status={ingredient.status} />
                  </div>
                </TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export function IngredientBreakdownSplit({ 
  ingredients, 
  showTriggerReason = true 
}: IngredientBreakdownSplitProps) {
  // Split by role
  const activeIngredients = ingredients.filter(i => i.role === 'active');
  const inactiveIngredients = ingredients.filter(i => i.role === 'inactive');
  const unspecifiedIngredients = ingredients.filter(i => !i.role);

  // Find the ingredient that triggered the status
  const triggeringIngredient = ingredients.find(i => 
    i.status === 'not_halal' || i.status === 'questionable'
  );

  const hasNoInactive = inactiveIngredients.length === 0 && unspecifiedIngredients.length === 0;

  return (
    <div className="space-y-6">
      {/* Status Trigger Explanation */}
      {showTriggerReason && triggeringIngredient && (
        <Card className={cn(
          "p-4",
          triggeringIngredient.status === 'not_halal' 
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
        )}>
          <div className="flex items-start gap-3">
            {triggeringIngredient.status === 'not_halal' ? (
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                Why this status?
              </h3>
              <p className="text-sm mt-1">
                <strong>{triggeringIngredient.ingredientName}</strong>
                {triggeringIngredient.concern && `: ${triggeringIngredient.concern}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Missing Inactive Ingredients Warning */}
      {hasNoInactive && activeIngredients.length > 0 && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Inactive Ingredients Not Available
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Halal status cannot be fully determined without reviewing inactive ingredients (excipients). 
                These are the fillers, coatings, and additives that may contain animal-derived substances.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Ingredients Section */}
      {activeIngredients.length > 0 && (
        <IngredientTable 
          ingredients={activeIngredients}
          title="Active Ingredients"
          icon={Pill}
          emptyMessage="No active ingredient data available"
        />
      )}

      {/* Inactive Ingredients Section */}
      <IngredientTable 
        ingredients={inactiveIngredients.length > 0 ? inactiveIngredients : unspecifiedIngredients}
        title="Inactive Ingredients (Excipients)"
        icon={Beaker}
        emptyMessage="No inactive ingredient data available. Status set to Unknown."
      />
    </div>
  );
}
