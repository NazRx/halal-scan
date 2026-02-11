import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

export default function BlogPost() {
  const { slug } = useParams();
  const title = slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Blog Post";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-16 space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            This article is coming soon. Check back for in-depth coverage on this topic.
          </p>
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
