/**
 * 理解万岁 · Clerk 用户元数据约定
 * 使用 Cursor 制作
 */

import type { MembershipTier } from "@/lib/types/membership";
import type { User, UserRole } from "@/lib/types/domain";

export type ClerkPublicMeta = {
  realName?: string;
  role?: UserRole;
  membershipTier?: MembershipTier;
  membershipExpiresAt?: string;
};

export function readPublicMeta(
  meta: Record<string, unknown> | null | undefined,
): ClerkPublicMeta {
  if (!meta) return {};
  const tier = meta.membershipTier;
  const role = meta.role;
  return {
    realName: typeof meta.realName === "string" ? meta.realName : undefined,
    role: role === "admin" || role === "user" ? role : undefined,
    membershipTier:
      tier === "free" || tier === "plus" || tier === "super" ? tier : undefined,
    membershipExpiresAt:
      typeof meta.membershipExpiresAt === "string"
        ? meta.membershipExpiresAt
        : undefined,
  };
}

/**
 * 解析会员档位。管理员视为永久超级会员（含去广告、徽章、推荐加权等）。
 */
export function resolveMembershipTier(meta: ClerkPublicMeta): MembershipTier {
  if (meta.role === "admin") return "super";

  const tier = meta.membershipTier ?? "free";
  if (tier === "free") return "free";
  if (
    meta.membershipExpiresAt &&
    new Date(meta.membershipExpiresAt).getTime() < Date.now()
  ) {
    return "free";
  }
  return tier;
}

export function mapClerkToAppUser(input: {
  id: string;
  fullName: string | null;
  firstName: string | null;
  primaryEmail: string | null;
  publicMetadata: Record<string, unknown> | null | undefined;
}): User {
  const meta = readPublicMeta(input.publicMetadata);
  const displayName =
    meta.realName?.trim() ||
    input.fullName?.trim() ||
    input.firstName?.trim() ||
    input.primaryEmail ||
    "用户";
  return {
    id: input.id,
    displayName,
    email: input.primaryEmail ?? "",
    role: meta.role === "admin" ? "admin" : "user",
  };
}
