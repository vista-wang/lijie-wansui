import { findMockUser, MOCK_USERS } from "@/lib/auth/mock-users";
import type { User } from "@/lib/types/domain";

const STORAGE_KEY = "universal-rating.mock-session.userId";

export function listMockUsers(): readonly User[] {
  return MOCK_USERS;
}

export function getMockSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function getMockSessionUser(): User | null {
  const id = getMockSessionUserId();
  if (!id) return null;
  return findMockUser(id) ?? null;
}

export function signInMockUser(userId: string): User {
  const user = findMockUser(userId);
  if (!user) {
    throw new Error(`Unknown mock user: ${userId}`);
  }
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, userId);
  }
  return user;
}

export function signOutMockUser(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
