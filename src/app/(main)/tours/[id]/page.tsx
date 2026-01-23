import { getTourBySlug } from "@/lib/supabase/tours";
import { notFound } from "next/navigation";
import { TourDetailsClient } from "@/components/tour-details-client";
import type { Metadata } from "next";
import { getAgencySettings } from "@/lib/supabase/agency-content";

interface TourDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TourDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const tour = await getTourBySlug(id);

  let brand = "our agency";
  try {
    const settings = await getAgencySettings();
    const agencyName = settings?.data?.agencyName || "";
    brand = agencyName.trim() || brand;
  } catch {
    brand = brand;
  }

  if (!tour) {
    return {
      title: "Tour Not Found",
    };
  }

  const description =
    tour.description?.substring(0, 160) || `Book ${tour.name} with ${brand}.`;

  return {
    title: tour.name,
    description,
    openGraph: {
      title: tour.name,
      description: tour.description?.substring(0, 200) || description,
      images: tour.images && tour.images.length > 0 ? [tour.images[0]] : [],
    },
  };
}

export default async function TourDetailsPage({
  params,
}: TourDetailsPageProps) {
  const { id } = await params;
  // The slug is passed as `id` from the folder name [id]
  const tour = await getTourBySlug(id);

  if (!tour) {
    notFound();
  }

  return <TourDetailsClient tour={tour} />;
}

