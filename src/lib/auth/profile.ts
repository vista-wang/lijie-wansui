/**
 * 理解万岁 · 从 Supabase 拉取当前用户档案
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

export async function fetchCurrentProfile(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, real_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    // 触发器尚未写入时的兜底
    const metaName =
      typeof user.user_metadata?.real_name === "string"
        ? user.user_metadata.real_name
        : "";
    return {
      id: user.id,
      displayName: metaName || user.email || "用户",
      email: user.email ?? "",
      role: "user",
    };
  }

  const row = data as ProfileRow;
  return {
    id: row.id,
    displayName: row.real_name,
    email: row.email || user.email || "",
    role: row.role === "admin" ? "admin" : "user",
  };
}

export async function checkRealNameAvailable(realName: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("real_name_available", {
    p_name: realName.trim(),
  });
  if (error) {
    // RPC 失败时不阻塞，交给注册触发器再校验
    return true;
  }
  return Boolean(data);
}
