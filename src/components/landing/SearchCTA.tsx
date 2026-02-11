import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchCTA() {
  return (
    <section className="border-t bg-muted/30">
      <div className="container max-w-3xl px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Still Searching for Clarity?</h2>
        <p className="text-muted-foreground">
          Search thousands of U.S. medications now.
        </p>
        <Button asChild size="lg">
          <Link to="/app">
            <Search className="h-4 w-4 mr-2" />
            Search Medications
          </Link>
        </Button>
      </div>
    </section>
  );
}
