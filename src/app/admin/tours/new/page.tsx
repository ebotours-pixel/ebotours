import { getAgencySettings } from "@/lib/supabase/agency-content";
import { NewTourClient } from "./new-tour-client";

export default async function NewTourPage() {
  const settings = await getAgencySettings();
  
  const categories = settings?.data?.tourCategories || [
    "Adventure", "Relaxation", "Cultural", "Culinary", "Family", "Honeymoon", "Package", "Daily"
  ];
  
  const destinations = settings?.data?.tourDestinations || [
    "Cairo", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Alexandria"
  ];

  return <NewTourClient categories={categories} destinations={destinations} />;
}