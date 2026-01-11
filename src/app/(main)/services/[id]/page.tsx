import { getUpsellItemById } from "@/lib/supabase/upsell-items";
import { notFound } from "next/navigation";
import { ServiceDetailsClient } from "./service-details-client";

export const dynamic = "force-dynamic";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getUpsellItemById(id);

  if (!service || service.type !== "service") {
    return notFound();
  }

  return <ServiceDetailsClient service={service} />;
}

