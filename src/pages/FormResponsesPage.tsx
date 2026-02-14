import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Trash2, BarChart3, List, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#003366", "#C5A059", "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const FormResponsesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [formRes, fieldsRes, responsesRes] = await Promise.all([
      supabase.from("forms").select("*").eq("id", id!).single(),
      supabase.from("form_fields").select("*").eq("form_id", id!).order("sort_order"),
      supabase.from("form_responses").select("*").eq("form_id", id!).order("submitted_at", { ascending: false }),
    ]);

    if (formRes.data) setForm(formRes.data);
    if (fieldsRes.data) setFields(fieldsRes.data);
    if (responsesRes.data) setResponses(responsesRes.data);
    setLoading(false);
  };

  const deleteResponse = async (responseId: string) => {
    const { error } = await supabase.from("form_responses").delete().eq("id", responseId);
    if (!error) {
      setResponses(prev => prev.filter(r => r.id !== responseId));
      toast({ title: "Response deleted" });
    }
  };

  const exportCSV = () => {
    if (responses.length === 0) return;

    const headers = ["Submitted At", "Name", "Email", ...fields.map(f => f.label)];
    const rows = responses.map(r => {
      const data = r.data || {};
      return [
        format(new Date(r.submitted_at), "yyyy-MM-dd HH:mm"),
        r.respondent_name || "",
        r.respondent_email || "",
        ...fields.map(f => {
          const val = data[f.id];
          if (Array.isArray(val)) return val.join("; ");
          return val?.toString() || "";
        }),
      ];
    });

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.title || "form"}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported" });
  };

  const getFieldAnalytics = (field: any) => {
    if (!["multiple_choice", "checkbox", "dropdown", "rating", "yes_no"].includes(field.field_type)) return null;

    const counts: Record<string, number> = {};

    responses.forEach(r => {
      const val = r.data?.[field.id];
      if (val === undefined || val === null) return;

      if (Array.isArray(val)) {
        val.forEach((v: string) => { counts[v] = (counts[v] || 0) + 1; });
      } else {
        const key = val.toString();
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Form not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${form.title} — Responses`} description="View and analyze form responses." />

      {/* Top Bar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border h-16 flex items-center px-4 gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/forms")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="font-semibold text-foreground truncate flex-1">{form.title}</h1>
        <Badge variant="secondary">
          <Users className="w-3.5 h-3.5 mr-1" /> {responses.length} responses
        </Badge>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={responses.length === 0}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/forms/edit/${id}`}>Edit Form</Link>
        </Button>
      </div>

      <div className="pt-24 pb-16 max-w-6xl mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{responses.length}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <List className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{fields.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {responses.length > 0 ? format(new Date(responses[0].submitted_at), "MMM d") : "—"}
                </p>
                <p className="text-sm text-muted-foreground">Latest Response</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table"><List className="w-4 h-4 mr-1" /> Table</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-4">
            {responses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">No responses yet</h3>
                  <p className="text-muted-foreground">Share your form to start collecting responses.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Submitted</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      {fields.map(f => (
                        <TableHead key={f.id} className="min-w-[150px]">{f.label}</TableHead>
                      ))}
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(r.submitted_at), "MMM d, HH:mm")}
                        </TableCell>
                        <TableCell>{r.respondent_name || "—"}</TableCell>
                        <TableCell>{r.respondent_email || "—"}</TableCell>
                        {fields.map(f => {
                          const val = r.data?.[f.id];
                          return (
                            <TableCell key={f.id} className="text-sm max-w-[200px] truncate">
                              {Array.isArray(val) ? val.join(", ") : val?.toString() || "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => deleteResponse(r.id)} className="text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            {responses.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Analytics will appear once you have responses.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(field => {
                  const data = getFieldAnalytics(field);
                  if (!data || data.length === 0) return null;

                  return (
                    <Card key={field.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{field.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {field.field_type === "rating" ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#003366" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                {data.map((_, i) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <div className="mt-3 space-y-1">
                          {data.map((d, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{d.name}</span>
                              <span className="font-medium text-foreground">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Text responses summary */}
                {fields.filter(f => ["short_text", "long_text", "email", "phone", "url"].includes(f.field_type)).map(field => (
                  <Card key={field.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{field.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {responses.map(r => {
                          const val = r.data?.[field.id];
                          if (!val) return null;
                          return (
                            <div key={r.id} className="p-2 bg-muted rounded text-sm text-foreground">
                              {val.toString()}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FormResponsesPage;
