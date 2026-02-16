import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchCTA } from "@/components/landing/SearchCTA";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Feedback() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drugName, setDrugName] = useState("");
  const [drugNotes, setDrugNotes] = useState("");
  const [errorMed, setErrorMed] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [generalFeedback, setGeneralFeedback] = useState("");

  const submitFeedback = async (type: string, subject: string, message: string) => {
    if (!message.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: user?.id || null,
        feedback_type: type as any,
        subject,
        message,
        page_url: "/feedback",
      });
      if (error) throw error;
      toast.success("Feedback submitted. Thank you!");
      setDrugName("");
      setDrugNotes("");
      setErrorMed("");
      setErrorDetails("");
      setGeneralFeedback("");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <section className="container max-w-3xl px-4 pb-8 text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Share Feedback
          </motion.h1>
          <p className="text-muted-foreground">
            Help us improve halal medication clarity for the community.
          </p>
        </section>

        <section className="container max-w-3xl px-4 pb-16 space-y-6">
          {/* Suggest a Medication */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suggest a Medication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Drug Name</Label>
                <Input placeholder="e.g., Lisinopril" value={drugName} onChange={(e) => setDrugName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Any additional details" value={drugNotes} onChange={(e) => setDrugNotes(e.target.value)} />
              </div>
              <Button
                disabled={isSubmitting}
                onClick={() => submitFeedback("suggestion", `Medication suggestion: ${drugName}`, drugNotes || drugName)}
              >
                <Send className="h-4 w-4 mr-2" /> Submit Suggestion
              </Button>
            </CardContent>
          </Card>

          {/* Report an Error */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report an Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Medication</Label>
                <Input placeholder="Which medication?" value={errorMed} onChange={(e) => setErrorMed(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Details</Label>
                <Textarea placeholder="Describe the error..." value={errorDetails} onChange={(e) => setErrorDetails(e.target.value)} rows={3} />
              </div>
              <Button
                disabled={isSubmitting}
                onClick={() => submitFeedback("correction", `Error report: ${errorMed}`, errorDetails)}
              >
                <Send className="h-4 w-4 mr-2" /> Submit Report
              </Button>
            </CardContent>
          </Card>

          {/* General Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Feedback</Label>
                <Textarea placeholder="Share your thoughts..." value={generalFeedback} onChange={(e) => setGeneralFeedback(e.target.value)} rows={4} />
              </div>
              <Button
                disabled={isSubmitting}
                onClick={() => submitFeedback("other", "General feedback", generalFeedback)}
              >
                <Send className="h-4 w-4 mr-2" /> Submit Feedback
              </Button>
              <p className="text-xs text-muted-foreground">We review all submissions carefully.</p>
            </CardContent>
          </Card>
        </section>

        <SearchCTA />
      </main>
      <Footer />
    </div>
  );
}
