"use server";

/**
 * 理解万岁 · Clerk 会员 / 真名服务端操作
 * 使用 Cursor 制作
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  readPublicMeta,
  type ClerkPublicMeta,
} from "@/lib/auth/clerk-meta";
import type { MembershipTier } from "@/lib/types/membership";

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function purchaseMembershipAction(
  tier: "plus" | "super",
): Promise<{ tier: MembershipTier; expiresAt: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("请先登录账号，再到这里开通。");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(
    user.publicMetadata as Record<string, unknown>,
  );

  const now = new Date().toISOString();
  const base =
    meta.membershipExpiresAt &&
    new Date(meta.membershipExpiresAt).getTime() > Date.now()
      ? meta.membershipExpiresAt
      : now;
  const expiresAt = addDays(base, 30);

  const nextMeta: ClerkPublicMeta = {
    ...meta,
    membershipTier: tier,
    membershipExpiresAt: expiresAt,
  };

  await client.users.updateUserMetadata(userId, {
    publicMetadata: nextMeta,
  });

  const { syncMembershipToSupabaseAction } = await import("@/lib/data/actions");
  await syncMembershipToSupabaseAction(tier, expiresAt);

  return { tier, expiresAt };
}

export async function setRealNameAction(realNameRaw: string): Promise<void> {
  const { setRealNameAndProfileAction } = await import("@/lib/data/actions");
  await setRealNameAndProfileAction(realNameRaw);
}
