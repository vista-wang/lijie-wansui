/**
 * 理解万岁 · 浏览器端 Supabase 客户端
 * 使用 Cursor 制作
 */

import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 未配置");
  }
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
