import { useQuery } from "@tanstack/react-query";
import {
  fetchSiteSettings,
  SITE_SETTINGS_FALLBACK,
  SITE_SETTINGS_QUERY_KEY
} from "../lib/api";

export function useSiteSettings() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
    placeholderData: SITE_SETTINGS_FALLBACK,
    staleTime: 60_000
  });
}
