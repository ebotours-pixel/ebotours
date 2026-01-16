import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/supabase/tours";
import { TourEditClient } from "./tour-edit-client";
import { getAgencySettings } from "@/lib/supabase/agency-content";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  const settings = await getAgencySettings();

  if (!tour) {
    notFound();
  }

  const categories = settings?.data?.tourCategories || [
    "Adventure", "Relaxation", "Cultural", "Culinary", "Family", "Honeymoon", "Package", "Daily"
  ];
  
  const destinations = settings?.data?.tourDestinations || [
    "Cairo", "Luxor", "Aswan", "Sharm El Sheikh", "Hurghada", "Alexandria"
  ];

  return <TourEditClient tour={tour} categories={categories} destinations={destinations} />;
}

