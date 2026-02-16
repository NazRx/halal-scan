import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  title: string;
  content: string | null;
  author: string | null;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("title, content, author, created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  const title = post?.title || slug?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Blog Post";

  return (
    <div className="min-h-screen flex flex-col">
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
          {post?.author && (
            <p className="text-sm text-muted-foreground">By {post.author}</p>
          )}
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : post?.content ? (
            <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap">
              {post.content}
            </div>
          ) : (
            <p className="text-muted-foreground">
              This article is coming soon. Check back for in-depth coverage on this topic.
            </p>
          )}
        </section>
        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
