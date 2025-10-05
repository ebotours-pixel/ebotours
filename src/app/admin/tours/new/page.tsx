'use client';

import { TourForm } from "@/components/admin/tour-form";
import { addTour } from "@/lib/supabase/tours";
import { z } from "zod";

// We can infer the schema from the form component itself if needed, but for now, we pass the action directly.

export default function NewTourPage() {

  // The TourForm component is set up to receive a server action directly in its onSubmit prop.
  // react-hook-form will handle the form data and pass it to the action.
  const handleSave = async (data: any) => {
    try {
      await addTour(data);
    } catch (error) {
      // TODO: Add user-facing error handling, e.g., a toast notification
      console.error("Failed to save tour:", error);
    }
  };

  return (
    <TourForm onSubmit={handleSave} formType="new" />
  );
}