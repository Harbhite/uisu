import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Users, ExternalLink, Copy, Trash2, BarChart3, Search } from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { User } from "@supabase/supabase-js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FormsPage = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    fetchForms();
  }, []);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setForms(data);
    setLoading(false);
  };

  const createForm = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({ title: "Please sign in", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from("forms")
      .insert({ title: "Untitled Form", created_by: userData.user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating form", description: error.message, variant: "destructive" });
      return;
    }
    navigate(`/forms/edit/${data.id}`);
  };

  const deleteForm = async (id: string) => {
    const { error } = await supabase.from("forms").delete().eq("id", id);
    if (!error) {
      setForms(forms.filter(f => f.id !== id));
      toast({ title: "Form deleted" });
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/forms/s/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const filtered = forms.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Forms — UISU Archive" description="Create and manage forms, surveys, waitlists and registrations." />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} handleLogout={handleLogout} />

      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Forms</h1>
            <p className="text-muted-foreground mt-1">Create surveys, waitlists, registrations & more.</p>
          </div>
          <Button onClick={createForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Form
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 bg-muted rounded w-3/4" /></CardHeader>
                <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {search ? "No forms found" : "No forms yet"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {search ? "Try a different search term." : "Create your first form to start collecting responses."}
            </p>
            {!search && (
              <Button onClick={createForm} className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Create Form
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(form => (
              <Card key={form.id} className="border-border hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                      {form.title}
                    </CardTitle>
                    <Badge
                      variant={form.status === "published" ? "default" : "secondary"}
                    >
                      {form.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{form.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {form.response_count || 0} responses
                    </span>
                    <span>{format(new Date(form.created_at), "MMM d, yyyy")}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/forms/edit/${form.id}`}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/forms/responses/${form.id}`}>
                      <BarChart3 className="w-3.5 h-3.5 mr-1" /> Responses
                    </Link>
                  </Button>
                  {form.status === "published" && form.share_token && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => copyShareLink(form.share_token)}>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/forms/s/${form.share_token}`} target="_blank">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Preview
                        </Link>
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete form?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this form and all its responses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteForm(form.id)} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FormsPage;
