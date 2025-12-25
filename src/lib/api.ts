/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { supabase, type Document, type Announcement, type Administration, type ExecutiveMember, type Club, type Hall } from './supabase';

/**
 * API service for fetching data from Supabase
 */

// Documents API
export async function getDocuments() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('year', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

export async function getDocumentById(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Document | null;
}

export async function createDocument(doc: Omit<Document, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('documents')
    .insert(doc)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

// Announcements API
export async function getAnnouncements() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Announcement[];
}

export async function getAnnouncementsByCategory(category: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('category', category)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Announcement[];
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcement)
    .select()
    .single();

  if (error) throw error;
  return data as Announcement;
}

// Administrations API
export async function getAdministrations() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('administrations')
    .select(`
      *,
      executive_members:executive_members(*)
    `)
    .order('session', { ascending: false });

  if (error) throw error;
  return data as (Administration & { executive_members: ExecutiveMember[] })[];
}

export async function getAdministrationBySession(session: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('administrations')
    .select(`
      *,
      executive_members:executive_members(*)
    `)
    .eq('session', session)
    .maybeSingle();

  if (error) throw error;
  return data as (Administration & { executive_members: ExecutiveMember[] }) | null;
}

export async function createAdministration(
  admin: Omit<Administration, 'id' | 'created_at' | 'updated_at'>,
  members: Omit<ExecutiveMember, 'id' | 'administration_id' | 'created_at'>[]
) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: adminData, error: adminError } = await supabase
    .from('administrations')
    .insert(admin)
    .select()
    .single();

  if (adminError) throw adminError;

  const membersWithAdminId = members.map(m => ({
    ...m,
    administration_id: adminData.id
  }));

  const { error: membersError } = await supabase
    .from('executive_members')
    .insert(membersWithAdminId);

  if (membersError) throw membersError;

  return adminData as Administration;
}

// Clubs API
export async function getClubs() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Club[];
}

export async function getClubsByCategory(category: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) throw error;
  return data as Club[];
}

export async function getClubById(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Club | null;
}

export async function createClub(club: Omit<Club, 'id' | 'created_at' | 'updated_at'>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('clubs')
    .insert(club)
    .select()
    .single();

  if (error) throw error;
  return data as Club;
}

// Halls API
export async function getHalls() {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('halls')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Hall[];
}

export async function getHallsByType(type: 'male' | 'female' | 'mixed') {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('halls')
    .select('*')
    .eq('type', type)
    .order('name');

  if (error) throw error;
  return data as Hall[];
}

export async function getHallById(id: string) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('halls')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Hall | null;
}