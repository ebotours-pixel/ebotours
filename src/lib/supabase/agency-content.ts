
"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAgencyId } from "@/lib/supabase/agencies";
import { HomeContent } from "@/types";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";

export type PageSeoSettings = {
  title?: string;
  description?: string;
  keywords?: string;
};

export type SiteSeoSettings = {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  description?: string;
  keywords?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  faviconUrl?: string;
};

export type AgencySettingsData = {
  agencyName?: string;
  phoneNumber?: string;
  contactEmail?: string;
  address?: string;
  tagline?: string;
  navLinks?: { label: string; href: string }[];
  aboutUs?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  paymentMethods?: {
    cash?: boolean;
    online?: boolean;
    defaultMethod?: "cash" | "online";
  };
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
  };
  seo?: {
    site?: SiteSeoSettings;
    home?: PageSeoSettings;
    about?: PageSeoSettings;
    contact?: PageSeoSettings;
    tours?: PageSeoSettings;
    services?: PageSeoSettings;
    blog?: PageSeoSettings;
    destination?: PageSeoSettings;
    tailorMade?: PageSeoSettings;
  };
  tourDestinations?: string[];
  tourCategories?: string[];
};

export async function getAgencySettings() {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { data, error } = await supabase
    .from("settings")
    .select("data, logo_url")
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching agency settings:", error);
    return null;
  }

  return data
    ? {
        data: data.data as AgencySettingsData,
        logo_url: data.logo_url as string | null,
      }
    : null;
}

export async function updateAgencySettings(
  settingsData: AgencySettingsData,
  logoUrl?: string | null
) {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  // Check if settings row exists for this agency
  const existing = await getAgencySettings();

  const payload = {
    data: settingsData,
    logo_url: logoUrl,
    updated_at: new Date().toISOString(),
    agency_id: agencyId,
  };

  let error;
  if (existing) {
    // Update
    const { error: updateError } = await supabase
      .from("settings")
      .update(payload)
      .eq("agency_id", agencyId);
    error = updateError;
  } else {
    // Insert
    const { error: insertError } = await supabase
      .from("settings")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    throw new Error(`Failed to save settings: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/tours");
  revalidatePath("/services");
  revalidatePath("/blog");
  revalidatePath("/destination");
  revalidatePath("/tailor-made");
  revalidatePath("/admin/settings");
}

export async function getHomePageContent() {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { data, error } = await supabase
    .from("home_page_content")
    .select("data")
    .eq("agency_id", agencyId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching home page content:", error);
    return null;
  }

  return data ? (data.data as HomeContent) : null;
}

export async function updateHomePageContent(content: HomeContent) {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const existing = await getHomePageContent();

  const payload = {
    data: content,
    updated_at: new Date().toISOString(),
    agency_id: agencyId,
  };

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from("home_page_content")
      .update(payload)
      .eq("agency_id", agencyId);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("home_page_content")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    throw new Error(`Failed to save home page content: ${error.message}`);
  }

  revalidatePath("/");
}

export async function getPageMetadata(
  page:
    | "home"
    | "about"
    | "contact"
    | "tours"
    | "services"
    | "blog"
    | "destination"
    | "tailorMade",
  defaults?: { title?: string; description?: string }
): Promise<Metadata> {
  let settings;
  try {
    settings = await getAgencySettings();
  } catch {
    // ignore
  }

  const site = settings?.data?.seo?.site;
  const seo = settings?.data?.seo?.[page];
  
  const siteName =
    site?.siteName ||
    settings?.data?.agencyName ||
    "Travel Agency";

  const title =
    seo?.title ||
    defaults?.title ||
    site?.defaultTitle ||
    siteName;
  const description =
    seo?.description ||
    defaults?.description ||
    site?.description ||
    "";

  const keywordsSource = seo?.keywords || site?.keywords;
  const keywords = keywordsSource
    ? keywordsSource.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
  };
}
