import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, Users, Search, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyStats {
  date: string;
  scans: number;
  searches: number;
  reports: number;
}

interface TopItem {
  name: string;
  count: number;
}

interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topSearches, setTopSearches] = useState<TopItem[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ pending: 0, approved: 0, rejected: 0 });
  const [userGrowth, setUserGrowth] = useState<{ date: string; users: number }[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const days = period === '7d' ? 7 : 30;
      const startDate = startOfDay(subDays(new Date(), days));
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      // Fetch usage events
      const { data: events } = await supabase
        .from('usage_events')
        .select('event_type, created_at')
        .gte('created_at', startDate.toISOString());

      // Group events by date and type
      const dailyData: Record<string, DailyStats> = {};
      dateRange.forEach((date) => {
        const key = format(date, 'yyyy-MM-dd');
        dailyData[key] = { date: format(date, 'MMM d'), scans: 0, searches: 0, reports: 0 };
      });

      (events || []).forEach((event) => {
        const key = format(new Date(event.created_at), 'yyyy-MM-dd');
        if (dailyData[key]) {
          if (event.event_type === 'otc_scan') dailyData[key].scans++;
          else if (event.event_type === 'rx_search') dailyData[key].searches++;
          else if (event.event_type === 'report_view') dailyData[key].reports++;
        }
      });

      setDailyStats(Object.values(dailyData));

      // Fetch review request stats
      const { data: reviews } = await supabase
        .from('review_requests')
        .select('status');

      const reviewCounts: ReviewStats = { pending: 0, approved: 0, rejected: 0 };
      (reviews || []).forEach((r) => {
        if (r.status === 'new') reviewCounts.pending++;
        else if (r.status === 'resolved') reviewCounts.approved++;
        else if (r.status === 'in_progress') reviewCounts.rejected++;
      });
      setReviewStats(reviewCounts);

      // Fetch user growth
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      const userGrowthData: Record<string, number> = {};
      dateRange.forEach((date) => {
        userGrowthData[format(date, 'yyyy-MM-dd')] = 0;
      });

      (profiles || []).forEach((p) => {
        const key = format(new Date(p.created_at), 'yyyy-MM-dd');
        if (userGrowthData[key] !== undefined) userGrowthData[key]++;
      });

      let cumulative = 0;
      const growthData = Object.entries(userGrowthData).map(([date, count]) => {
        cumulative += count;
        return { date: format(new Date(date), 'MMM d'), users: cumulative };
      });
      setUserGrowth(growthData);

      // Mock top searches (would need to track search terms in usage_events)
      setTopSearches([
        { name: 'Metformin', count: 42 },
        { name: 'Lisinopril', count: 38 },
        { name: 'Atorvastatin', count: 35 },
        { name: 'Amlodipine', count: 28 },
        { name: 'Omeprazole', count: 24 },
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalEvents = dailyStats.reduce((acc, d) => acc + d.scans + d.searches + d.reports, 0);
  const totalScans = dailyStats.reduce((acc, d) => acc + d.scans, 0);
  const totalSearches = dailyStats.reduce((acc, d) => acc + d.searches, 0);

  const reviewPieData = [
    { name: 'Pending', value: reviewStats.pending },
    { name: 'Approved', value: reviewStats.approved },
    { name: 'Rejected', value: reviewStats.rejected },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Usage statistics and trends
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as '7d' | '30d')}>
          <TabsList>
            <TabsTrigger value="7d">Last 7 days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">All activity combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Scans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
            <p className="text-xs text-muted-foreground">Barcode scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSearches}</div>
            <p className="text-xs text-muted-foreground">Medication lookups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userGrowth.length > 0 ? userGrowth[userGrowth.length - 1].users : 0}
            </div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
            <CardDescription>Scans, searches, and report views</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="scans"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  name="Scans"
                />
                <Area
                  type="monotone"
                  dataKey="searches"
                  stackId="1"
                  stroke="hsl(var(--secondary))"
                  fill="hsl(var(--secondary))"
                  fillOpacity={0.6}
                  name="Searches"
                />
                <Area
                  type="monotone"
                  dataKey="reports"
                  stackId="1"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.6}
                  name="Reports"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Cumulative signups over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  name="Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Searched Medications</CardTitle>
            <CardDescription>Most popular lookups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSearches} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Requests</CardTitle>
            <CardDescription>Status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewPieData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No review requests yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reviewPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
