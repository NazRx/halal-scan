import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Pill, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { useViewHistory } from '@/hooks/useViewHistory';
import { mapDbStatus } from '@/lib/status-labels';

export default function History() {
  const navigate = useNavigate();
  const { history, loading, error } = useViewHistory(50);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 pt-24 pb-6">
        <PremiumGate 
          requiredTier="pro" 
          upgradeMessage="Upgrade to Pro to access your viewing history"
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
                <Clock className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Your History</h1>
              </div>
            </div>

            <p className="text-muted-foreground">
              Your recent medication lookups for quick reference.
            </p>

            {/* Loading State */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
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
            {!loading && !error && history.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-lg mb-2">No history yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start searching for medications to build your history.
                  </p>
                  <Button onClick={() => navigate('/rx')}>
                    Search Medications
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* History List */}
            {!loading && !error && history.length > 0 && (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        if (item.metadata?.med_id) {
                          navigate(`/rx/med/${item.metadata.med_id}`);
                        }
                      }}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">
                                {item.metadata?.medication_name || 'Unknown Medication'}
                              </h3>
                              {item.metadata?.status && (
                                <StatusBadge 
                                  status={mapDbStatus(item.metadata.status)} 
                                  size="sm" 
                                />
                              )}
                            </div>
                            {item.metadata?.manufacturer_name && (
                              <p className="text-sm text-muted-foreground truncate">
                                {item.metadata.manufacturer_name}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
    </div>
  );
}
