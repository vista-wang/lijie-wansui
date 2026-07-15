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
  /** 仅超级会员可见的彩蛋公告 */
  superOnly?: boolean;
  createdAt: string;
}

export const MEMBERSHIP_PLANS = [
  {
    tier: "plus" as const,
    name: "高级会员",
    priceYuan: 10,
    period: "月",
    highlights: ["免除广告", "反馈优先处理"],
  },
  {
    tier: "super" as const,
    name: "超级会员",
    priceYuan: 20,
    period: "月",
    highlights: [
      "免除广告",
      "反馈最高优先级",
      "推荐算法加权",
      "专属身份徽章",
      "超级专属公告",
    ],
  },
] as const;
