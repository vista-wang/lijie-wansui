"use client";

/**
 * 理解万岁 · 会员状态（Clerk publicMetadata）
 * 使用 Cursor 制作
 */

import { useUser } from "@clerk/nextjs";
import {
  readPublicMeta,
  resolveMembershipTier,
} from "@/lib/auth/clerk-meta";
import { membershipLabel } from "@/lib/data/membership";
import type { MembershipTier } from "@/lib/types/membership";

export function useMembership(): {
  tier: MembershipTier;
  label: string;
  showAds: boolean;
  ready: boolean;
} {
  const { isLoaded, user } = useUser();
  const meta = readPublicMeta(
    user?.publicMetadata as Record<string, unknown> | undefined,
  );
  const tier = isLoaded && user ? resolveMembershipTier(meta) : "free";
  return {
    tier,
    label: membershipLabel(tier),
    showAds: isLoaded ? tier === "free" : false,
    ready: isLoaded,
  };
}
