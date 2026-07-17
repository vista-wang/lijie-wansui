/**
 * 理解万岁 · 会员与运营类型
 * 使用 Cursor 制作
 */

export type MembershipTier = "free" | "plus" | "super";

export interface MembershipRecord {
  userId: string;
  tier: MembershipTier;
  /** ISO，到期时间；free 可无 */
  expiresAt?: string;
}

export type FeedbackPriority = "normal" | "plus" | "super";

export interface FeedbackItem {
  id: string;
  authorId: string;
  body: string;
  /** 提交时的会员档位，决定优先级 */
  priority: FeedbackPriority;
  status: "open" | "done";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** 仅超级会员可见（与开发者交流） */
  superOnly?: boolean;
  createdAt: string;
}

/** 会员内容在推荐中的加权系数（创建者档位） */
export const MEMBERSHIP_RECOMMEND_WEIGHT: Record<MembershipTier, number> = {
  free: 1,
  plus: 1.35,
  super: 1.85,
};
