import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { DEFAULT_SITE_DETAILS, normalizeSocialProfiles } from "../../supabase/functions/_shared/siteSeo";

export interface SiteSeoSocialLink {
  platform: string;
  url: string;
}

export interface SiteSeoSettings {
  siteName: string;
  siteDescription: string;
  socialLinks: SiteSeoSocialLink[];
}

export const DEFAULT_SITE_SEO_SETTINGS: SiteSeoSettings = DEFAULT_SITE_DETAILS;

interface SiteSeoContextValue {
  settings: SiteSeoSettings;
  isLoading: boolean;
  saveSettings: (settings: SiteSeoSettings) => Promise<SiteSeoSettings>;
}

const SiteSeoContext = createContext<SiteSeoContextValue | null>(null);

const normalizeSettings = (row: {
  site_name?: string | null;
  site_description?: string | null;
  social_links?: unknown;
}): SiteSeoSettings => {
  const links = Array.isArray(row.social_links)
    ? row.social_links.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const candidate = item as Record<string, unknown>;
        if (typeof candidate.platform !== "string" || typeof candidate.url !== "string") return [];
        return [{ platform: candidate.platform, url: candidate.url }];
      })
    : DEFAULT_SITE_SEO_SETTINGS.socialLinks;

  return {
    siteName: row.site_name?.trim() || DEFAULT_SITE_SEO_SETTINGS.siteName,
    siteDescription: row.site_description?.trim() || DEFAULT_SITE_SEO_SETTINGS.siteDescription,
    socialLinks: normalizeSocialProfiles(links),
  };
};

export const SiteSeoProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState(DEFAULT_SITE_SEO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_seo_settings")
          .select("site_name, site_description, social_links")
          .eq("id", true)
          .maybeSingle();
        if (error) throw error;
        if (active && data) setSettings(normalizeSettings(data));
      } catch (error) {
        console.warn("Site search settings could not be loaded; using the saved defaults.", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = useCallback(async (nextSettings: SiteSeoSettings) => {
    const { data, error } = await supabase
      .from("site_seo_settings")
      .upsert([{
        id: true,
        site_name: nextSettings.siteName.trim(),
        site_description: nextSettings.siteDescription.trim(),
        social_links: nextSettings.socialLinks.map(({ platform, url }) => ({ platform, url })) as Json,
      }], { onConflict: "id" })
      .select("site_name, site_description, social_links")
      .single();

    if (error) throw error;
    const savedSettings = normalizeSettings(data);
    setSettings(savedSettings);
    return savedSettings;
  }, []);

  return (
    <SiteSeoContext.Provider value={{ settings, isLoading, saveSettings }}>
      {children}
    </SiteSeoContext.Provider>
  );
};

export const useSiteSeoSettings = () => {
  const context = useContext(SiteSeoContext);
  if (!context) {
    throw new Error("useSiteSeoSettings must be used inside SiteSeoProvider");
  }
  return context;
};