import type { User } from "@/lib/types/domain";

/** 本地伪账号 — 之后替换为 Supabase Auth */
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
] as const;

export function findMockUser(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
