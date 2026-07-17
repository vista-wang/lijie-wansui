"use server";

/**
 * 理解万岁 · Supabase 写操作（先校验 Clerk）
 * 使用 Cursor 制作
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { createId } from "@/lib/data/id";
import { assertValidScore } from "@/lib/data/score";
import {
  REAL_NAME_HINT,
  REAL_NAME_REQUIRED,
  REAL_NAME_TAKEN_HINT,
} from "@/lib/auth/messages";
import {
  readPublicMeta,
  type ClerkPublicMeta,
} from "@/lib/auth/clerk-meta";
import type { ScoringMode } from "@/lib/types/domain";
import type { MembershipTier } from "@/lib/types/membership";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

function db() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 未配置");
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    getSupabaseUrl(),
    serviceKey || getSupabasePublishableKey(),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("请先登录");
  return userId;
}

/** 写操作必须已登录且已登记真实姓名（Clerk publicMetadata.realName） */
async function requireRealNameUser(): Promise<{
  userId: string;
  realName: string;
}> {
  const userId = await requireUserId();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(user.publicMetadata as Record<string, unknown>);
  const realName = meta.realName?.trim();
  if (!realName) throw new Error(REAL_NAME_REQUIRED);
  return { userId, realName };
}

/**
 * 确保 profiles 行存在。无真实姓名时不建占位账号，写操作须先完成实名。
 */
export async function ensureProfileAction(input?: {
  realName?: string;
  email?: string;
}): Promise<void> {
  const userId = await requireUserId();
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(user.publicMetadata as Record<string, unknown>);
  const role = meta.role === "admin" ? "admin" : "user";
  const realName = input?.realName?.trim() || meta.realName?.trim() || "";
  const email =
    input?.email?.trim() ||
    user.primaryEmailAddress?.emailAddress ||
    "";

  if (!realName) {
    return;
  }

  const supabase = db();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  const membershipTier: MembershipTier =
    role === "admin"
      ? "super"
      : meta.membershipTier === "plus" || meta.membershipTier === "super"
        ? meta.membershipTier
        : "free";
  const membershipExpiresAt =
    role === "admin" ? null : (meta.membershipExpiresAt ?? null);

  if (role === "admin" && meta.membershipTier !== "super") {
    const nextMeta: ClerkPublicMeta = {
      ...meta,
      role: "admin",
      membershipTier: "super",
      membershipExpiresAt: undefined,
    };
    await client.users.updateUserMetadata(userId, {
      publicMetadata: nextMeta,
    });
  }

  if (existing) {
    await supabase
      .from("profiles")
      .update({
        real_name: realName,
        email,
        role,
      })
      .eq("id", userId);
    await supabase.from("memberships").upsert({
      user_id: userId,
      tier: membershipTier,
      expires_at: membershipExpiresAt,
    });
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    real_name: realName,
    email,
    role,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error(`真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`);
    }
    throw new Error(error.message);
  }
  await supabase.from("memberships").upsert({
    user_id: userId,
    tier: membershipTier,
    expires_at: membershipExpiresAt,
  });
}

export async function createInstanceAction(input: {
  title: string;
  description: string;
  scoringMode: ScoringMode;
  category?: string;
}): Promise<{ id: string }> {
  const { userId } = await requireRealNameUser();
  await ensureProfileAction();
  const supabase = db();
  const id = createId("instance");
  const now = new Date().toISOString();
  const { error } = await supabase.from("instances").insert({
    id,
    title: input.title.trim(),
    description: input.description.trim(),
    scoring_mode: input.scoringMode,
    category: input.category?.trim() || null,
    created_by: userId,
    created_at: now,
  });
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    id: createId("audit"),
    actor_id: userId,
    action: "instance.create",
    entity_type: "instance",
    entity_id: id,
    created_at: now,
  });
  return { id };
}

export async function upsertRatingAction(input: {
  instanceId: string;
  score: number;
  anonymous?: boolean;
}): Promise<void> {
  const { userId } = await requireRealNameUser();
  await ensureProfileAction();
  const supabase = db();
  const { data: instance, error: instErr } = await supabase
    .from("instances")
    .select("scoring_mode")
    .eq("id", input.instanceId)
    .maybeSingle();
  if (instErr) throw new Error(instErr.message);
  if (!instance) throw new Error("未找到该实例");
  assertValidScore(instance.scoring_mode as ScoringMode, input.score);

  const anonymous = input.anonymous !== false;
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("instance_id", input.instanceId)
    .eq("author_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("ratings")
      .update({ score: input.score, anonymous, updated_at: now })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    await supabase.from("audit_events").insert({
      id: createId("audit"),
      actor_id: userId,
      action: "rating.update",
      entity_type: "rating",
      entity_id: existing.id,
      created_at: now,
      payload: { score: input.score, anonymous },
    });
    return;
  }

  const id = createId("rating");
  const { error } = await supabase.from("ratings").insert({
    id,
    instance_id: input.instanceId,
    author_id: userId,
    score: input.score,
    anonymous,
    created_at: now,
    updated_at: now,
  });
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    id: createId("audit"),
    actor_id: userId,
    action: "rating.create",
    entity_type: "rating",
    entity_id: id,
    created_at: now,
    payload: { score: input.score, anonymous },
  });
}

export async function createCommentAction(input: {
  instanceId: string;
  body: string;
  anonymous?: boolean;
}): Promise<void> {
  const { userId } = await requireRealNameUser();
  await ensureProfileAction();
  const body = input.body.trim();
  if (!body) throw new Error("请先写下评论");
  const supabase = db();
  const { data: existing } = await supabase
    .from("comments")
    .select("id")
    .eq("instance_id", input.instanceId)
    .eq("author_id", userId)
    .maybeSingle();
  if (existing) throw new Error("同一账号不能二次评论");

  const now = new Date().toISOString();
  const id = createId("comment");
  const { error } = await supabase.from("comments").insert({
    id,
    instance_id: input.instanceId,
    author_id: userId,
    body,
    anonymous: input.anonymous !== false,
    created_at: now,
    updated_at: now,
  });
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    id: createId("audit"),
    actor_id: userId,
    action: "comment.create",
    entity_type: "comment",
    entity_id: id,
    created_at: now,
    payload: { anonymous: input.anonymous !== false },
  });
}

export async function updateCommentAction(input: {
  instanceId: string;
  body: string;
  anonymous?: boolean;
}): Promise<void> {
  const { userId } = await requireRealNameUser();
  const body = input.body.trim();
  if (!body) throw new Error("请先写下评论");
  const supabase = db();
  const { data: existing } = await supabase
    .from("comments")
    .select("id, anonymous")
    .eq("instance_id", input.instanceId)
    .eq("author_id", userId)
    .maybeSingle();
  if (!existing) throw new Error("未找到评论");

  const now = new Date().toISOString();
  const anonymous =
    input.anonymous !== undefined ? input.anonymous : existing.anonymous;
  const { error } = await supabase
    .from("comments")
    .update({ body, anonymous, updated_at: now })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
  await supabase.from("audit_events").insert({
    id: createId("audit"),
    actor_id: userId,
    action: "comment.update",
    entity_type: "comment",
    entity_id: existing.id,
    created_at: now,
    payload: { anonymous },
  });
}

export async function submitFeedbackAction(body: string): Promise<void> {
  const { userId } = await requireRealNameUser();
  await ensureProfileAction();
  const trimmed = body.trim();
  if (!trimmed) throw new Error("请先写下你的想法");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(user.publicMetadata as Record<string, unknown>);
  const tier = meta.membershipTier;
  const priority =
    tier === "super" ? "super" : tier === "plus" ? "plus" : "normal";

  const supabase = db();
  const { error } = await supabase.from("feedbacks").insert({
    id: createId("feedback"),
    author_id: userId,
    body: trimmed,
    priority,
    status: "open",
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function markFeedbackDoneAction(id: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = db();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("需要管理员权限");
  const { error } = await supabase
    .from("feedbacks")
    .update({ status: "done" })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createAnnouncementAction(input: {
  title: string;
  body: string;
  superOnly?: boolean;
}): Promise<void> {
  const userId = await requireUserId();
  const supabase = db();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("需要管理员权限");
  const { error } = await supabase.from("announcements").insert({
    id: createId("announce"),
    title: input.title.trim(),
    body: input.body.trim(),
    super_only: Boolean(input.superOnly),
    created_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function addSensitiveWordAction(word: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = db();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("需要管理员权限");
  const trimmed = word.trim();
  if (!trimmed) throw new Error("请输入敏感词");
  const { error } = await supabase
    .from("sensitive_words")
    .upsert({ word: trimmed });
  if (error) throw new Error(error.message);
}

export async function removeSensitiveWordAction(word: string): Promise<void> {
  const userId = await requireUserId();
  const supabase = db();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("需要管理员权限");
  const { error } = await supabase
    .from("sensitive_words")
    .delete()
    .eq("word", word);
  if (error) throw new Error(error.message);
}

export async function syncMembershipToSupabaseAction(
  tier: MembershipTier,
  expiresAt: string | null,
): Promise<void> {
  const userId = await requireUserId();
  await ensureProfileAction();
  const supabase = db();
  const { error } = await supabase.from("memberships").upsert({
    user_id: userId,
    tier,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);
}

/** 覆盖 setRealName：同步 Clerk + profiles */
export async function setRealNameAndProfileAction(
  realNameRaw: string,
): Promise<void> {
  const realName = realNameRaw.trim();
  if (!realName) throw new Error(REAL_NAME_HINT);

  const userId = await requireUserId();
  const client = await clerkClient();

  let offset = 0;
  const limit = 100;
  for (;;) {
    const page = await client.users.getUserList({ limit, offset });
    for (const u of page.data) {
      if (u.id === userId) continue;
      const other = readPublicMeta(u.publicMetadata as Record<string, unknown>);
      if (other.realName === realName) {
        throw new Error(`真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`);
      }
    }
    if (page.data.length < limit) break;
    offset += limit;
  }

  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(user.publicMetadata as Record<string, unknown>);
  const nextMeta: ClerkPublicMeta = { ...meta, realName };
  await client.users.updateUserMetadata(userId, {
    publicMetadata: nextMeta,
  });
  await client.users.updateUser(userId, {
    firstName: realName,
  });

  const supabase = db();
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ real_name: realName, email })
      .eq("id", userId);
    if (error) {
      if (error.code === "23505") {
        throw new Error(`真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`);
      }
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      real_name: realName,
      email,
      role: "user",
    });
    if (error) {
      if (error.code === "23505") {
        throw new Error(`真实姓名已被占用。${REAL_NAME_TAKEN_HINT}`);
      }
      throw new Error(error.message);
    }
    await supabase.from("memberships").upsert({
      user_id: userId,
      tier: "free",
    });
  }
}
