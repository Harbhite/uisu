import { useLocation } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { resolvePageMetadata } from "../../supabase/functions/_shared/siteSeo";

/** Supplies metadata on every route; page-level SEO retains its specific details. */
export const RouteSeoFallback = () => {
  const { pathname } = useLocation();
  const metadata = resolvePageMetadata(pathname);
  return <SEO {...metadata} url={pathname} />;
};