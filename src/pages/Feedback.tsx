import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Link>
          </Button>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Share Your Feedback</h1>
            <p className="text-muted-foreground">
              Help us improve HalalRx for the Muslim community
            </p>
          </div>

          {/* Feedback Form Card */}
          <Card>
            <CardContent className="pt-6">
              <FeedbackForm />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Have a question about a specific medication?{" "}
              <Link to="/browse" className="text-primary hover:underline">
                Browse our database
              </Link>{" "}
              or{" "}
              <Link to="/rx/search" className="text-primary hover:underline">
                search for medications
              </Link>.
            </p>
            <p>
              For urgent medical questions, please consult a healthcare professional.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
