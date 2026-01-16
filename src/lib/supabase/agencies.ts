
import { createClient } from "@/lib/supabase/server";
import { Agency } from "@/types";
import { cache } from "react";
import { cookies } from "next/headers";

// Fallback slug if env var is missing (useful for dev or default deployment)
const DEFAULT_AGENCY_SLUG = "tix-and-trips";

export const getCurrentAgencySlug = async () => {
  const cookieStore = await cookies();
  const overrideSlug = cookieStore.get("admin_agency_override")?.value;
  if (overrideSlug) {
    return overrideSlug;
  }
  return process.env.NEXT_PUBLIC_AGENCY_SLUG || DEFAULT_AGENCY_SLUG;
};

export const getCurrentAgency = cache(async (): Promise<Agency | null> => {
  const slug = await getCurrentAgencySlug();
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("agencies")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching agency with slug ${slug}:`, error);
      return null;
    }

    if (!data) {
      console.warn(`No agency found for slug: ${slug}`);
      return null;
    }

    // Transform snake_case to camelCase manually or rely on a helper if available.
    // Assuming simple mapping for now.
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      settings: data.settings || {},
      status: data.status,
      createdAt: data.created_at,
    } as Agency;
  } catch (error) {
    console.error("Unexpected error fetching current agency:", error);
    return null;
  }
});

/**
 * Helper to get the current Agency ID directly.
 * Throws if no agency is found, as most operations require an agency context.
 */
export const getCurrentAgencyId = cache(async (): Promise<string> => {
  const agency = await getCurrentAgency();
  if (!agency) {
    const slug = await getCurrentAgencySlug();
    throw new Error(`Current agency configuration is invalid. Slug: ${slug}`);
  }
  return agency.id;
});
