import { getTourBySlug } from "@/lib/supabase/tours";
import { notFound } from "next/navigation";
import { TourDetailsClient } from "@/components/tour-details-client";

interface TourDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function TourDetailsPage({
  params,
}: TourDetailsPageProps) {
  const { id } = await Promise.resolve(params);
  // The slug is passed as `id` from the folder name [id]
  const tour = await getTourBySlug(id);

  if (!tour) {
    notFound();
  }

  return <TourDetailsClient tour={tour} />;
}
