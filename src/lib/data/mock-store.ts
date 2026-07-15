import { MOCK_USERS } from "@/lib/auth/mock-users";
import { emitStoreChange } from "@/lib/data/store-events";
import type {
  AuditEvent,
  Comment,
  Instance,
  Rating,
} from "@/lib/types/domain";

/** 使用 Cursor 制作 */
const STORAGE_KEY = "universal-rating.mock-store.v5";

export interface MockStoreData {
  instances: Instance[];
  ratings: Rating[];
  comments: Comment[];
  auditEvents: AuditEvent[];
  sensitiveWords: string[];
}

function seedStore(): MockStoreData {
  const now = new Date().toISOString();
  const alice = MOCK_USERS[0].id;
  const bob = MOCK_USERS[1].id;
  const admin = MOCK_USERS[2].id;

  const extras: Instance[] = [
    ["公园野餐区", "周末人多，桌椅有限。", "scale_10", "场所"],
    ["夜间公交加密", "是否在周五加开末班车。", "binary", "议题"],
    ["社区食堂", "份量稳定，排队偏长。", "scale_10", "场所"],
    ["楼道禁烟倡议", "支持在楼道全面禁烟。", "binary", "议题"],
    ["旧书店", "二手书质量参差，价格友好。", "scale_10", "场所"],
    ["共享打印机", "是否在物业中心增设自助打印。", "binary", "议题"],
    ["晨跑路线", "湖边步道清晨风景不错。", "scale_10", "场所"],
  ].map(([title, description, scoringMode, category], index) => ({
    id: `instance-extra-${index + 1}`,
    title: title as string,
    description: description as string,
    scoringMode: scoringMode as Instance["scoringMode"],
    category: category as string,
    createdBy: index % 2 === 0 ? alice : bob,
    createdAt: new Date(Date.now() - (index + 1) * 3600_000).toISOString(),
  }));

  const instances: Instance[] = [
    {
      id: "instance-cafe",
      title: "街角咖啡",
      description: "附近一家独立咖啡馆，适合安静工作。",
      scoringMode: "scale_10",
      category: "场所",
      createdBy: alice,
      createdAt: now,
    },
    {
      id: "instance-policy",
      title: "是否延长图书馆开放时间",
      description: "社区讨论：工作日是否延长至 22:00。",
      scoringMode: "binary",
      category: "议题",
      createdBy: bob,
      createdAt: now,
    },
    ...extras,
  ];

  // 刻意拉开「很同意 / 很反对」，供推荐混排
  const ratings: Rating[] = [
    {
      id: "rating-1",
      instanceId: "instance-cafe",
      score: 9,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-2",
      instanceId: "instance-cafe",
      score: 9,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-3",
      instanceId: "instance-policy",
      score: 1,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-4",
      instanceId: "instance-policy",
      score: 1,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-5",
      instanceId: "instance-policy",
      score: 0,
      authorId: admin,
      createdAt: now,
      updatedAt: now,
    },
    // extras: 0 公园高分, 1 公交反对, 2 食堂高分, 3 禁烟赞成, 4 书店低分, 5 打印反对, 6 晨跑高分
    {
      id: "rating-e0a",
      instanceId: "instance-extra-1",
      score: 9,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e0b",
      instanceId: "instance-extra-1",
      score: 8,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e1a",
      instanceId: "instance-extra-2",
      score: 0,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e1b",
      instanceId: "instance-extra-2",
      score: 0,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e1c",
      instanceId: "instance-extra-2",
      score: 0,
      authorId: admin,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e2a",
      instanceId: "instance-extra-3",
      score: 10,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e3a",
      instanceId: "instance-extra-4",
      score: 1,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e3b",
      instanceId: "instance-extra-4",
      score: 1,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e3c",
      instanceId: "instance-extra-4",
      score: 1,
      authorId: admin,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e4a",
      instanceId: "instance-extra-5",
      score: 2,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e4b",
      instanceId: "instance-extra-5",
      score: 3,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e5a",
      instanceId: "instance-extra-6",
      score: 0,
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e5b",
      instanceId: "instance-extra-6",
      score: 0,
      authorId: admin,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "rating-e6a",
      instanceId: "instance-extra-7",
      score: 9,
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const comments: Comment[] = [
    {
      id: "comment-1",
      instanceId: "instance-cafe",
      body: "拿铁稳定，座位不多。",
      authorId: alice,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "comment-2",
      instanceId: "instance-policy",
      body: "晚上自习的人确实不少。",
      authorId: bob,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "comment-3",
      instanceId: "instance-cafe",
      body: "服务一般，有点垃圾，不太推荐。",
      authorId: admin,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const auditEvents: AuditEvent[] = [
    {
      id: "audit-1",
      actorId: alice,
      action: "instance.create",
      entityType: "instance",
      entityId: "instance-cafe",
      createdAt: now,
    },
    {
      id: "audit-2",
      actorId: bob,
      action: "instance.create",
      entityType: "instance",
      entityId: "instance-policy",
      createdAt: now,
    },
  ];

  return {
    instances,
    ratings,
    comments,
    auditEvents,
    sensitiveWords: ["垃圾", "白痴", "去死"],
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
  const instanceMap = new Map(
    (data.instances ?? []).map((item) => [item.id, item]),
  );
  for (const item of seeded.instances) {
    if (!instanceMap.has(item.id)) instanceMap.set(item.id, item);
  }

  const ratingMap = new Map((data.ratings ?? []).map((item) => [item.id, item]));
  for (const item of seeded.ratings) {
    if (!ratingMap.has(item.id)) ratingMap.set(item.id, item);
  }

  const commentMap = new Map(
    (data.comments ?? []).map((item) => [item.id, item]),
  );
  for (const item of seeded.comments) {
    if (!commentMap.has(item.id)) commentMap.set(item.id, item);
  }

  // 旧缓存实例过少时，直接用完整种子，确保主页可分页
  const instances = [...instanceMap.values()];
  const useSeedCatalog = instances.length < seeded.instances.length;

  return {
    instances: useSeedCatalog ? seeded.instances : instances,
    ratings: useSeedCatalog ? seeded.ratings : [...ratingMap.values()],
    comments: useSeedCatalog
      ? seeded.comments
      : [...commentMap.values()],
    auditEvents: data.auditEvents?.length
      ? data.auditEvents
      : seeded.auditEvents,
    sensitiveWords: data.sensitiveWords?.length
      ? data.sensitiveWords
      : seeded.sensitiveWords,
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
    return normalizeStore(JSON.parse(raw) as Partial<MockStoreData>);
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
