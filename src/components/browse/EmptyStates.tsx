import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Pill, 
  Package, 
  Search, 
  Camera, 
  FileQuestion,
  Building2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  className?: string;
}

export function NoRxResultsEmpty({ className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center", className)}>
      <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">No medications found</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        We couldn't find any medications matching your search. Try:
      </p>
      <ul className="text-sm text-muted-foreground mb-6 space-y-2 max-w-sm mx-auto text-left">
        <li className="flex items-start gap-2">
          <Search className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Using the generic name (e.g., "lisinopril" instead of "Zestril")</span>
        </li>
        <li className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Checking for spelling variations</span>
        </li>
        <li className="flex items-start gap-2">
          <FileQuestion className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Requesting a review if this medication isn't in our database yet</span>
        </li>
      </ul>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/browse">Browse All Medications</Link>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link to="/app">
            <FileQuestion className="h-4 w-4 mr-2" />
            Request Review
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function NoOtcResultsEmpty({ className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center", className)}>
      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-semibold text-lg mb-2">No products found</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        We couldn't find any OTC products matching your search. Try:
      </p>
      <ul className="text-sm text-muted-foreground mb-6 space-y-2 max-w-sm mx-auto text-left">
        <li className="flex items-start gap-2">
          <Search className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Adjusting your filters or selecting a different letter</span>
        </li>
        <li className="flex items-start gap-2">
          <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Scanning the barcode using the OTC Scan feature</span>
        </li>
        <li className="flex items-start gap-2">
          <FileQuestion className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Submitting a review request for new products</span>
        </li>
      </ul>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/otc/scan">
            <Camera className="h-4 w-4 mr-2" />
            Scan Barcode
          </Link>
        </Button>
        <Button variant="default" size="sm" asChild>
          <Link to="/app">
            <FileQuestion className="h-4 w-4 mr-2" />
            Request Review
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export function NoManufacturerDataEmpty({ 
  className,
  medicationName,
  onUploadPhoto,
  onRequestReview,
}: EmptyStateProps & {
  medicationName?: string;
  onUploadPhoto?: () => void;
  onRequestReview?: () => void;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-status-questionable-bg">
          <Building2 className="h-6 w-6 text-status-questionable" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">No manufacturer ingredient list found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We don't have detailed inactive ingredient data for {medicationName || 'this medication'} yet.
            Here's what you can do:
          </p>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Camera className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Upload your bottle photo</p>
                <p className="text-xs text-muted-foreground">
                  We'll extract the manufacturer and NDC from your label.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <FileQuestion className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Request a review</p>
                <p className="text-xs text-muted-foreground">
                  Our team will research this medication and add it to the database.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {onUploadPhoto && (
              <Button variant="outline" size="sm" onClick={onUploadPhoto}>
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            )}
            {onRequestReview && (
              <Button variant="default" size="sm" onClick={onRequestReview}>
                <FileQuestion className="h-4 w-4 mr-2" />
                Request Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NoSearchResultsEmpty({ 
  query,
  className 
}: EmptyStateProps & { query: string }) {
  return (
    <div className={cn("p-4 text-center", className)}>
      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm font-medium mb-1">No results for "{query}"</p>
      <p className="text-xs text-muted-foreground mb-3">
        Try searching by generic name, brand name, or dosage form.
      </p>
      <p className="text-xs text-muted-foreground">
        Examples: "lisinopril", "Tylenol", "omeprazole capsule"
      </p>
    </div>
  );
}
