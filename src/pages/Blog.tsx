import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

const posts = [
  { title: "Is Gelatin Always Haram?", slug: "is-gelatin-always-haram" },
  { title: "Understanding Alcohol in Medicine", slug: "understanding-alcohol-in-medicine" },
  { title: "Emergency Exceptions in Islamic Law", slug: "emergency-exceptions-in-islamic-law" },
  { title: "How to Ask Your Pharmacist About Ingredients", slug: "how-to-ask-your-pharmacist" },
];

export default function Blog() {
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
            Halal Health Insights
          </motion.h1>
          <p className="text-muted-foreground">
            Articles on medication transparency, Islamic bioethics, and ingredient awareness.
          </p>
        </section>

        <section className="container max-w-3xl px-4 pb-16">
          <div className="grid sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 flex items-center min-h-[100px]">
                    <h3 className="font-medium">{post.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
