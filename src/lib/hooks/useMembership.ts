"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  canSeeAds,
  getMembershipTier,
  membershipLabel,
} from "@/lib/data/membership";
import { useStoreRevision } from "@/lib/data/use-store-revision";
import { useClientReady } from "@/lib/hooks/useClientReady";
import type { MembershipTier } from "@/lib/types/membership";

export function useMembership(): {
  tier: MembershipTier;
  label: string;
  showAds: boolean;
  ready: boolean;
} {
  const ready = useClientReady();
  useStoreRevision();
  const { user } = useAuth();
  const tier = ready ? getMembershipTier(user?.id ?? null) : "free";
  return {
    tier,
    label: membershipLabel(tier),
    showAds: ready ? canSeeAds(user?.id ?? null) : false,
    ready,
  };
}
