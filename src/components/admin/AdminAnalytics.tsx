import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Users, FileText, Calendar, Megaphone, BookOpen, Loader2, TrendingUp } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalEvents: number;
  totalAnnouncements: number;
  totalArticles: number;
  totalDocuments: number;
  totalFormResponses: number;
  articlesByType: { name: string; value: number }[];
  eventsByType: { name: string; value: number }[];
  recentActivity: { date: string; count: number }[];
}

const COLORS = ["#003366", "#C5A059", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        { count: totalUsers },
        { count: totalEvents },
        { count: totalAnnouncements },
        { data: articles },
        { count: totalDocuments },
        { count: totalFormResponses },
        { data: recentLogs },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("announcements").select("*", { count: "exact", head: true }),
        supabase.from("ink_pieces").select("type").eq("is_published", true),
        supabase.from("documents").select("*", { count: "exact", head: true }),
        supabase.from("form_responses").select("*", { count: "exact", head: true }),
        supabase.from("audit_logs" as any).select("created_at").order("created_at", { ascending: false }).limit(500),
      ]);

      // Aggregate articles by type
      const typeCounts: Record<string, number> = {};
      (articles || []).forEach((a: any) => {
        typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
      });
      const articlesByType = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

      // Aggregate events by type  
      const { data: eventsData } = await supabase.from("events").select("event_type");
      const eventTypeCounts: Record<string, number> = {};
      (eventsData || []).forEach((e: any) => {
        eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
      });
      const eventsByType = Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }));

      // Recent activity by day (last 14 days)
      const dayCounts: Record<string, number> = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dayCounts[d.toISOString().split("T")[0]] = 0;
      }
      (recentLogs || []).forEach((log: any) => {
        const day = log.created_at?.split("T")[0];
        if (day && dayCounts[day] !== undefined) {
          dayCounts[day]++;
        }
      });
      const recentActivity = Object.entries(dayCounts).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));

      setData({
        totalUsers: totalUsers || 0,
        totalEvents: totalEvents || 0,
        totalAnnouncements: totalAnnouncements || 0,
        totalArticles: (articles || []).length,
        totalDocuments: totalDocuments || 0,
        totalFormResponses: totalFormResponses || 0,
        articlesByType,
        eventsByType,
        recentActivity,
      });
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-ui-blue" },
    { label: "Events", value: data.totalEvents, icon: Calendar, color: "text-green-600" },
    { label: "Announcements", value: data.totalAnnouncements, icon: Megaphone, color: "text-nobel-gold" },
    { label: "Published Articles", value: data.totalArticles, icon: BookOpen, color: "text-purple-600" },
    { label: "Documents", value: data.totalDocuments, icon: FileText, color: "text-orange-600" },
    { label: "Form Responses", value: data.totalFormResponses, icon: TrendingUp, color: "text-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4">
            <stat.icon size={20} className={`${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Admin Activity (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.recentActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#003366" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Articles by Type */}
        {data.articlesByType.length > 0 && (
          <div className="bg-card border border-border p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Articles by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.articlesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {data.articlesByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Events by Type */}
        {data.eventsByType.length > 0 && (
          <div className="bg-card border border-border p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Events by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.eventsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#C5A059" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
