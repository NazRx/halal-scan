import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfidenceMeter } from "@/components/ui/confidence-meter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Share2, Bookmark, AlertTriangle, Building2, Check, X, HelpCircle, FileText, AlertCircle } from "lucide-react";

// Mock medication data
const mockMedication = {
  id: "lisinopril-10",
  name: "Lisinopril",
  strength: "10mg",
  form: "Tablet",
  drugClass: "ACE Inhibitor",
  uses: "High blood pressure, heart failure",
  status: "halal" as const,
  confidence: 88,
  activeIngredients: [
    { name: "Lisinopril Dihydrate", status: "halal" as const, notes: "Synthetic compound" },
  ],
  manufacturers: [
    {
      name: "Lupin Pharmaceuticals",
      ndc: "68180-513-01",
      status: "halal" as const,
      confidence: 95,
      inactiveIngredients: [
        { name: "Calcium Phosphate", status: "halal" as const },
        { name: "Mannitol", status: "halal" as const },
        { name: "Magnesium Stearate", status: "halal" as const, notes: "Vegetable source verified" },
        { name: "Corn Starch", status: "halal" as const },
      ],
    },
    {
      name: "Teva Pharmaceuticals",
      ndc: "00093-7341-01",
      status: "halal" as const,
      confidence: 92,
      inactiveIngredients: [
        { name: "Lactose Monohydrate", status: "halal" as const },
        { name: "Magnesium Stearate", status: "halal" as const },
        { name: "Microcrystalline Cellulose", status: "halal" as const },
      ],
    },
    {
      name: "Mylan Pharmaceuticals",
      ndc: "00378-0207-01",
      status: "questionable" as const,
      confidence: 65,
      inactiveIngredients: [
        { name: "Lactose", status: "halal" as const },
        { name: "Magnesium Stearate", status: "questionable" as const, notes: "Source unverified" },
        { name: "Red Iron Oxide", status: "halal" as const },
      ],
    },
  ],
  sources: [
    { name: "FDA Orange Book", url: `https://www.accessdata.fda.gov/scripts/cder/ob/search_product.cfm` },
    { name: "DailyMed", url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Lisinopril` },
    { name: "IFANCA", url: `https://www.ifanca.org/` },
  ],
  lastUpdated: "December 2024",
};

const statusIcons = {
  halal: Check,
  questionable: AlertCircle,
  "not-halal": X,
  unknown: HelpCircle,
};

const RxMedication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const medication = mockMedication;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
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
          {/* Header Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{medication.name}</h1>
                <p className="text-muted-foreground">
                  {medication.strength} • {medication.form} • {medication.drugClass}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Used for: {medication.uses}
                </p>
              </div>
              <StatusBadge status={medication.status} />
            </div>

            <ConfidenceMeter value={medication.confidence} className="mb-4" />

            {/* Manufacturer Warning */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-status-questionable-bg border border-status-questionable/20">
              <AlertTriangle className="h-5 w-5 text-status-questionable flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-status-questionable">Important</p>
                <p className="text-sm text-muted-foreground">
                  Inactive ingredients vary by manufacturer. Check the NDC on your prescription bottle 
                  to find your specific manufacturer below.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Link to={`/report/${id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="manufacturers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manufacturers">
                <Building2 className="h-4 w-4 mr-2" />
                Manufacturers ({medication.manufacturers.length})
              </TabsTrigger>
              <TabsTrigger value="active">Active Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="manufacturers" className="space-y-4">
              {medication.manufacturers.map((mfr, index) => (
                <motion.div
                  key={mfr.ndc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{mfr.name}</h3>
                        <p className="text-sm text-muted-foreground">NDC: {mfr.ndc}</p>
                      </div>
                      <StatusBadge status={mfr.status} size="sm" />
                    </div>

                    <ConfidenceMeter value={mfr.confidence} className="mb-3" />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Inactive Ingredients:</p>
                      <div className="flex flex-wrap gap-2">
                        {mfr.inactiveIngredients.map((ing) => {
                          const Icon = statusIcons[ing.status];
                          return (
                            <div
                              key={ing.name}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                ing.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                                ing.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                                ing.status === "not-halal" ? "bg-status-not-halal-bg text-status-not-halal" :
                                "bg-status-unknown-bg text-status-unknown"
                              }`}
                              title={ing.notes}
                            >
                              <Icon className="h-3 w-3" />
                              {ing.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="active">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Active Ingredients</h3>
                <div className="space-y-3">
                  {medication.activeIngredients.map((ing) => {
                    const Icon = statusIcons[ing.status];
                    return (
                      <div
                        key={ing.name}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`p-1 rounded-full ${
                          ing.status === "halal" ? "bg-status-halal-bg text-status-halal" :
                          ing.status === "questionable" ? "bg-status-questionable-bg text-status-questionable" :
                          "bg-status-unknown-bg text-status-unknown"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium">{ing.name}</span>
                          <p className="text-sm text-muted-foreground">{ing.notes}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Active ingredients are the same across all manufacturers for generic medications.
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sources */}
          <Card className="p-6 mt-6">
            <h2 className="font-semibold text-lg mb-4">Sources & References</h2>
            
            <ul className="space-y-2">
              {medication.sources.map((source) => (
                <li key={source.name}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {source.name}
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground mt-4">
              Last updated: {medication.lastUpdated}
            </p>
          </Card>

          {/* Request Review */}
          <Card className="mt-6 p-4 bg-muted/50">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Don't see your manufacturer?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Submit a request and we'll research your specific medication.
                </p>
                <Button variant="outline" size="sm">
                  Request Review
                </Button>
              </div>
            </div>
          </Card>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            This information is for guidance only. Always verify with the manufacturer, 
            your pharmacist, or a certified halal organization.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default RxMedication;
