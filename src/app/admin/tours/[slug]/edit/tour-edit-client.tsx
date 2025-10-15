"use client";

import { TourForm, formSchema } from "@/components/admin/tour-form";
import { updateTour } from "@/lib/supabase/tours";
import type { Tour } from "@/types";
import * as z from "zod";

interface TourEditClientProps {
  tour: Tour;
}

export function TourEditClient({ tour }: TourEditClientProps) {
  const handleUpdateTour = async (values: z.infer<typeof formSchema>) => {
    const transformedValues = {
      ...values,
      highlights: values.highlights?.map((h) => JSON.stringify({ value: h.value })).filter(Boolean),
      includes: values.includes?.map((i) => JSON.stringify({ value: i.value })).filter(Boolean),
      excludes: values.excludes?.map((e) => JSON.stringify({ value: e.value })).filter(Boolean),
    };
    await updateTour(tour.id, transformedValues as Omit<Tour, "id">);
  };

  return (
    <TourForm
      initialData={tour}
      onSubmit={handleUpdateTour}
      formType="edit"
    />
  );
}
