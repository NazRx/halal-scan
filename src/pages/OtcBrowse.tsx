import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { OtcSearchInput } from '@/components/otc/OtcSearchInput';
import { OtcProductCard } from '@/components/otc/OtcProductCard';
import { OtcCategoryChips } from '@/components/otc/OtcCategoryChips';
import { 
  useOtcBrowseList, 
  useOtcCategories,
  OtcBrowseTab 
} from '@/hooks/useOtcBrowseList';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Pill, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

const OtcBrowse = () => {
  const [activeTab, setActiveTab] = useState<OtcBrowseTab>('common');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  // Reset page when filters change
  const handleTabChange = (tab: OtcBrowseTab) => {
    setActiveTab(tab);
    setCategoryFilter(null);
    setPage(0);
  };

  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category);
    setPage(0);
  };

  const { data, totalCount, isLoading } = useOtcBrowseList(
    activeTab,
    categoryFilter,
    page,
    pageSize
  );

  const categories = useOtcCategories(activeTab);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4"
        >
          <Link to="/app">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OTC Products</h1>
              <p className="text-muted-foreground">Browse over-the-counter medications & supplements</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <OtcSearchInput placeholder="Search by name, brand, or ingredient (e.g. Tylenol, APAP, Vitamin D3)..." />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as OtcBrowseTab)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="common" className="gap-2">
                <Package className="h-4 w-4" />
                Common OTC
              </TabsTrigger>
              <TabsTrigger value="vitamins" className="gap-2">
                <Pill className="h-4 w-4" />
                Vitamins & Supplements
              </TabsTrigger>
            </TabsList>

            {/* Category Chips */}
            <div className="mb-6">
              <OtcCategoryChips
                categories={categories}
                selected={categoryFilter}
                onSelect={handleCategoryChange}
              />
            </div>

            {/* Common OTC Tab */}
            <TabsContent value="common" className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
                </p>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your category filter or search for a specific product.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.map((product, index) => (
                    <OtcProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Vitamins & Supplements Tab */}
            <TabsContent value="vitamins" className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading...' : `${totalCount} vitamin/supplement${totalCount !== 1 ? 's' : ''} found`}
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No vitamins found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your category filter or search for a specific supplement.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.map((product, index) => (
                    <OtcProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OtcBrowse;
