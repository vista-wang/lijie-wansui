/**
 * 理解万岁 · 档案辅助（Clerk + Supabase profiles）
 * 使用 Cursor 制作
 */

import type { User } from "@/lib/types/domain";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type ProfileRow = {
  id: string;
  real_name: string;
  email: string;
  role: "user" | "admin";
};

/** 按 Clerk user id 读 profile */
export async function fetchProfileByClerkId(
  clerkUserId: string,
): Promise<User | null> {
  if (!isSupabaseConfigured() || !clerkUserId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, real_name, email, role")
    .eq("id", clerkUserId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    displayName: row.real_name,
    email: row.email,
    role: row.role === "admin" ? "admin" : "user",
  };
}

export async function checkRealNameAvailable(realName: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("real_name", realName.trim())
    .maybeSingle();
  if (error) return true;
  return !data;
}
