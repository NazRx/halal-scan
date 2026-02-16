import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Shield, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";

const links = [
  { title: "Privacy Policy", path: "/privacy", icon: Shield },
  { title: "Terms of Service", path: "/terms", icon: FileText },
  { title: "Disclaimer", path: "/disclaimer", icon: Scale },
];

export default function Legal() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-16 text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Legal Information
          </motion.h1>
          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            {links.map((link) => (
              <Link key={link.path} to={link.path}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 text-center space-y-3">
                    <link.icon className="h-8 w-8 mx-auto text-primary" />
                    <h3 className="font-medium">{link.title}</h3>
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
