/**
 * 理解万岁 · 伪账号（多用户种子）
 * 使用 Cursor 制作
 */

import type { User } from "@/lib/types/domain";

const EXTRA_NAMES = [
  "赵敏",
  "钱进",
  "孙悦",
  "周宁",
  "吴凡",
  "郑洁",
  "冯岚",
  "陈舟",
  "褚安",
  "卫青",
  "蒋川",
  "沈棠",
  "韩雪",
  "杨波",
  "朱琪",
] as const;

export const MOCK_USERS: readonly User[] = [
  {
    id: "user-alice",
    displayName: "陈晓",
    email: "chenxiao@example.local",
    role: "user",
  },
  {
    id: "user-bob",
    displayName: "王强",
    email: "wangqiang@example.local",
    role: "user",
  },
  {
    id: "user-admin",
    displayName: "李明",
    email: "admin@example.local",
    role: "admin",
  },
  ...EXTRA_NAMES.map(
    (name, index): User => ({
      id: `user-u${index + 1}`,
      displayName: name,
      email: `user${index + 1}@example.local`,
      role: "user",
    }),
  ),
] as const;

export function findMockUser(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
