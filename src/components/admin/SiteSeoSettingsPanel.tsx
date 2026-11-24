import { useEffect, useState, type FormEvent } from "react";
import { Globe2, Link2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SITE_SEO_SETTINGS, useSiteSeoSettings, type SiteSeoSocialLink } from "@/contexts/SiteSeoContext";

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
              <div key={`${index}-${link.platform}`} className="grid gap-3 sm:grid-cols-[minmax(140px,0.7fr)_minmax(0,1.7fr)_auto]">
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
    </section>
  );
};