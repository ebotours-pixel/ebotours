"use client";

import { UpsellItemForm } from "@/components/admin/upsell-item-form";
import { updateUpsellItem } from "@/lib/supabase/upsell-items";
import type { UpsellItem } from "@/types";

interface UpsellItemEditClientProps {
  initialData: UpsellItem;
  id: string;
}

export function UpsellItemEditClient({
  initialData,
  id,
}: UpsellItemEditClientProps) {
  const onSubmit = async (data: any) => {
    await updateUpsellItem(id, data);
  };

  return (
    <UpsellItemForm
      initialData={initialData}
      onSubmit={onSubmit}
      formType="edit"
    />
  );
}
