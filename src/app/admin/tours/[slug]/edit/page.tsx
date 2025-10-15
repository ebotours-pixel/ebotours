import { getTourBySlug } from "@/lib/supabase/tours";
import { notFound } from "next/navigation";
import { TourEditClient } from "./tour-edit-client";

interface EditTourPageProps {
  params: {
    slug: string;
  };
}

export default async function EditTourPage({
  params,
}: EditTourPageProps) {
  const { slug } = params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  return <TourEditClient tour={tour} />;
}
