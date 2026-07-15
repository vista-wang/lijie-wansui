import type { User } from "@/lib/types/domain";

/** Local pseudo accounts — replace with Supabase Auth later. */
export const MOCK_USERS: readonly User[] = [
  {
    id: "user-alice",
    displayName: "Alice Chen",
    email: "alice@example.local",
    role: "user",
  },
  {
    id: "user-bob",
    displayName: "Bob Wang",
    email: "bob@example.local",
    role: "user",
  },
  {
    id: "user-admin",
    displayName: "Admin Li",
    email: "admin@example.local",
    role: "admin",
  },
] as const;

export function findMockUser(id: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === id);
}
