/**
 * 理解万岁 · 大规模演示种子（多用户 × 多实例）
 * 使用 Cursor 制作
 */

import { MOCK_USERS } from "@/lib/auth/mock-users";
import type {
  AuditEvent,
  Comment,
  Instance,
  Rating,
} from "@/lib/types/domain";

const PLACE_TITLES = [
  "街角咖啡",
  "公园野餐区",
  "社区食堂",
  "旧书店",
  "晨跑路线",
  "河边茶馆",
  "夜间食堂",
  "屋顶花园",
  "街区面包房",
  "湖心亭",
  "共享自习室",
  "社区球场",
  "旧货市集",
  "自行车驿站",
  "邻里咖啡馆",
  "儿童绘本馆",
  "城南面馆",
  "梧桐步道",
  "地下通道画廊",
  "周末农夫市集",
];

const TOPIC_TITLES = [
  "是否延长图书馆开放时间",
  "夜间公交加密",
  "楼道禁烟倡议",
  "共享打印机",
  "小区限速提议",
  "垃圾分类奖惩",
  "周末市集扩容",
  "宠物牵绳公约",
  "电梯广告更新",
  "公共充电桩增补",
  "夜间施工管控",
  "人行道拓宽",
  "社区托育点",
  "旧衣回收站",
  "雨水花园试点",
  "无障碍坡道改造",
  "夜间照明加密",
  "共享雨伞柜",
  "楼顶太阳能",
  "社区志愿积分",
];

/** 用户分 3 个口味簇，实例也分簇，同簇高分、异簇低分 */
function clusterOfUser(userIndex: number): number {
  return userIndex % 3;
}

function clusterOfInstance(instanceIndex: number): number {
  return instanceIndex % 3;
}

export function buildDemoCatalog(): {
  instances: Instance[];
  ratings: Rating[];
  comments: Comment[];
  auditEvents: AuditEvent[];
} {
  const now = Date.now();
  const users = MOCK_USERS;

  const instances: Instance[] = [];

  for (let i = 0; i < PLACE_TITLES.length; i++) {
    instances.push({
      id: `instance-place-${i}`,
      title: PLACE_TITLES[i],
      description: `场所体验 · 编号 ${i + 1}，欢迎评分与留言。`,
      scoringMode: "scale_10",
      category: "场所",
      createdBy: users[i % users.length].id,
      createdAt: new Date(now - i * 7200_000).toISOString(),
    });
  }

  for (let i = 0; i < TOPIC_TITLES.length; i++) {
    instances.push({
      id: `instance-topic-${i}`,
      title: TOPIC_TITLES[i],
      description: `社区议题 · 编号 ${i + 1}，请表达赞成或反对。`,
      scoringMode: "binary",
      category: "议题",
      createdBy: users[(i + 3) % users.length].id,
      createdAt: new Date(now - (i + 20) * 7200_000).toISOString(),
    });
  }

  const ratings: Rating[] = [];
  let ratingSeq = 0;

  users.forEach((user, userIndex) => {
    const uCluster = clusterOfUser(userIndex);
    instances.forEach((instance, instanceIndex) => {
      // 稀疏矩阵：约 55% 有评分，利于协同过滤
      const hash = (userIndex * 131 + instanceIndex * 17) % 100;
      if (hash > 55) return;

      const aligned = clusterOfInstance(instanceIndex) === uCluster;
      // 少数反向噪声，避免完美分隔
      const noisy = hash % 11 === 0;
      const preferAgree = noisy ? !aligned : aligned;

      let score: number;
      if (instance.scoringMode === "scale_10") {
        score = preferAgree ? 8 + (hash % 3) : 1 + (hash % 3);
      } else {
        score = preferAgree ? 1 : 0;
      }

      const createdAt = new Date(
        now - (userIndex + instanceIndex) * 60_000,
      ).toISOString();

      ratings.push({
        id: `rating-seed-${ratingSeq++}`,
        instanceId: instance.id,
        authorId: user.id,
        score,
        anonymous: hash % 3 !== 0,
        createdAt,
        updatedAt: createdAt,
      });
    });
  });

  const comments: Comment[] = [
    {
      id: "comment-seed-1",
      instanceId: "instance-place-0",
      body: "拿铁稳定，座位不多。",
      authorId: users[0].id,
      anonymous: true,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
    {
      id: "comment-seed-2",
      instanceId: "instance-topic-0",
      body: "晚上自习的人确实不少。",
      authorId: users[1].id,
      anonymous: false,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
    {
      id: "comment-seed-3",
      instanceId: "instance-place-0",
      body: "服务一般，有点垃圾，不太推荐。",
      authorId: users[2].id,
      anonymous: true,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    },
  ];

  const auditEvents: AuditEvent[] = instances.slice(0, 8).map((inst, i) => ({
    id: `audit-seed-${i}`,
    actorId: inst.createdBy,
    action: "instance.create" as const,
    entityType: "instance" as const,
    entityId: inst.id,
    createdAt: inst.createdAt,
  }));

  return { instances, ratings, comments, auditEvents };
}
