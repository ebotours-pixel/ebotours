import { getUpsellItemById } from "@/lib/supabase/upsell-items";
import { notFound } from "next/navigation";
import { ServiceDetailsClient } from "./service-details-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getUpsellItemById(id);

  if (!service || service.type !== "service") {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: service.name,
    description: service.description?.substring(0, 160) || `Book ${service.name} with Tix and Trips Egypt.`,
  };
}

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

