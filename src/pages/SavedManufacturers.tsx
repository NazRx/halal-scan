import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, ChevronRight, Pill, ArrowLeft, Trash2, Edit2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfidenceMeter } from '@/components/ui/confidence-meter';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { useSavedManufacturers, SavedManufacturer } from '@/hooks/useSavedManufacturers';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SavedManufacturers() {
  const navigate = useNavigate();
  const { savedManufacturers, loading, error, unsaveManufacturer, updateSavedManufacturer } = useSavedManufacturers();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const mapStatus = (status: string | undefined): 'halal' | 'questionable' | 'not-halal' | 'unknown' => {
    switch (status) {
      case 'halal': return 'halal';
      case 'mushbooh': return 'questionable';
      case 'haram': return 'not-halal';
      default: return 'unknown';
    }
  };

  const handleStartEdit = (item: SavedManufacturer) => {
    setEditingId(item.variant_id);
    setEditNickname(item.nickname || '');
  };

  const handleSaveEdit = async (variantId: string) => {
    const result = await updateSavedManufacturer(variantId, { nickname: editNickname || undefined });
    if (result.success) {
      toast.success('Nickname updated');
      setEditingId(null);
    } else {
      toast.error(result.error || 'Failed to update');
    }
  };

  const handleDelete = async (variantId: string) => {
    const result = await unsaveManufacturer(variantId);
    if (result.success) {
      toast.success('Removed from saved');
    } else {
      toast.error(result.error || 'Failed to remove');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <PremiumGate 
          requiredTier="pro" 
          upgradeMessage="Upgrade to Pro to save your favorite manufacturers"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-primary fill-primary" />
                <h1 className="text-2xl font-bold">Saved Manufacturers</h1>
              </div>
            </div>

            <p className="text-muted-foreground">
              Quick access to your favorite medication manufacturers.
            </p>

            {/* Loading State */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="py-4">
                  <p className="text-destructive text-sm">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && savedManufacturers.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">No saved manufacturers</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Save manufacturers you use regularly for quick access.
                  </p>
                  <Button onClick={() => navigate('/rx')}>
                    Browse Medications
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Saved List */}
            {!loading && !error && savedManufacturers.length > 0 && (
              <div className="space-y-3">
                {savedManufacturers.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                              if (item.medication?.id) {
                                navigate(`/rx/med/${item.medication.id}`);
                              }
                            }}
                          >
                            {/* Nickname editing */}
                            {editingId === item.variant_id ? (
                              <div className="flex items-center gap-2 mb-2">
                                <Input
                                  value={editNickname}
                                  onChange={(e) => setEditNickname(e.target.value)}
                                  placeholder="Add a nickname..."
                                  className="h-8 text-sm"
                                  autoFocus
                                />
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit(item.variant_id);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : item.nickname ? (
                              <p className="text-xs text-primary font-medium mb-1 italic">
                                "{item.nickname}"
                              </p>
                            ) : null}

                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">
                                {item.medication?.generic_name || 'Unknown Medication'}
                              </h3>
                              {item.verdict?.status && (
                                <StatusBadge 
                                  status={mapStatus(item.verdict.status)} 
                                  size="sm" 
                                />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {item.variant?.manufacturer || 'Unknown Manufacturer'}
                              {item.variant?.strength_text && ` • ${item.variant.strength_text}`}
                              {item.variant?.dosage_form && ` • ${item.variant.dosage_form}`}
                            </p>

                            {item.verdict?.confidence !== undefined && (
                              <div className="mt-2">
                                <ConfidenceMeter 
                                  value={item.verdict.confidence} 
                                  compact 
                                />
                              </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-2">
                              Saved {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(item);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(item.variant_id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                if (item.medication?.id) {
                                  navigate(`/rx/med/${item.medication.id}`);
                                }
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </PremiumGate>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from saved?</AlertDialogTitle>
            <AlertDialogDescription>
              This manufacturer will be removed from your saved list. You can always save it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
