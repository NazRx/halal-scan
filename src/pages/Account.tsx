import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { User, CreditCard, Bell, Shield, LogOut, Crown, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Account = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock user data
  const user = {
    name: "Ahmad Hassan",
    email: "ahmad@example.com",
    plan: "Pro",
    nextBilling: "January 15, 2025",
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Sign In</h1>
                <p className="text-muted-foreground">
                  Access your account to manage subscriptions and view history.
                </p>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="w-full gradient-hero text-primary-foreground">
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="#" className="text-primary hover:underline">
                    Sign up
                  </a>
                </p>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

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
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
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
                  <h2 className="font-semibold">{user.plan} Plan</h2>
                  <p className="text-sm text-muted-foreground">
                    Next billing: {user.nextBilling}
                  </p>
                </div>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm">
                  Manage Plan
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
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input defaultValue={user.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input defaultValue={user.email} type="email" />
                  </div>
                  <Button type="submit">Save Changes</Button>
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
                      <p className="text-sm text-muted-foreground">{user.plan} - $4.99/month</p>
                    </div>
                    <Link to="/pricing">
                      <Button variant="outline" size="sm">Change Plan</Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
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
            onClick={() => setIsLoggedIn(false)}
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
