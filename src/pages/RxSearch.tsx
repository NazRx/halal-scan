import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Filter, AlertTriangle, Building2 } from "lucide-react";

// Mock search results
const mockResults = [
  {
    id: "lisinopril-10",
    name: "Lisinopril",
    strength: "10mg",
    form: "Tablet",
    status: "halal" as const,
    manufacturers: 12,
  },
  {
    id: "metformin-500",
    name: "Metformin HCL",
    strength: "500mg",
    form: "Tablet",
    status: "questionable" as const,
    manufacturers: 8,
  },
  {
    id: "atorvastatin-20",
    name: "Atorvastatin Calcium",
    strength: "20mg",
    form: "Tablet",
    status: "halal" as const,
    manufacturers: 15,
  },
  {
    id: "omeprazole-20",
    name: "Omeprazole",
    strength: "20mg",
    form: "Capsule",
    status: "halal" as const,
    manufacturers: 10,
  },
];

const RxSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  const filteredResults = mockResults.filter((med) => {
    if (!searchQuery) return true;
    return med.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 pt-24 pb-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-bold mb-2 text-center">Search Rx Medications</h1>
          <p className="text-muted-foreground text-center mb-6">
            Search by medication name to check halal status.
          </p>

          {/* Important Notice */}
          <Card className="p-4 mb-6 bg-status-questionable-bg border-status-questionable/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-status-questionable flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-status-questionable mb-1">Manufacturer Matters</h3>
                <p className="text-sm text-muted-foreground">
                  Prescription medications may have different inactive ingredients depending on the manufacturer. 
                  Always check the specific manufacturer/NDC of your medication.
                </p>
              </div>
            </div>
          </Card>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter medication name (e.g., Lisinopril, Metformin)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="gradient-hero text-primary-foreground">
                Search
              </Button>
            </div>
          </form>

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Strength</label>
                <Select value={strength} onValueChange={setStrength}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any strength" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any strength</SelectItem>
                    <SelectItem value="5mg">5mg</SelectItem>
                    <SelectItem value="10mg">10mg</SelectItem>
                    <SelectItem value="20mg">20mg</SelectItem>
                    <SelectItem value="25mg">25mg</SelectItem>
                    <SelectItem value="50mg">50mg</SelectItem>
                    <SelectItem value="100mg">100mg</SelectItem>
                    <SelectItem value="500mg">500mg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Dosage Form</label>
                <Select value={form} onValueChange={setForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any form</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="capsule">Capsule</SelectItem>
                    <SelectItem value="liquid">Liquid</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Showing {filteredResults.length} results
              </p>

              {filteredResults.map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => navigate(`/rx/med/${med.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{med.name}</h3>
                          <StatusBadge status={med.status} size="sm" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {med.strength} • {med.form}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3" />
                          <span>{med.manufacturers} manufacturer variants</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {filteredResults.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No medications found matching "{searchQuery}"
                  </p>
                  <Button variant="outline">Request Review</Button>
                </Card>
              )}
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && (
            <Card className="p-8 text-center bg-muted/50">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Search for a Medication</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter the name of your prescription medication to see halal status and ingredient details.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery("Lisinopril"); setHasSearched(true); }}>
                  Lisinopril
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery("Metformin"); setHasSearched(true); }}>
                  Metformin
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery("Atorvastatin"); setHasSearched(true); }}>
                  Atorvastatin
                </Button>
              </div>
            </Card>
          )}

          {/* Can't find medication? */}
          <Card className="mt-6 p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Can't find your medication?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              If the medication isn't in our database, you can request a review.
            </p>
            <Button variant="outline" size="sm">
              Request Review
            </Button>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default RxSearch;
