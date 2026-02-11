import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  title: string;
  slug: string;
  excerpt: string | null;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("title, slug, excerpt")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data || []);
        setLoading(false);
      });
  }, []);

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
          {loading ? (
            <p className="text-center text-muted-foreground">Loading…</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No articles yet. Check back soon!</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6 space-y-1 min-h-[100px]">
                      <h3 className="font-medium">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
