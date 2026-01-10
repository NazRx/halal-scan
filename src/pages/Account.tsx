import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, LogOut, Crown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, loading, isAuthenticated, signOut, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Sync profile data to form
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await updateProfile({ full_name: fullName });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = user?.email || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-muted-foreground">{displayEmail}</p>
            </div>
          </div>

          {/* Subscription Card */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Free Plan</h2>
                  <p className="text-sm text-muted-foreground">
                    Upgrade for unlimited access
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </Link>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2 hidden sm:inline" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="h-4 w-4 mr-2 hidden sm:inline" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2 hidden sm:inline" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2 hidden sm:inline" />
                Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Profile Settings</h2>
                <form className="space-y-4" onSubmit={handleSaveProfile}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input value={displayEmail} type="email" disabled />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="subscription">
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Billing & Subscription</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">Free - $0/month</p>
                    </div>
                    <Link to="/pricing">
                      <Button variant="outline" size="sm">Change Plan</Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">No payment method on file</p>
                    </div>
                    <Button variant="outline" size="sm">Add</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Billing History</p>
                      <p className="text-sm text-muted-foreground">View past invoices</p>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Notification Settings</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Review Completed</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when a product you requested is reviewed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Database Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Notifications about new products added
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Receive tips and product updates
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card className="p-6">
                <h2 className="font-semibold text-lg mb-4">Privacy & Security</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Update your password</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add extra security</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Download My Data</p>
                      <p className="text-sm text-muted-foreground">Export your data</p>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full mt-6 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Account;
