import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { BrowseSearchBar } from '@/components/browse/BrowseSearchBar';
import { AlphabetSidebar, AlphabetBar } from '@/components/browse/AlphabetSidebar';
import { RxFilters, OtcFilters } from '@/components/browse/BrowseFilters';
import { RxBrowseList, OtcBrowseList } from '@/components/browse/BrowseList';
import { 
  useRxBrowseData, 
  useOtcBrowseData, 
  useFilterOptions,
  RxBrowseMode,
  OtcBrowseMode,
  StatusFilter,
  DRUG_CLASSES,
} from '@/hooks/useBrowseData';
import { motion } from 'framer-motion';
import { ArrowLeft, Pill, Package, ChevronLeft, ChevronRight, Library } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Browse = () => {
  const isMobile = useIsMobile();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'rx' | 'otc'>('rx');
  
  // Shared search state (persists across tab switches)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rx state
  const [rxMode, setRxMode] = useState<RxBrowseMode>('alpha-generic');
  const [rxStatusFilter, setRxStatusFilter] = useState<StatusFilter>('all');
  const [rxDrugClass, setRxDrugClass] = useState<string | null>(null);
  const [rxLetter, setRxLetter] = useState<string | null>(null);
  const [rxPage, setRxPage] = useState(0);
  
  // OTC state
  const [otcMode, setOtcMode] = useState<OtcBrowseMode>('alpha-name');
  const [otcStatusFilter, setOtcStatusFilter] = useState<StatusFilter>('all');
  const [otcCategoryFilter, setOtcCategoryFilter] = useState('all');
  const [otcLetter, setOtcLetter] = useState<string | null>(null);
  const [otcPage, setOtcPage] = useState(0);
  
  // Fetch filter options
  const { categories } = useFilterOptions();
  
  // Fetch data
  const { 
    data: rxData, 
    brandIndex: rxBrandIndex,
    totalCount: rxTotalCount, 
    isLoading: rxLoading 
  } = useRxBrowseData(
    rxMode, 
    rxStatusFilter, 
    rxMode === 'drug-class' ? rxDrugClass : null,
    rxMode !== 'drug-class' ? rxLetter : null,
    rxPage
  );
  
  const { 
    data: otcData, 
    totalCount: otcTotalCount, 
    isLoading: otcLoading 
  } = useOtcBrowseData(
    otcMode,
    otcStatusFilter,
    otcCategoryFilter,
    otcLetter,
    otcPage
  );

  const pageSize = 25;
  
  // Client-side search filtering
  const searchLower = searchQuery.trim().toLowerCase();
  
  const filteredRxData = useMemo(() => {
    if (!searchLower) return rxData;
    return rxData.filter(item =>
      item.genericName.toLowerCase().includes(searchLower) ||
      item.brandNames.some(b => b.toLowerCase().includes(searchLower)) ||
      (item.drugClass && item.drugClass.toLowerCase().includes(searchLower))
    );
  }, [rxData, searchLower]);

  const filteredRxBrandIndex = useMemo(() => {
    if (!searchLower) return rxBrandIndex;
    return rxBrandIndex.filter(item =>
      item.brand.toLowerCase().includes(searchLower) ||
      item.genericName.toLowerCase().includes(searchLower)
    );
  }, [rxBrandIndex, searchLower]);

  const filteredOtcData = useMemo(() => {
    if (!searchLower) return otcData;
    return otcData.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower))
    );
  }, [otcData, searchLower]);

  const rxDisplayCount = searchLower 
    ? filteredRxData.length + filteredRxBrandIndex.length 
    : rxTotalCount;
  const otcDisplayCount = searchLower ? filteredOtcData.length : otcTotalCount;
  
  const rxTotalPages = searchLower ? 1 : Math.ceil(rxTotalCount / pageSize);
  const otcTotalPages = searchLower ? 1 : Math.ceil(otcTotalCount / pageSize);

  // Reset page when filters change
  const handleRxModeChange = (mode: RxBrowseMode) => {
    setRxMode(mode);
    setRxPage(0);
    setRxLetter(null);
    if (mode !== 'drug-class') setRxDrugClass(null);
  };

  const handleOtcModeChange = (mode: OtcBrowseMode) => {
    setOtcMode(mode);
    setOtcPage(0);
    setOtcLetter(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 pt-24 pb-6">
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
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
              <Library className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Browse Library</h1>
              <p className="text-muted-foreground">Explore medications and products</p>
            </div>
          </div>

          {/* Search Bar + Scan Button (persists across tabs) */}
          <div className="mb-6">
            <BrowseSearchBar
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v);
                setRxPage(0);
                setOtcPage(0);
              }}
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rx' | 'otc')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="rx" className="gap-2">
                <Pill className="h-4 w-4" />
                Rx Medications
              </TabsTrigger>
              <TabsTrigger value="otc" className="gap-2">
                <Package className="h-4 w-4" />
                OTC Products
              </TabsTrigger>
            </TabsList>

            {/* Rx Tab */}
            <TabsContent value="rx" className="space-y-4">
              {/* Browse Mode Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Browse by:</span>
                <Select value={rxMode} onValueChange={(v) => handleRxModeChange(v as RxBrowseMode)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha-generic">Alphabetical (Generic Name)</SelectItem>
                    <SelectItem value="alpha-brand">Alphabetical (Brand Name)</SelectItem>
                    <SelectItem value="drug-class">Drug Class</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Drug class selector when in drug-class mode */}
                {rxMode === 'drug-class' && (
                  <Select 
                    value={rxDrugClass || ''} 
                    onValueChange={(v) => {
                      setRxDrugClass(v || null);
                      setRxPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DRUG_CLASSES.map(cls => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Filters */}
              <RxFilters
                statusFilter={rxStatusFilter}
                onStatusFilterChange={(v) => { setRxStatusFilter(v); setRxPage(0); }}
                drugClassFilter={rxMode === 'drug-class' ? rxDrugClass : null}
                onDrugClassFilterChange={(v) => { setRxDrugClass(v); setRxPage(0); }}
                showDrugClass={false}
              />

              {/* Alphabet Bar (mobile) or Sidebar (desktop) */}
              {rxMode !== 'drug-class' && (
                isMobile ? (
                  <AlphabetBar 
                    selectedLetter={rxLetter} 
                    onLetterSelect={(l) => { setRxLetter(l); setRxPage(0); }} 
                  />
                ) : null
              )}

              {/* Content area with sidebar */}
              <div className="flex gap-4">
                {/* Alphabet Sidebar (desktop only) */}
                {!isMobile && rxMode !== 'drug-class' && (
                  <AlphabetSidebar 
                    selectedLetter={rxLetter} 
                    onLetterSelect={(l) => { setRxLetter(l); setRxPage(0); }}
                    className="flex-shrink-0"
                  />
                )}

                {/* List */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                     <p className="text-sm text-muted-foreground">
                       {rxLoading ? 'Loading...' : `${rxDisplayCount} medication${rxDisplayCount !== 1 ? 's' : ''} found`}
                     </p>
                   </div>

                   <RxBrowseList 
                     items={filteredRxData} 
                     isLoading={rxLoading} 
                     mode={rxMode}
                     brandIndex={rxMode === 'alpha-brand' ? filteredRxBrandIndex : undefined}
                   />

                  {/* Pagination */}
                  {rxTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={rxPage === 0}
                        onClick={() => setRxPage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Page {rxPage + 1} of {rxTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={rxPage >= rxTotalPages - 1}
                        onClick={() => setRxPage(p => p + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* OTC Tab */}
            <TabsContent value="otc" className="space-y-4">
              {/* Browse Mode Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Browse by:</span>
                <Select value={otcMode} onValueChange={(v) => handleOtcModeChange(v as OtcBrowseMode)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alpha-name">Alphabetical (Product Name)</SelectItem>
                    <SelectItem value="alpha-brand">Alphabetical (Brand)</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filters */}
              <OtcFilters
                statusFilter={otcStatusFilter}
                onStatusFilterChange={(v) => { setOtcStatusFilter(v); setOtcPage(0); }}
                categoryFilter={otcCategoryFilter}
                onCategoryFilterChange={(v) => { setOtcCategoryFilter(v); setOtcPage(0); }}
                categories={categories}
              />

              {/* Alphabet Bar (mobile) */}
              {isMobile && otcMode !== 'category' && (
                <AlphabetBar 
                  selectedLetter={otcLetter} 
                  onLetterSelect={(l) => { setOtcLetter(l); setOtcPage(0); }} 
                />
              )}

              {/* Content area with sidebar */}
              <div className="flex gap-4">
                {/* Alphabet Sidebar (desktop only) */}
                {!isMobile && otcMode !== 'category' && (
                  <AlphabetSidebar 
                    selectedLetter={otcLetter} 
                    onLetterSelect={(l) => { setOtcLetter(l); setOtcPage(0); }}
                    className="flex-shrink-0"
                  />
                )}

                {/* List */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                     <p className="text-sm text-muted-foreground">
                       {otcLoading ? 'Loading...' : `${otcDisplayCount} product${otcDisplayCount !== 1 ? 's' : ''} found`}
                     </p>
                   </div>

                   <OtcBrowseList 
                     items={filteredOtcData} 
                     isLoading={otcLoading} 
                     mode={otcMode}
                   />

                  {/* Pagination */}
                  {otcTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={otcPage === 0}
                        onClick={() => setOtcPage(p => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground px-4">
                        Page {otcPage + 1} of {otcTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={otcPage >= otcTotalPages - 1}
                        onClick={() => setOtcPage(p => p + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default Browse;
