/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase database types based on the schema
 */
export interface Document {
  id: string;
  title: string;
  year: number;
  type: 'Constitution' | 'Bill' | 'Manifesto' | 'Speech' | 'Report' | 'Memo';
  size: string;
  description: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'News' | 'Event' | 'Memo' | 'Urgent';
  summary: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface Administration {
  id: string;
  session: string;
  president: string;
  alias: string;
  motto: string;
  notable_events: string;
  status: 'Active' | 'Completed' | 'Suspended' | 'Impeached';
  created_at: string;
  updated_at: string;
}

export interface ExecutiveMember {
  id: string;
  administration_id: string;
  role: string;
  name: string;
  alias?: string;
  created_at: string;
}

export interface Club {
  id: string;
  name: string;
  acronym?: string;
  category: 'Sociocultural' | 'Academic' | 'Religious' | 'Press' | 'Tech' | 'Sports' | 'Politics';
  founded: string;
  motto: string;
  description: string;
  activities: string[];
  president?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Hall {
  id: string;
  name: string;
  alias: string;
  motto: string;
  description: string;
  notable_alumni: string[];
  color: string;
  type: 'male' | 'female' | 'mixed';
  created_at: string;
  updated_at: string;
}

/**
 * Supabase client singleton instance
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if env vars are set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;