import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Copy, ExternalLink, Globe2, Link2, Plus, Save, Search, Share2, TriangleAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SITE_SEO_SETTINGS, useSiteSeoSettings, type SiteSeoSocialLink } from "@/contexts/SiteSeoContext";
import { auditSeoRoutes, buildSeoPagePreview, buildSocialMetaTags, getSeoRouteIssues, SEO_DESCRIPTION_LENGTH, SEO_ROUTE_PATHS, SEO_TITLE_LENGTH } from "@/lib/siteSeoPanel";
import { routeMetadata } from "../../../supabase/functions/_shared/siteSeo";

const isWebAddress = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

export const SiteSeoSettingsPanel = () => {
  const { settings, isLoading, saveSettings } = useSiteSeoSettings();
  const { toast } = useToast();
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [socialLinks, setSocialLinks] = useState<SiteSeoSocialLink[]>(settings.socialLinks);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPath, setSelectedPath] = useState("/");
  const [previewMode, setPreviewMode] = useState<"search" | "social">("search");
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const preview = useMemo(() => buildSeoPagePreview(selectedPath, siteName, siteDescription), [selectedPath, siteName, siteDescription]);
  const audit = useMemo(() => auditSeoRoutes(siteName, siteDescription), [siteName, siteDescription]);
  const issueRows = useMemo(() => SEO_ROUTE_PATHS.map((path) => {
    const pagePreview = buildSeoPagePreview(path, siteName, siteDescription);
    return { path, issues: getSeoRouteIssues(pagePreview) };
  }).filter((row) => row.issues.length > 0), [siteName, siteDescription]);
  const visibleIssueRows = showAllIssues ? issueRows : issueRows.slice(0, 8);
  const titleInRange = preview.titleLength >= SEO_TITLE_LENGTH.min && preview.titleLength <= SEO_TITLE_LENGTH.max;
  const descriptionInRange = preview.descriptionLength >= SEO_DESCRIPTION_LENGTH.min && preview.descriptionLength <= SEO_DESCRIPTION_LENGTH.max;

  useEffect(() => {
    setSiteName(settings.siteName);
    setSiteDescription(settings.siteDescription);
    setSocialLinks(settings.socialLinks);
  }, [settings]);

  const updateSocialLink = (index: number, field: keyof SiteSeoSocialLink, value: string) => {
    setSocialLinks((current) => current.map((link, itemIndex) => (
      itemIndex === index ? { ...link, [field]: value } : link
    )));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = siteName.trim();
    const trimmedDescription = siteDescription.trim();

    if (!trimmedName || !trimmedDescription) {
      toast({ title: "Add your site details", description: "The site name and description can’t be empty.", variant: "destructive" });
      return;
    }

    const normalizedLinks = socialLinks
      .map((link) => ({ platform: link.platform.trim(), url: link.url.trim() }))
      .filter((link) => link.platform || link.url);
    const invalidLink = normalizedLinks.find((link) => !link.platform || !isWebAddress(link.url));
    if (invalidLink) {
      toast({ title: "Check the social links", description: "Each link needs a platform name and a valid http or https address.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      await saveSettings({
        siteName: trimmedName,
        siteDescription: trimmedDescription,
        socialLinks: normalizedLinks,
      });
      toast({ title: "Search details saved", description: "Page titles, descriptions, and social preview links now use these settings." });
    } catch (error) {
      toast({
        title: "Couldn’t save search details",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyPageTags = async () => {
    try {
      await navigator.clipboard.writeText(buildSocialMetaTags(preview));
      setCopiedTags(true);
      window.setTimeout(() => setCopiedTags(false), 1800);
      toast({ title: "Page tags copied", description: `Search and social tags for ${preview.path} are ready to paste.` });
    } catch {
      toast({ title: "Couldn’t copy page tags", description: "Allow clipboard access and try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading site settings…</div>;
  }

  return (
    <section className="max-w-4xl space-y-8">
      <div className="flex items-start gap-4 border-b border-border pb-6">
        <div className="rounded-full border border-border p-3 text-ui-blue">
          <Globe2 size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground">Site search & social details</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            These details are shared across page titles, search descriptions, and social previews.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="site-name" className="text-sm font-semibold text-foreground">Site name</label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              maxLength={80}
              required
              placeholder={DEFAULT_SITE_SEO_SETTINGS.siteName}
            />
            <p className="text-xs text-muted-foreground">Appears beside each page title and in social previews.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="site-description" className="text-sm font-semibold text-foreground">Site description</label>
            <Textarea
              id="site-description"
              value={siteDescription}
              onChange={(event) => setSiteDescription(event.target.value)}
              maxLength={320}
              required
              rows={4}
              className="min-h-[120px]"
              placeholder={DEFAULT_SITE_SEO_SETTINGS.siteDescription}
            />
            <div className="flex justify-between gap-4 text-xs text-muted-foreground">
              <span>Added to every page’s search and social description.</span>
              <span>{siteDescription.length}/320</span>
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t border-border pt-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Link2 size={16} className="text-nobel-gold" aria-hidden="true" />
                Social profiles
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">Included in each page’s social and organization details.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSocialLinks((current) => [...current, { platform: "", url: "" }])}
            >
              <Plus size={16} /> Add profile
            </Button>
          </div>

          <div className="space-y-3">
            {socialLinks.length === 0 && (
              <p className="border-l-2 border-border py-2 pl-4 text-sm text-muted-foreground">No social profiles added.</p>
            )}
            {socialLinks.map((link, index) => (
              <div key={index} className="grid gap-3 sm:grid-cols-[minmax(140px,0.7fr)_minmax(0,1.7fr)_auto]">
                <Input
                  aria-label={`Social platform ${index + 1}`}
                  value={link.platform}
                  onChange={(event) => updateSocialLink(index, "platform", event.target.value)}
                  maxLength={40}
                  placeholder="Platform (e.g. Instagram)"
                />
                <Input
                  aria-label={`${link.platform || "Social"} profile address`}
                  value={link.url}
                  onChange={(event) => updateSocialLink(index, "url", event.target.value)}
                  type="url"
                  placeholder="https://…"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${link.platform || "social"} profile`}
                  onClick={() => setSocialLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <Button type="submit" isLoading={isSaving}>
            <Save size={16} /> Save site details
          </Button>
        </div>
      </form>

      <section className="space-y-7 border-t border-border pt-8" aria-labelledby="seo-preview-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 id="seo-preview-heading" className="flex items-center gap-2 text-xl font-serif text-foreground">
              <Search size={18} className="text-nobel-gold" aria-hidden="true" /> Page previews & checks
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Review how registered pages may appear in search and when shared.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyPageTags}>
            {copiedTags ? <Check size={15} /> : <Copy size={15} />}
            {copiedTags ? "Copied" : "Copy page tags"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Pages checked", value: audit.checked },
            { label: "Need attention", value: audit.routesWithIssues },
            { label: "Missing images", value: audit.missingImages },
            { label: "Missing titles", value: audit.missingTitles },
            { label: "Title length", value: audit.titlesOutsideRange },
            { label: "Description length", value: audit.descriptionsOutsideRange },
          ].map((stat) => (
            <div key={stat.label} className="border-l-2 border-border py-1 pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-serif text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid items-start gap-8 xl:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="seo-preview-route" className="text-sm font-semibold text-foreground">Choose a page</label>
              <Select value={selectedPath} onValueChange={setSelectedPath}>
                <SelectTrigger id="seo-preview-route" className="w-full">
                  <SelectValue placeholder="Choose a page" />
                </SelectTrigger>
                <SelectContent>
                  {SEO_ROUTE_PATHS.map((path) => (
                    <SelectItem key={path} value={path}>{path === "/" ? "Homepage" : `${path} — ${routeMetadata[path]?.title ?? "Page"}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
              <h4 className="text-sm font-semibold text-foreground">Sitewide audit</h4>
              <span className="text-xs text-muted-foreground">{issueRows.length} pages flagged</span>
            </div>
            {issueRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No common metadata issues found.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-border border-y border-border">
                {visibleIssueRows.map((row) => (
                  <Button
                    key={row.path}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPath(row.path)}
                    aria-label={`Preview ${row.path}: ${row.issues.map((issue) => issue.message).join(", ")}`}
                    className="h-auto min-h-10 w-full justify-start gap-2 rounded-none px-2 py-2 text-left normal-case tracking-normal text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <TriangleAlert size={14} className="shrink-0 text-accent" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{row.path === "/" ? "Homepage" : row.path}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{row.issues.length} checks</span>
                  </Button>
                ))}
              </div>
            )}
            {issueRows.length > 8 && (
              <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setShowAllIssues((current) => !current)}>
                {showAllIssues ? "Show fewer pages" : `Show all ${issueRows.length} pages`}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">Length checks use common search-preview ranges: titles {SEO_TITLE_LENGTH.min}–{SEO_TITLE_LENGTH.max} characters, descriptions {SEO_DESCRIPTION_LENGTH.min}–{SEO_DESCRIPTION_LENGTH.max}.</p>
          </div>

          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{preview.path}</p>
                <h4 className="mt-1 text-lg font-serif text-foreground">Live metadata preview</h4>
              </div>
              <div className="inline-flex items-center gap-1" role="tablist" aria-label="Preview format">
                <Button type="button" role="tab" aria-selected={previewMode === "search"} variant={previewMode === "search" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("search")}>
                  <Search size={14} /> Search
                </Button>
                <Button type="button" role="tab" aria-selected={previewMode === "social"} variant={previewMode === "social" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("social")}>
                  <Share2 size={14} /> Social
                </Button>
              </div>
            </div>

            {previewMode === "search" ? (
              <div className="space-y-4">
                <div className="space-y-2 border border-border bg-background p-4 sm:p-5">
                  <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    {preview.url} <ExternalLink size={11} aria-hidden="true" />
                  </a>
                  <p className="break-words text-xl font-medium text-primary">{preview.title}</p>
                  <p className="text-sm text-muted-foreground">{preview.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`border px-2.5 py-1 ${titleInRange ? 'border-border text-muted-foreground' : 'border-accent text-foreground'}`}>
                    Title {preview.titleLength} chars {titleInRange ? "· in range" : "· review length"}
                  </span>
                  <span className={`border px-2.5 py-1 ${descriptionInRange ? 'border-border text-muted-foreground' : 'border-accent text-foreground'}`}>
                    Description {preview.descriptionLength} chars {descriptionInRange ? "· in range" : "· review length"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="max-w-[560px] overflow-hidden border border-border bg-background">
                {preview.image ? (
                  <img src={preview.image} alt={`Social preview image for ${preview.title}`} className="aspect-[1200/630] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[1200/630] items-center justify-center bg-muted text-sm text-muted-foreground">No social image is set for this page.</div>
                )}
                <div className="space-y-1 border-t border-border p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">UISU.SPACE</p>
                  <p className="font-semibold text-foreground">{preview.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{preview.description}</p>
                </div>
              </div>
            )}

            <details className="border-t border-border pt-3">
              <summary className="cursor-pointer text-sm font-medium text-primary">View generated search and social tags</summary>
              <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-all bg-muted p-4 text-xs text-foreground">{buildSocialMetaTags(preview)}</pre>
            </details>
          </div>
        </div>
      </section>
    </section>
  );
};