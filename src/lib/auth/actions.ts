"use server";

/**
 * 理解万岁 · Clerk 会员 / 真名服务端操作
 * 使用 Cursor 制作
 */

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  REAL_NAME_HINT,
  REAL_NAME_TAKEN_HINT,
} from "@/lib/auth/messages";
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

  return { tier, expiresAt };
}

export async function setRealNameAction(realNameRaw: string): Promise<void> {
  const realName = realNameRaw.trim();
  if (!realName) throw new Error(REAL_NAME_HINT);

  const { userId } = await auth();
  if (!userId) throw new Error("请先登录");

  const client = await clerkClient();

  // 扫描已有用户真名（规模小时可用；冲突时提示人工处理）
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
    if (offset > 2000) break;
  }

  const user = await client.users.getUser(userId);
  const meta = readPublicMeta(
    user.publicMetadata as Record<string, unknown>,
  );

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...meta,
      realName,
    },
  });
}
