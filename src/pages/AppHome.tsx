import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Scan, Search, Clock, TrendingUp, ChevronRight, Library } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { Disclaimer } from "@/components/ui/disclaimer";
import { UpdateNotice } from "@/components/ui/update-notice";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
// Mock data for recent activity
const recentActivity = [
  { id: "1", name: "Advil Liquid Gels", status: "halal" as const, time: "2 hours ago" },
  { id: "2", name: "Centrum Adults 50+", status: "questionable" as const, time: "Yesterday" },
  { id: "3", name: "Benadryl Allergy", status: "halal" as const, time: "2 days ago" },
];

// Mock data for top picks
const topPicks = [
  { id: "1", name: "Tylenol Extra Strength", category: "Pain Relief", status: "halal" as const },
  { id: "2", name: "Nature Made Vitamin D3", category: "Vitamins", status: "halal" as const },
  { id: "3", name: "Zyrtec 24 Hour", category: "Allergy", status: "halal" as const },
  { id: "4", name: "Prilosec OTC", category: "Digestive", status: "halal" as const },
];

const AppHome = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 pt-24 pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-4">Search or scan to check your medication.</p>
        </motion.div>

        {/* Centered Global Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex justify-center mb-8"
        >
          <GlobalSearch 
            placeholder="Search medications, products, or brands..."
            className="w-full max-w-xl"
          />
        </motion.div>

        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/otc/scan">
              <Card className="group relative overflow-hidden p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Scan className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Scan OTC</h2>
                  <p className="text-muted-foreground mb-4">
                    Scan the barcode of any over-the-counter product to check its halal status instantly.
                  </p>
                  
                  <div className="flex items-center text-primary font-medium">
                    Start Scanning
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/rx/search">
              <Card className="group relative overflow-hidden p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Search className="h-8 w-8 text-accent-foreground" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Search Rx</h2>
                  <p className="text-muted-foreground mb-4">
                    Search prescription medications by name to view ingredient details and halal status.
                  </p>
                  
                  <div className="flex items-center text-accent font-medium">
                    Search Medications
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Browse Library Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2"
          >
            <Link to="/browse">
              <Card className="group relative overflow-hidden p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Library className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold mb-1">Browse Library</h2>
                    <p className="text-sm text-muted-foreground">
                      Explore our complete database of medications and OTC products by name, class, or category.
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <Button variant="ghost" size="sm">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentActivity.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.time}</p>
                  </div>
                  <StatusBadge status={item.status} size="sm" showLabel={false} />
                </div>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Top Picks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Top Halal Picks</h2>
            </div>
            <Button variant="ghost" size="sm">See More</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPicks.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                <StatusBadge status={item.status} size="sm" className="mb-3" />
                <h3 className="font-medium group-hover:text-primary transition-colors">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Update Notice + Feedback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 space-y-4"
        >
          <UpdateNotice />
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border">
            <div>
              <h4 className="font-medium text-sm">Help us improve</h4>
              <p className="text-xs text-muted-foreground">
                Share your thoughts, corrections, or suggestions
              </p>
            </div>
            <FeedbackButton size="sm" />
          </div>
          <Disclaimer variant="banner" showOtcNote />
        </motion.div>
      </main>
    </div>
  );
};

export default AppHome;
