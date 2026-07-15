/**
 * 理解万岁 · 本地 mock 存储
 * 使用 Cursor 制作
 */

import { emitStoreChange } from "@/lib/data/store-events";
import { buildDemoCatalog } from "@/lib/data/seed-catalog";
import type {
  AuditEvent,
  Comment,
  Instance,
  Rating,
} from "@/lib/types/domain";
import type {
  Announcement,
  FeedbackItem,
  MembershipRecord,
} from "@/lib/types/membership";

const STORAGE_KEY = "universal-rating.mock-store.v8";

export interface MockStoreData {
  instances: Instance[];
  ratings: Rating[];
  comments: Comment[];
  auditEvents: AuditEvent[];
  sensitiveWords: string[];
  memberships: MembershipRecord[];
  feedbacks: FeedbackItem[];
  announcements: Announcement[];
}

function seedStore(): MockStoreData {
  const catalog = buildDemoCatalog();
  const now = new Date().toISOString();
  return {
    ...catalog,
    sensitiveWords: ["垃圾", "白痴", "去死"],
    memberships: [],
    feedbacks: [
      {
        id: "feedback-seed-1",
        authorId: "user-alice",
        body: "希望能按地区筛选评价对象。",
        priority: "normal",
        status: "open",
        createdAt: now,
      },
      {
        id: "feedback-seed-2",
        authorId: "user-bob",
        body: "高级会员开通后，希望推荐更准一点。",
        priority: "plus",
        status: "open",
        createdAt: now,
      },
    ],
    announcements: [
      {
        id: "announce-1",
        title: "欢迎来到理解万岁",
        body: "在这里看看大家怎么评价身边的事与物。评分与留言对所有人可见，但不会公开你的名字。",
        createdAt: now,
      },
      {
        id: "announce-2",
        title: "会员权益上线",
        body: "高级会员可去广告、反馈优先；超级会员还有推荐加权、专属徽章与专属公告。",
        createdAt: now,
      },
      {
        id: "announce-super-1",
        title: "超级会员内测通道",
        body: "感谢支持。本周超级会员可优先体验「口味相近的人」推荐微调，欢迎在反馈里告诉我们体感。",
        superOnly: true,
        createdAt: now,
      },
    ],
  };
}

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function normalizeStore(data: Partial<MockStoreData>): MockStoreData {
  const seeded = seedStore();
  const instances = data.instances?.length
    ? data.instances
    : seeded.instances;
  if (instances.length < 20) {
    return {
      ...seeded,
      memberships: data.memberships ?? [],
      feedbacks: data.feedbacks?.length ? data.feedbacks : seeded.feedbacks,
      announcements: data.announcements?.length
        ? data.announcements
        : seeded.announcements,
      sensitiveWords: data.sensitiveWords?.length
        ? data.sensitiveWords
        : seeded.sensitiveWords,
    };
  }
  const ratings = (data.ratings?.length ? data.ratings : seeded.ratings).map(
    (r) => ({
      ...r,
      anonymous: r.anonymous !== false,
    }),
  );
  const comments = (
    data.comments?.length ? data.comments : seeded.comments
  ).map((c) => ({
    ...c,
    anonymous: c.anonymous !== false,
  }));

  return {
    instances,
    ratings,
    comments,
    auditEvents: data.auditEvents?.length
      ? data.auditEvents
      : seeded.auditEvents,
    sensitiveWords: data.sensitiveWords?.length
      ? data.sensitiveWords
      : seeded.sensitiveWords,
    memberships: data.memberships ?? [],
    feedbacks: data.feedbacks?.length ? data.feedbacks : seeded.feedbacks,
    announcements: data.announcements?.length
      ? data.announcements
      : seeded.announcements,
  };
}

export function loadMockStore(): MockStoreData {
  if (!canUseStorage()) {
    return seedStore();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return structuredClone(seeded);
    }
    const parsed = JSON.parse(raw) as Partial<MockStoreData>;
    const normalized = normalizeStore(parsed);
    if ((parsed.instances?.length ?? 0) < 20 || !parsed.announcements) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return seedStore();
  }
}

export function saveMockStore(data: MockStoreData): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  emitStoreChange();
}

export function resetMockStore(): MockStoreData {
  const seeded = seedStore();
  saveMockStore(seeded);
  return structuredClone(seeded);
}
