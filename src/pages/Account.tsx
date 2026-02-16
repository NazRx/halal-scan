import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, LogOut, Crown, Loader2, Clock, Bookmark, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, session, loading, isAuthenticated, isAdmin, signOut, updateProfile } = useAuth();
  const { tier, isFree, isPro, isAdminOverride, loading: subscriptionLoading } = useSubscription();
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

  const handleManageBilling = async () => {
    if (!session?.access_token) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 pt-24 pb-8">
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

          {/* Admin Dashboard Link */}
          {isAdmin && (
            <Card className="p-6 mb-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Admin Access</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage users, verdicts, and analytics
                    </p>
                  </div>
                </div>
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Pro Features Quick Access */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card 
              className={`p-4 cursor-pointer transition-colors ${
                isPro ? 'hover:bg-muted/50' : 'opacity-60'
              }`}
              onClick={() => isPro ? navigate('/history') : navigate('/pricing')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isPro ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {isPro ? (
                      <Clock className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">View History</h3>
                    <p className="text-xs text-muted-foreground">
                      {isPro ? 'Recent lookups' : 'Pro feature'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-colors ${
                isPro ? 'hover:bg-muted/50' : 'opacity-60'
              }`}
              onClick={() => isPro ? navigate('/saved') : navigate('/pricing')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isPro ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    {isPro ? (
                      <Bookmark className="h-5 w-5 text-primary fill-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Saved</h3>
                    <p className="text-xs text-muted-foreground">
                      {isPro ? 'Your favorites' : 'Pro feature'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Subscription Card */}
          <Card className={`p-6 mb-8 ${isFree 
            ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20' 
            : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isFree ? 'bg-primary/20' : 'bg-emerald-500/20'
                }`}>
                  <Crown className={`h-5 w-5 ${isFree ? 'text-primary' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    {isAdminOverride ? 'Clinic Plan' : 
                     tier === 'clinic' ? 'Clinic Plan' : 
                     tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                    {isAdminOverride && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full">
                        Admin Access
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isFree 
                      ? 'Upgrade for unlimited access' 
                      : isAdminOverride 
                        ? 'Full premium access as admin'
                        : 'Enjoying full premium features'}
                  </p>
                </div>
              </div>
              {isFree ? (
                <Link to="/pricing">
                  <Button variant="outline" size="sm">
                    Upgrade
                  </Button>
                </Link>
              ) : !isAdminOverride ? (
                <Button variant="outline" size="sm" onClick={handleManageBilling}>
                  Manage Billing
                </Button>
              ) : null}
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
                      <p className="text-sm text-muted-foreground">
                        {isAdminOverride ? 'Clinic (Admin Access) - Complimentary' :
                         tier === 'clinic' ? 'Clinic - $99/month' :
                         tier === 'pro' ? 'Pro - $9/month' :
                         'Free - $0/month'}
                      </p>
                    </div>
                    {isFree ? (
                      <Link to="/pricing">
                        <Button variant="outline" size="sm">Change Plan</Button>
                      </Link>
                    ) : !isAdminOverride ? (
                      <Button variant="outline" size="sm" onClick={handleManageBilling}>
                        Manage
                      </Button>
                    ) : null}
                  </div>

                  {!isAdminOverride && (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">Payment Method</p>
                          <p className="text-sm text-muted-foreground">
                            {isFree ? 'No payment method on file' : 'Managed via Stripe'}
                          </p>
                        </div>
                        {isFree ? (
                          <Button variant="outline" size="sm">Add</Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={handleManageBilling}>
                            Update
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">Billing History</p>
                          <p className="text-sm text-muted-foreground">View past invoices</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleManageBilling}>
                          View All
                        </Button>
                      </div>
                    </>
                  )}
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
