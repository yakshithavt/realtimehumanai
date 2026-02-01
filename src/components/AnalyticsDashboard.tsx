import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  MessageSquare, 
  Image, 
  FileText, 
  Monitor, 
  TrendingUp,
  Activity,
  Clock,
  Eye
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  overview: {
    total_sessions: number;
    total_messages: number;
    active_users_today: number;
    total_activity_today: number;
  };
  activity: {
    daily_activity: Array<{ date: string; count: number }>;
    popular_modes: Record<string, number>;
    top_mode_today: string;
  };
  features: {
    images_analyzed: number;
    files_uploaded: number;
    screen_shares: number;
  };
  real_time: {
    active_sessions: number;
    messages_last_hour: number;
    images_last_hour: number;
    total_activity_today: number;
    top_mode_today: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchRealTimeStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      const response = await fetch(`/api/analytics/real-time`);
      const result = await response.json();
      
      if (result.success && data) {
        setData(prev => prev ? { ...prev, real_time: result.data } : null);
      }
    } catch (error) {
      console.error('Failed to fetch real-time stats:', error);
    }
  };

  const trackEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          metadata
        })
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const modeData = Object.entries(data.activity.popular_modes).map(([mode, count]) => ({
    name: mode.charAt(0).toUpperCase() + mode.slice(1),
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor your application usage and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(7)}
          >
            7 days
          </Button>
          <Button
            variant={timeRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(30)}
          >
            30 days
          </Button>
          <Button
            variant={timeRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(90)}
          >
            90 days
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.total_sessions}</div>
            <p className="text-xs text-muted-foreground">
              +{data.real_time.active_sessions} active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.total_messages}</div>
            <p className="text-xs text-muted-foreground">
              +{data.real_time.messages_last_hour} last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.active_users_today}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.total_activity_today} actions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Mode</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{data.real_time.top_mode_today}</div>
            <p className="text-xs text-muted-foreground">Most used today</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>User activity over the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.activity.daily_activity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Modes Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Modes</CardTitle>
            <CardDescription>Usage distribution across different modes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {modeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>How users are interacting with different features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.features.images_analyzed}</p>
                <p className="text-sm text-muted-foreground">Images Analyzed</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.features.files_uploaded}</p>
                <p className="text-sm text-muted-foreground">Files Uploaded</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Monitor className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.features.screen_shares}</p>
                <p className="text-sm text-muted-foreground">Screen Shares</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Real-time Activity
            <Badge variant="secondary" className="animate-pulse">
              Live
            </Badge>
          </CardTitle>
          <CardDescription>Current activity across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.real_time.active_sessions}</div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{data.real_time.messages_last_hour}</div>
              <p className="text-sm text-muted-foreground">Messages (1h)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.real_time.images_last_hour}</div>
              <p className="text-sm text-muted-foreground">Images (1h)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{data.real_time.total_activity_today}</div>
              <p className="text-sm text-muted-foreground">Actions Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
