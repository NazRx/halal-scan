import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileCheck, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  pendingReviews: number;
  needsVerification: number;
  recentActivity: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingReviews: 0,
    needsVerification: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch pending reviews (new = pending)
        const { count: pendingCount } = await supabase
          .from('review_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new');

        // Fetch verdicts needing verification
        const { count: rxVerificationCount } = await supabase
          .from('rx_verdicts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'needs_verification');

        const { count: otcVerificationCount } = await supabase
          .from('otc_verdicts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'needs_verification');

        // Fetch recent activity (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const { count: activityCount } = await supabase
          .from('usage_events')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString());

        setStats({
          totalUsers: usersCount || 0,
          pendingReviews: pendingCount || 0,
          needsVerification: (rxVerificationCount || 0) + (otcVerificationCount || 0),
          recentActivity: activityCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered accounts',
      href: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: FileCheck,
      description: 'Awaiting review',
      href: '/admin/verdicts',
      color: 'text-amber-500',
    },
    {
      title: 'Needs Verification',
      value: stats.needsVerification,
      icon: AlertTriangle,
      description: 'Verdicts to verify',
      href: '/admin/verdicts',
      color: 'text-red-500',
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: Activity,
      description: 'Last 24 hours',
      href: '/admin/analytics',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your application's status and activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/verdicts">
                Review pending verdicts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/users">
                Manage user roles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/admin/seed-data">
                Seed medication data
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="flex items-center gap-2 text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentication</span>
                <span className="flex items-center gap-2 text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Edge Functions</span>
                <span className="flex items-center gap-2 text-sm text-green-500">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Running
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
