import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const PastLeadersPage = lazy(() => import("./pages/PastLeadersPage"));
const CurrentLeadersPage = lazy(() => import("./pages/CurrentLeadersPage"));
const LeaderDetailPage = lazy(() => import("./pages/LeaderDetailPage"));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage"));
const CampusMapPage = lazy(() => import("./pages/CampusMapPage"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const InksVaultPage = lazy(() => import("./pages/InksVaultPage"));
const InksPiecePage = lazy(() => import("./pages/InksPiecePage"));
const InkEditorPage = lazy(() => import("./pages/InkEditorPage"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/past-leaders" element={<PastLeadersPage />} />
            <Route path="/current-leaders" element={<CurrentLeadersPage />} />
            <Route path="/current-leaders/:id" element={<LeaderDetailPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/campus-map" element={<CampusMapPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/inks-vault" element={<InksVaultPage />} />
            <Route path="/inks-vault/piece/:id" element={<InksPiecePage />} />
            <Route path="/admin/inks-vault/new" element={<InkEditorPage />} />
            <Route path="/admin/inks-vault/edit/:id" element={<InkEditorPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
