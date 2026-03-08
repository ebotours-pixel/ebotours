'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { checkSuperAdmin } from './layout';

export async function createAgency(formData: FormData) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const domain = formData.get('domain') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const contactPhone = formData.get('contactPhone') as string;
  const tier = (formData.get('tier') as string) || 'free';

  // Module flags (checkboxes send "on" when checked)
  const moduleTours = formData.get('module_tours') === 'on';
  const moduleHotels = formData.get('module_hotels') === 'on';
  const moduleBlog = formData.get('module_blog') === 'on';
  const moduleUpsell = formData.get('module_upsell') === 'on';
  const moduleContact = formData.get('module_contact') === 'on';
  const moduleReviews = formData.get('module_reviews') === 'on';

  if (!name || !slug) {
    throw new Error('Name and Slug are required');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('agencies').insert({
    name,
    slug,
    domain: domain || null,
    status: 'active',
    settings: {
      tier,
      modules: {
        tours: moduleTours,
        hotels: moduleHotels,
        blog: moduleBlog,
        upsell: moduleUpsell,
        contact: moduleContact,
        reviews: moduleReviews,
      },
      contact: {
        ...(contactEmail && { email: contactEmail }),
        ...(contactPhone && { phone: contactPhone }),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/super-admin');
}

export async function switchAgency(slug: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_agency_override', slug, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  revalidatePath('/');
}

export async function resetAgency() {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) {
    throw new Error('Unauthorized');
  }

  const cookieStore = await cookies();
  cookieStore.delete('admin_agency_override');

  revalidatePath('/');
}

import { AgencyModules } from '@/types/agency';

export async function updateAgencyModules(agencyId: string, modules: AgencyModules) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  // First fetch existing settings to preserve other keys
  const { data: existing } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .single();
  const currentSettings = existing?.settings || {};

  const { error } = await supabase
    .from('agencies')
    .update({
      settings: {
        ...currentSettings,
        modules: modules,
      },
    })
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
}

// --- Broadcast Actions ---

export async function createBroadcast(formData: FormData) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const message = formData.get('message') as string;
  const variant = formData.get('variant') as string;

  if (!message) throw new Error('Message is required');

  const supabase = await createClient();
  const { error } = await supabase.from('system_broadcasts').insert({
    message,
    variant,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout'); // Revalidate globally so all admins see it
}

export async function toggleBroadcast(id: string, isActive: boolean) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { error } = await supabase
    .from('system_broadcasts')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout');
}

export async function deleteBroadcast(id: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { error } = await supabase.from('system_broadcasts').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath('/', 'layout');
}

// --- Agency Management Actions (S2) ---

export async function updateAgencyDetails(
  agencyId: string,
  data: {
    name?: string;
    slug?: string;
    domain?: string | null;
    status?: 'active' | 'suspended';
    tier?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  }
) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Fetch existing settings
  const { data: existing } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .single();
  const currentSettings = (existing?.settings || {}) as Record<string, unknown>;

  const updatePayload: Record<string, unknown> = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.slug !== undefined) updatePayload.slug = data.slug;
  if (data.domain !== undefined) updatePayload.domain = data.domain || null;
  if (data.status !== undefined) updatePayload.status = data.status;

  // Merge settings fields
  const newSettings = { ...currentSettings };
  if (data.tier !== undefined) newSettings.tier = data.tier;
  if (
    data.contactEmail !== undefined ||
    data.contactPhone !== undefined ||
    data.contactAddress !== undefined
  ) {
    const currentContact = (currentSettings.contact || {}) as Record<string, string>;
    newSettings.contact = {
      ...currentContact,
      ...(data.contactEmail !== undefined && { email: data.contactEmail }),
      ...(data.contactPhone !== undefined && { phone: data.contactPhone }),
      ...(data.contactAddress !== undefined && { address: data.contactAddress }),
    };
  }
  updatePayload.settings = newSettings;

  const { error } = await supabase.from('agencies').update(updatePayload).eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath(`/super-admin/agencies/${agencyId}`);
}

export async function updateAgencyNotes(agencyId: string, notes: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();
  const { error } = await supabase
    .from('agencies')
    .update({ internal_notes: notes })
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath(`/super-admin/agencies/${agencyId}`);
}

export async function suspendAgency(agencyId: string, reason: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Fetch existing settings to set maintenance_mode
  const { data: existing } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .single();
  const currentSettings = (existing?.settings || {}) as Record<string, unknown>;
  const currentModules = (currentSettings.modules || {}) as Record<string, boolean>;

  const { error } = await supabase
    .from('agencies')
    .update({
      status: 'suspended',
      suspended_reason: reason,
      suspended_at: new Date().toISOString(),
      settings: {
        ...currentSettings,
        modules: { ...currentModules, maintenance_mode: true },
      },
    })
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath(`/super-admin/agencies/${agencyId}`);
}

export async function unsuspendAgency(agencyId: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('agencies')
    .select('settings')
    .eq('id', agencyId)
    .single();
  const currentSettings = (existing?.settings || {}) as Record<string, unknown>;
  const currentModules = (currentSettings.modules || {}) as Record<string, boolean>;

  const { error } = await supabase
    .from('agencies')
    .update({
      status: 'active',
      suspended_reason: null,
      suspended_at: null,
      settings: {
        ...currentSettings,
        modules: { ...currentModules, maintenance_mode: false },
      },
    })
    .eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
  revalidatePath(`/super-admin/agencies/${agencyId}`);
}

export async function duplicateAgency(sourceAgencyId: string, newName: string, newSlug: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  if (!newName || !newSlug) throw new Error('Name and slug are required');

  const supabase = await createClient();

  // Fetch source agency
  const { data: source, error: fetchError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', sourceAgencyId)
    .single();

  if (fetchError || !source) throw new Error('Source agency not found');

  const { error } = await supabase.from('agencies').insert({
    name: newName,
    slug: newSlug,
    status: 'active',
    settings: source.settings,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
}

export async function deleteAgency(agencyId: string) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Safety check: count bookings
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('agency_id', agencyId);

  if (count && count > 0) {
    throw new Error(`Cannot delete: agency has ${count} booking(s). Archive it instead.`);
  }

  const { error } = await supabase.from('agencies').delete().eq('id', agencyId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin');
}
