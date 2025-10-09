import { getUpsellItemById } from "@/lib/supabase/upsell-items";
import { notFound } from "next/navigation";
import { UpsellItemEditClient } from "./upsell-item-edit-client";

interface EditUpsellItemPageProps {
  params: {
    id: string;
  };
}

export default async function EditUpsellItemPage({
  params,
}: EditUpsellItemPageProps) {
  const upsellItem = await getUpsellItemById(params.id);

  if (!upsellItem) {
    notFound();
  }

  return <UpsellItemEditClient initialData={upsellItem} id={params.id} />;
}
