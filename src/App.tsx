import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PageWrapper from "./components/PageWrapper";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Lazy load pages for better performance
const GovernancePage = lazy(() => import("./pages/GovernancePage"));
const CommitteeDetailPage = lazy(() => import("./pages/CommitteeDetailPage"));
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
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const HallDetailPage = lazy(() => import("./pages/halls/HallDetailPage"));
const HallsPage = lazy(() => import("./pages/HallsPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const AcademicBankPage = lazy(() => import("./pages/resources/AcademicBankPage"));
const CareerHubPage = lazy(() => import("./pages/resources/CareerHubPage"));
const ScholarshipPage = lazy(() => import("./pages/resources/ScholarshipPage"));
const MentalWellnessPage = lazy(() => import("./pages/resources/MentalWellnessPage"));
const StudyToolsPage = lazy(() => import("./pages/resources/StudyToolsPage"));
const SkillUpPage = lazy(() => import("./pages/resources/SkillUpPage"));
const StudentMartPage = lazy(() => import("./pages/resources/StudentMartPage"));
const FreshersGuidePage = lazy(() => import("./pages/resources/FreshersGuidePage"));
const CareerPathfinderPage = lazy(() => import("./pages/resources/CareerPathfinderPage"));
const CampusHealthPage = lazy(() => import("./pages/resources/CampusHealthPage"));
const GPACalculatorPage = lazy(() => import("./pages/resources/GPACalculatorPage"));
const CalculatorSuitePage = lazy(() => import("./pages/resources/CalculatorSuitePage"));
const StudyBuddyPage = lazy(() => import("./pages/resources/StudyBuddyPage"));
const AIQuizPage = lazy(() => import("./pages/resources/AIQuizPage"));
const FlashcardPage = lazy(() => import("./pages/resources/FlashcardPage"));
const StudyAidePage = lazy(() => import("./pages/resources/StudyAidePage"));
const TimetableBuilderPage = lazy(() => import("./pages/resources/TimetableBuilderPage"));
const GPATrackerPage = lazy(() => import("./pages/resources/GPATrackerPage"));
const PastQuestionsPage = lazy(() => import("./pages/resources/PastQuestionsPage"));
const StyleGuidePage = lazy(() => import("./pages/StyleGuidePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const ConstitutionPage = lazy(() => import("./pages/ConstitutionPage"));
const ProfileCardPage = lazy(() => import("./pages/ProfileCardPage"));
const TutorialsLayout = lazy(() => import("./components/tutorials/TutorialsLayout"));
const TutorialsLandingPage = lazy(() => import("./pages/tutorials/TutorialsLandingPage"));
const TutorialCatalogPage = lazy(() => import("./pages/tutorials/TutorialCatalogPage"));
const TutorialDetailPage = lazy(() => import("./pages/tutorials/TutorialDetailPage"));
const TutorProfilePage = lazy(() => import("./pages/tutorials/TutorProfilePage"));
const UploadTutorialPage = lazy(() => import("./pages/tutorials/UploadTutorialPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const FormsPage = lazy(() => import("./pages/FormsPage"));
const FormBuilderPage = lazy(() => import("./pages/FormBuilderPage"));
const FormSubmitPage = lazy(() => import("./pages/FormSubmitPage"));
const FormResponsesPage = lazy(() => import("./pages/FormResponsesPage"));
const PollsPage = lazy(() => import("./pages/PollsPage"));
const EventCheckinPage = lazy(() => import("./pages/EventCheckinPage"));
const LostFoundPage = lazy(() => import("./pages/LostFoundPage"));
const AcademicCalendarPage = lazy(() => import("./pages/AcademicCalendarPage"));
const ComplaintsPage = lazy(() => import("./pages/ComplaintsPage"));
const BudgetTrackerPage = lazy(() => import("./pages/BudgetTrackerPage"));
const SitemapPage = lazy(() => import("./pages/SitemapPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const AlumniNetworkPage = lazy(() => import("./pages/resources/AlumniNetworkPage"));
const AcademicPlannerPage2 = lazy(() => import("./pages/AcademicPlannerPage"));
const ConfessionsPage = lazy(() => import("./pages/ConfessionsPage"));
const ElectionsPage = lazy(() => import("./pages/ElectionsPage"));

// Gazette
const GazetteLayout = lazy(() => import("./components/gazette/GazetteLayout"));
const GazetteLandingPage = lazy(() => import("./pages/gazette/GazetteLandingPage"));
const GazetteArticlePage = lazy(() => import("./pages/gazette/GazetteArticlePage"));
const GazetteEditorPage = lazy(() => import("./pages/gazette/GazetteEditorPage"));
const GazetteIssuesPage = lazy(() => import("./pages/gazette/GazetteIssuesPage"));
const GazetteIssuePage = lazy(() => import("./pages/gazette/GazetteIssuePage"));
const GazetteCategoryPage = lazy(() => import("./pages/gazette/GazetteCategoryPage"));
const GazetteEditorialBoardPage = lazy(() => import("./pages/gazette/GazetteEditorialBoardPage"));
const GazetteBookmarksPage = lazy(() => import("./pages/gazette/GazetteBookmarksPage"));
const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  return (
    // AnimatePresence removed to fix navigation getting stuck
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/governance" element={<PageWrapper><GovernancePage /></PageWrapper>} />
        <Route path="/committee/:id" element={<PageWrapper><CommitteeDetailPage /></PageWrapper>} />
        <Route path="/past-leaders" element={<PageWrapper><PastLeadersPage /></PageWrapper>} />
        <Route path="/current-leaders" element={<PageWrapper><CurrentLeadersPage /></PageWrapper>} />
        <Route path="/current-leaders/:id" element={<PageWrapper><LeaderDetailPage /></PageWrapper>} />
        <Route path="/documents" element={<PageWrapper><DocumentsPage /></PageWrapper>} />
        <Route path="/campus-map" element={<PageWrapper><CampusMapPage /></PageWrapper>} />
        <Route path="/communities" element={<PageWrapper><CommunitiesPage /></PageWrapper>} />
        <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/announcements" element={<PageWrapper><AnnouncementsPage /></PageWrapper>} />
        <Route path="/inks-vault" element={<PageWrapper><InksVaultPage /></PageWrapper>} />
        <Route path="/inks-vault/piece/:id" element={<PageWrapper><InksPiecePage /></PageWrapper>} />
        <Route path="/admin/inks-vault/new" element={<PageWrapper><InkEditorPage /></PageWrapper>} />
        <Route path="/admin/inks-vault/edit/:id" element={<PageWrapper><InkEditorPage /></PageWrapper>} />
        <Route path="/profile/:id" element={<PageWrapper><ProfilePage /></PageWrapper>} />
        <Route path="/halls" element={<PageWrapper><HallsPage /></PageWrapper>} />
        <Route path="/governance/hall/:id" element={<PageWrapper><HallDetailPage /></PageWrapper>} />

        {/* Resources Routes */}
        <Route path="/resources" element={<PageWrapper><ResourcesPage /></PageWrapper>} />
        <Route path="/resources/academic-bank" element={<PageWrapper><AcademicBankPage /></PageWrapper>} />
        <Route path="/resources/career-hub" element={<PageWrapper><CareerHubPage /></PageWrapper>} />
        <Route path="/resources/scholarships" element={<PageWrapper><ScholarshipPage /></PageWrapper>} />
        <Route path="/resources/mental-wellness" element={<PageWrapper><MentalWellnessPage /></PageWrapper>} />
        <Route path="/resources/study-tools" element={<PageWrapper><StudyToolsPage /></PageWrapper>} />
        <Route path="/resources/skill-up" element={<PageWrapper><SkillUpPage /></PageWrapper>} />
        <Route path="/resources/student-mart" element={<PageWrapper><StudentMartPage /></PageWrapper>} />
        <Route path="/resources/freshers-guide" element={<PageWrapper><FreshersGuidePage /></PageWrapper>} />
        <Route path="/resources/career-pathfinder" element={<PageWrapper><CareerPathfinderPage /></PageWrapper>} />
        <Route path="/resources/campus-health" element={<PageWrapper><CampusHealthPage /></PageWrapper>} />
        <Route path="/resources/gpa-calculator" element={<PageWrapper><GPACalculatorPage /></PageWrapper>} />
        <Route path="/resources/calculator-suite" element={<PageWrapper><CalculatorSuitePage /></PageWrapper>} />
        <Route path="/resources/study-buddy" element={<PageWrapper><StudyBuddyPage /></PageWrapper>} />
        <Route path="/resources/ai-quiz" element={<PageWrapper><AIQuizPage /></PageWrapper>} />
        <Route path="/resources/flashcards" element={<PageWrapper><FlashcardPage /></PageWrapper>} />
        <Route path="/resources/study-aide" element={<PageWrapper><StudyAidePage /></PageWrapper>} />
        <Route path="/resources/alumni-network" element={<PageWrapper><AlumniNetworkPage /></PageWrapper>} />

        {/* Style Guide - only linked from footer */}
        <Route path="/style-guide" element={<PageWrapper><StyleGuidePage /></PageWrapper>} />
        
        {/* Global Search */}
        <Route path="/search" element={<PageWrapper><SearchPage /></PageWrapper>} />

        {/* History Page */}
        <Route path="/history" element={<PageWrapper><HistoryPage /></PageWrapper>} />

        {/* Constitution Page */}
        <Route path="/constitution" element={<PageWrapper><ConstitutionPage /></PageWrapper>} />

        {/* Profile Card Showcase */}
        <Route path="/profile-card" element={<PageWrapper><ProfileCardPage /></PageWrapper>} />

        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
        <Route path="/terms-of-service" element={<PageWrapper><TermsOfServicePage /></PageWrapper>} />
        
        {/* Newsletter */}
        <Route path="/unsubscribe" element={<PageWrapper><UnsubscribePage /></PageWrapper>} />
        <Route path="/newsletter" element={<NewsletterPage />} />

        {/* Forms */}
        <Route path="/forms" element={<PageWrapper><FormsPage /></PageWrapper>} />
        <Route path="/forms/edit/:id" element={<FormBuilderPage />} />
        <Route path="/forms/s/:token" element={<FormSubmitPage />} />
        <Route path="/forms/responses/:id" element={<FormResponsesPage />} />

        {/* Polls & Voting */}
        <Route path="/polls" element={<PageWrapper><PollsPage /></PageWrapper>} />

        {/* Event Check-in (Staff) */}
        <Route path="/events/checkin/:eventId" element={<PageWrapper><EventCheckinPage /></PageWrapper>} />

        {/* Community Features */}
        <Route path="/lost-found" element={<PageWrapper><LostFoundPage /></PageWrapper>} />
        <Route path="/academic-calendar" element={<PageWrapper><AcademicCalendarPage /></PageWrapper>} />
        <Route path="/complaints" element={<PageWrapper><ComplaintsPage /></PageWrapper>} />
        <Route path="/budget" element={<PageWrapper><BudgetTrackerPage /></PageWrapper>} />
        <Route path="/sitemap" element={<PageWrapper><SitemapPage /></PageWrapper>} />
        <Route path="/feedback" element={<PageWrapper><FeedbackPage /></PageWrapper>} />
        <Route path="/planner" element={<PageWrapper><AcademicPlannerPage2 /></PageWrapper>} />
        <Route path="/confessions" element={<PageWrapper><ConfessionsPage /></PageWrapper>} />
        <Route path="/elections" element={<PageWrapper><ElectionsPage /></PageWrapper>} />
        {/* Tutorials Ecosystem (Standalone Subdomain feel) */}
        <Route path="/tutorials" element={<TutorialsLayout />}>
          <Route index element={<TutorialsLandingPage />} />
          <Route path="catalog" element={<TutorialCatalogPage />} />
          <Route path=":id" element={<TutorialDetailPage />} />
          <Route path="tutor/:id" element={<TutorProfilePage />} />
          <Route path="upload" element={<UploadTutorialPage />} />
        </Route>

        {/* Gazette Ecosystem */}
        <Route path="/gazette" element={<GazetteLayout />}>
          <Route index element={<GazetteLandingPage />} />
          <Route path="article/:slug" element={<GazetteArticlePage />} />
          <Route path="issues" element={<GazetteIssuesPage />} />
          <Route path="issues/:id" element={<GazetteIssuePage />} />
          <Route path="category/:cat" element={<GazetteCategoryPage />} />
          <Route path="editorial-board" element={<GazetteEditorialBoardPage />} />
          <Route path="bookmarks" element={<GazetteBookmarksPage />} />
          <Route path="editor/new" element={<GazetteEditorPage />} />
          <Route path="editor/:id" element={<GazetteEditorPage />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
  );
};

const CommandPalette = lazy(() => import("./components/CommandPalette").then(m => ({ default: m.CommandPalette })));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <CommandPalette />
          <AppRoutes />
          <PWAInstallPrompt />
        </Suspense>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
