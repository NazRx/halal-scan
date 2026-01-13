import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Mail,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type FeedbackStatus = "new" | "reviewed" | "resolved" | "dismissed";
type FeedbackType = "correction" | "suggestion" | "compliment" | "question" | "other";

interface Feedback {
  id: string;
  user_id: string | null;
  email: string | null;
  feedback_type: FeedbackType;
  subject: string;
  message: string;
  related_medication_id: string | null;
  related_product_upc: string | null;
  page_url: string | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<FeedbackStatus, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "New", icon: Clock, variant: "default" },
  reviewed: { label: "Reviewed", icon: Eye, variant: "secondary" },
  resolved: { label: "Resolved", icon: CheckCircle, variant: "outline" },
  dismissed: { label: "Dismissed", icon: XCircle, variant: "destructive" },
};

const typeLabels: Record<FeedbackType, string> = {
  correction: "Correction",
  suggestion: "Suggestion",
  compliment: "Compliment",
  question: "Question",
  other: "Other",
};

export default function FeedbackManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "all">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["admin-feedback", statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("feedback_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Feedback[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: FeedbackStatus; admin_notes?: string }) => {
      const { error } = await supabase
        .from("user_feedback")
        .update({ status, admin_notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feedback"] });
      toast.success("Feedback updated");
      setSelectedFeedback(null);
    },
    onError: () => {
      toast.error("Failed to update feedback");
    },
  });

  const stats = {
    total: feedbacks.length,
    new: feedbacks.filter((f) => f.status === "new").length,
    reviewed: feedbacks.filter((f) => f.status === "reviewed").length,
    resolved: feedbacks.filter((f) => f.status === "resolved").length,
  };

  const handleStatusChange = (feedback: Feedback, newStatus: FeedbackStatus) => {
    updateMutation.mutate({ id: feedback.id, status: newStatus, admin_notes: feedback.admin_notes || undefined });
  };

  const handleSaveNotes = () => {
    if (!selectedFeedback) return;
    updateMutation.mutate({ 
      id: selectedFeedback.id, 
      status: selectedFeedback.status, 
      admin_notes: adminNotes 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground">Review and manage user feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.reviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-halal">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeedbackStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FeedbackType | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="correction">Correction</SelectItem>
            <SelectItem value="suggestion">Suggestion</SelectItem>
            <SelectItem value="compliment">Compliment</SelectItem>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((feedback) => {
                const StatusIcon = statusConfig[feedback.status].icon;
                return (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <Badge variant="outline">{typeLabels[feedback.feedback_type]}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">
                      {feedback.subject}
                    </TableCell>
                    <TableCell>
                      {feedback.email ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">{feedback.email}</span>
                        </div>
                      ) : feedback.user_id ? (
                        <span className="text-sm text-muted-foreground">Logged in user</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[feedback.status].variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[feedback.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(feedback.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setAdminNotes(feedback.admin_notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Review and manage this feedback submission
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>{" "}
                  <Badge variant="outline" className="ml-2">
                    {typeLabels[selectedFeedback.feedback_type]}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {format(new Date(selectedFeedback.created_at), "PPpp")}
                </div>
                <div>
                  <span className="font-medium">Contact:</span>{" "}
                  {selectedFeedback.email || (selectedFeedback.user_id ? "Logged in user" : "Anonymous")}
                </div>
                {selectedFeedback.page_url && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Page:</span>{" "}
                    <a 
                      href={selectedFeedback.page_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {selectedFeedback.page_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-1">Subject</h4>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedFeedback.subject}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Message</h4>
                <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Status</h4>
                <Select 
                  value={selectedFeedback.status} 
                  onValueChange={(v) => handleStatusChange(selectedFeedback, v as FeedbackStatus)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium mb-1">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={handleSaveNotes}
                  disabled={updateMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
