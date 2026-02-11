import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

const ingredients = [
  {
    name: "Gelatin",
    use: "Capsules",
    concern: "May be porcine or bovine derived",
    status: "Requires source verification",
    notes: "Fish-based gelatin exists but is rare in US meds",
  },
  {
    name: "Magnesium Stearate",
    use: "Tablet lubricant",
    concern: "May be animal or plant derived",
    status: "Requires source verification",
    notes: "Vegetable-sourced variants are common",
  },
  {
    name: "Glycerin",
    use: "Solvent / humectant",
    concern: "May be animal or plant derived",
    status: "Requires source verification",
    notes: "Vegetable glycerin is widely available",
  },
  {
    name: "Lactose",
    use: "Filler / binder",
    concern: "Dairy-derived but generally permissible",
    status: "Generally accepted",
    notes: "No animal slaughter involved in production",
  },
  {
    name: "Polysorbate 80",
    use: "Emulsifier",
    concern: "Derived from sorbitol and oleic acid",
    status: "Requires source verification",
    notes: "Oleic acid source (animal vs plant) varies",
  },
  {
    name: "Stearic Acid",
    use: "Tablet coating / lubricant",
    concern: "May be animal or plant derived",
    status: "Requires source verification",
    notes: "Often sourced from palm or coconut oil",
  },
  {
    name: "Alcohol (Ethanol)",
    use: "Solvent in liquid formulations",
    concern: "Intoxicant classification",
    status: "Scholarly debate",
    notes: "Small quantities in medicine debated among scholars",
  },
];

export default function IngredientDatabase() {
  const [search, setSearch] = useState("");
  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-8 text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Ingredient Research Database
          </motion.h1>
          <p className="text-muted-foreground">
            Search and understand commonly questioned ingredients in medications.
          </p>
        </section>

        <section className="container max-w-3xl px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </section>

        <section className="container max-w-3xl px-4 pb-12 space-y-4">
          {filtered.map((ing) => (
            <Card key={ing.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{ing.name}</h3>
                  <Badge variant="outline" className="text-xs">{ing.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground"><strong>Common Use:</strong> {ing.use}</p>
                <p className="text-sm text-muted-foreground"><strong>Potential Concern:</strong> {ing.concern}</p>
                <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {ing.notes}</p>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No ingredients match your search.</p>
          )}
        </section>

        <section className="container max-w-3xl px-4 pb-12 text-center">
          <Button asChild variant="outline">
            <Link to="/app">
              <Search className="h-4 w-4 mr-2" />
              Search a Medication Instead
            </Link>
          </Button>
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
