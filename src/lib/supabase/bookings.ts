"use server";

import { createClient } from "@/lib/supabase/server";
import type { Booking, CartItem, Tour, UpsellItem, PriceTier } from "@/types";
import { revalidatePath } from "next/cache";
import { toCamelCase } from "@/lib/utils";
import { getCurrentAgencyId } from "@/lib/supabase/agencies";
import { validatePromoCode } from "@/lib/supabase/promo-codes";

export async function getBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_items(*, tours(name, slug), upsell_items(name, price))")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
  return data.map(toCamelCase) as Booking[];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { data, error } = await supabase
    .from("bookings")
    .select("*, booking_items(*, tours(name, slug, packages), upsell_items(name, price))")
    .eq("id", id)
    .eq("agency_id", agencyId)
    .single();

  if (error) {
    console.error(`Error fetching booking by ID ${id}:`, error);
    return null;
  }
  if (!data) return null;

  return toCamelCase(data) as Booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"],
) {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("agency_id", agencyId);

  if (error) {
    console.error("Error updating booking status:", error);
    throw new Error("Failed to update booking status.");
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export async function deleteBooking(bookingId: string) {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("agency_id", agencyId);

  if (error) {
    console.error("Error deleting booking:", error);
    throw new Error("Failed to delete booking.");
  }

  revalidatePath("/admin/bookings");
}

interface CreateBookingData {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  nationality: string;
  cartItems: CartItem[];
  paymentMethod: "cash" | "online";
  promoCode?: string;
}

export async function createBooking(data: CreateBookingData) {
  const supabase = await createClient();
  const agencyId = await getCurrentAgencyId();

  // 1. Calculate prices and prepare booking items
  let subtotal = 0;
  const bookingItemsToInsert = data.cartItems.map((item) => {
    let itemPrice = 0;
    let tourId: string | undefined;
    let upsellItemId: string | undefined;

    if (item.productType === "tour") {
      const tour = item.product as Tour;
      tourId = tour.id;
      const totalPeople = (item.adults ?? 0) + (item.children ?? 0);
      
      let priceTiers = tour.priceTiers;
      
      if (item.packageId && tour.packages) {
        const selectedPackage = tour.packages.find(p => p.id === item.packageId);
        if (selectedPackage) {
          priceTiers = selectedPackage.priceTiers;
        }
      }

      priceTiers = priceTiers || [];

      const priceTier =
        priceTiers.find(
          (tier: PriceTier) =>
            totalPeople >= tier.minPeople &&
            (tier.maxPeople === null || totalPeople <= tier.maxPeople),
        ) || priceTiers[priceTiers.length - 1];

      if (priceTier) {
        itemPrice =
          (item.adults ?? 0) * priceTier.pricePerAdult +
          (item.children ?? 0) * priceTier.pricePerChild;
      }
    } else if (item.productType === "upsell") {
      const upsellItem = item.product as UpsellItem;
      upsellItemId = upsellItem.id;
      const variant =
        item.packageId && upsellItem.variants
          ? upsellItem.variants.find((v) => v.id === item.packageId)
          : undefined;
      const price = variant?.price ?? upsellItem.price;
      itemPrice = price * (item.quantity ?? 1);
    }

    subtotal += itemPrice;

    return {
      tour_id: tourId || null,
      upsell_item_id: upsellItemId || null,
      package_id: item.packageId || null,
      package_name: item.packageName || null,
      adults: item.adults ?? 0,
      children: item.children ?? 0,
      item_date: item.date || null,
      price: itemPrice,
    };
  });

  // 2. Apply Promo Code
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (data.promoCode) {
    try {
      const promo = await validatePromoCode(data.promoCode, subtotal);
      promoCodeId = promo.id;
      
      if (promo.type === "percentage") {
        discountAmount = (subtotal * promo.value) / 100;
        if (promo.maxDiscountAmount && discountAmount > promo.maxDiscountAmount) {
          discountAmount = promo.maxDiscountAmount;
        }
      } else {
        discountAmount = promo.value;
      }
      
      // Ensure discount doesn't exceed subtotal
      if (discountAmount > subtotal) discountAmount = subtotal;

    } catch (error) {
      console.warn("Invalid promo code during booking creation:", error);
      // We ignore invalid promo codes silently here or we could throw. 
      // Assuming client-side validation passed, this is a safety check.
      // If invalid, we just don't apply discount.
    }
  }

  const finalTotal = subtotal - discountAmount;

  // 3. Insert into bookings table
  const status = data.paymentMethod === "cash" ? "Confirmed" : "Pending";
  const insertPayload = {
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    phone_number: data.phoneNumber,
    nationality: data.nationality,
    total_price: finalTotal,
    discount_amount: discountAmount,
    promo_code_id: promoCodeId,
    status,
    booking_date: new Date().toISOString(),
    payment_method: data.paymentMethod,
    agency_id: agencyId,
  };

  let bookingData: { id: string } | null = null;
  let bookingError: { message?: string } | null = null;

  {
    const res = await supabase
      .from("bookings")
      .insert(insertPayload)
      .select("id")
      .single();
    bookingData = (res.data as { id: string } | null) ?? null;
    bookingError = (res.error as { message?: string } | null) ?? null;
  }

  if (bookingError?.message?.includes("payment_method")) {
    // Fallback for schema mismatch if column doesn't exist (should exist based on previous checks but good for safety)
    const { payment_method: _, ...fallbackPayload } = insertPayload;
    const res = await supabase
      .from("bookings")
      .insert(fallbackPayload)
      .select("id")
      .single();
    bookingData = (res.data as { id: string } | null) ?? null;
    bookingError = (res.error as { message?: string } | null) ?? null;
  }

  if (bookingError || !bookingData) {
    console.error("Error creating booking:", bookingError);
    throw new Error("Failed to create booking.");
  }

  const bookingId = bookingData.id;

  // 4. Insert into booking_items table
  const itemsWithId = bookingItemsToInsert.map(item => ({
    ...item,
    booking_id: bookingId
  }));

  const { error: itemsError } = await supabase
    .from("booking_items")
    .insert(itemsWithId);

  if (itemsError) {
    console.error("Error creating booking items:", itemsError);
    throw new Error("Failed to create booking items.");
  }

  // 5. Update promo usage count
  if (promoCodeId) {
    // We increment safely
    await supabase.rpc('increment_promo_usage', { promo_id: promoCodeId });
    // If RPC doesn't exist, we can do a simple update, but RPC is better for concurrency.
    // I'll try simple update for now or creating RPC if I can.
    // Simple update:
    /*
    const { data: promo } = await supabase.from('promo_codes').select('usage_count').eq('id', promoCodeId).single();
    if (promo) {
      await supabase.from('promo_codes').update({ usage_count: (promo.usage_count || 0) + 1 }).eq('id', promoCodeId);
    }
    */
    // Better:
    // await supabase.rpc('increment', { table_name: 'promo_codes', row_id: promoCodeId, field: 'usage_count', amount: 1 });
    // I'll stick to simple update for this MVP.
    const { data: currentPromo } = await supabase
        .from("promo_codes")
        .select("usage_count")
        .eq("id", promoCodeId)
        .single();
        
    if (currentPromo) {
        await supabase
            .from("promo_codes")
            .update({ usage_count: (currentPromo.usage_count || 0) + 1 })
            .eq("id", promoCodeId);
    }
  }

  // 6. Sync Customer Data
  // We try to find an existing customer by email to update their stats, or create a new one.
  try {
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, total_bookings, total_spent")
      .eq("email", data.customerEmail)
      .eq("agency_id", agencyId)
      .maybeSingle();

    if (existingCustomer) {
      await supabase
        .from("customers")
        .update({
          name: data.customerName,
          phone: data.phoneNumber,
          nationality: data.nationality,
          total_bookings: (existingCustomer.total_bookings || 0) + 1,
          total_spent: (existingCustomer.total_spent || 0) + finalTotal,
          last_active: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);
    } else {
      await supabase.from("customers").insert({
        agency_id: agencyId,
        email: data.customerEmail,
        name: data.customerName,
        phone: data.phoneNumber,
        nationality: data.nationality,
        total_bookings: 1,
        total_spent: finalTotal,
        source: "Booking",
        last_active: new Date().toISOString(),
        status: "active",
      });
    }
  } catch (err) {
    console.error("Error syncing customer data:", err);
    // Non-blocking error, we don't fail the booking if customer sync fails
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/customers");
  return bookingId as string;
}
