import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import type { LucideIcon } from "lucide-react";
import {
  Users, FileText, Calendar, BookOpen, Building2, Map, Megaphone,
  GraduationCap, Shield, Search, Home, History, Vote, MessageSquare,
  Wallet, BookMarked, Settings,
} from "lucide-react";

interface CommandRoute {
  label: string;
  path: string;
  icon: LucideIcon;
  keywords: string[];
  group: string;
}

const routes: CommandRoute[] = [
  { label: "Home", path: "/", icon: Home, keywords: ["home", "landing", "main"], group: "Navigation" },
  { label: "Search", path: "/search", icon: Search, keywords: ["search", "find"], group: "Navigation" },
  { label: "Current Leaders", path: "/current-leaders", icon: Users, keywords: ["leaders", "executives", "president", "sug"], group: "The Union" },
  { label: "Past Leaders", path: "/past-leaders", icon: History, keywords: ["past", "former", "archive", "history"], group: "The Union" },
  { label: "Governance", path: "/governance", icon: Shield, keywords: ["governance", "structure", "constitution"], group: "The Union" },
  { label: "Constitution", path: "/constitution", icon: BookMarked, keywords: ["constitution", "law", "rules"], group: "The Union" },
  { label: "Documents", path: "/documents", icon: FileText, keywords: ["documents", "records", "files", "pdf"], group: "The Union" },
  { label: "Communities", path: "/communities", icon: Building2, keywords: ["clubs", "societies", "organizations"], group: "Community" },
  { label: "Events", path: "/events", icon: Calendar, keywords: ["events", "calendar", "upcoming"], group: "Community" },
  { label: "Halls of Residence", path: "/halls", icon: Building2, keywords: ["halls", "residence", "hostel"], group: "Community" },
  { label: "Campus Map", path: "/campus-map", icon: Map, keywords: ["map", "campus", "navigate"], group: "Community" },
  { label: "Inks Vault", path: "/inks-vault", icon: BookOpen, keywords: ["inks", "articles", "poetry", "writing", "blog"], group: "Editorial" },
  { label: "Announcements", path: "/announcements", icon: Megaphone, keywords: ["announcements", "news", "updates"], group: "Editorial" },
  { label: "Resources", path: "/resources", icon: GraduationCap, keywords: ["resources", "study", "academic"], group: "Resources" },
  { label: "StudyBuddy", path: "/resources/study-buddy", icon: GraduationCap, keywords: ["study", "buddy", "ai", "tutor"], group: "Resources" },
  { label: "AI Quiz", path: "/resources/ai-quiz", icon: GraduationCap, keywords: ["quiz", "test", "ai"], group: "Resources" },
  { label: "Flashcards", path: "/resources/flashcards", icon: GraduationCap, keywords: ["flashcards", "study", "revision"], group: "Resources" },
  { label: "GPA Calculator", path: "/resources/gpa-calculator", icon: GraduationCap, keywords: ["gpa", "calculator", "grades"], group: "Resources" },
  { label: "Polls & Voting", path: "/polls", icon: Vote, keywords: ["polls", "voting", "election"], group: "Community" },
  { label: "Complaints", path: "/complaints", icon: MessageSquare, keywords: ["complaints", "petition", "feedback"], group: "Community" },
  { label: "Budget Tracker", path: "/budget", icon: Wallet, keywords: ["budget", "finance", "money", "expenses"], group: "Resources" },
  { label: "Lost & Found", path: "/lost-found", icon: Search, keywords: ["lost", "found", "missing"], group: "Community" },
  { label: "Admin Dashboard", path: "/admin", icon: Settings, keywords: ["admin", "dashboard", "manage"], group: "Admin" },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    // / to focus search (only when not in an input)
    if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
      e.preventDefault();
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Group routes
  const groups = routes.reduce<Record<string, CommandRoute[]>>((acc, route) => {
    if (!acc[route.group]) acc[route.group] = [];
    acc[route.group].push(route);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, features, tools..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groups).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((route) => (
              <CommandItem
                key={route.path}
                value={`${route.label} ${route.keywords.join(" ")}`}
                onSelect={() => handleSelect(route.path)}
                className="cursor-pointer"
              >
                <route.icon size={16} className="mr-2 shrink-0" />
                <span>{route.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <div className="border-t border-border px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-4">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↑↓</kbd> Navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> Open
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> Close
        </span>
      </div>
    </CommandDialog>
  );
};
