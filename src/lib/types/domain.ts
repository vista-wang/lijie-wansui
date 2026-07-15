export type UserRole = "user" | "admin";

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
}

export interface Instance {
  id: string;
  title: string;
  description: string;
  category?: string;
  createdBy: string;
  createdAt: string;
}

export interface Rating {
  id: string;
  instanceId: string;
  score: number;
  comment?: string;
  /** Stored for audit only; never shown on public surfaces. */
  authorId: string;
  createdAt: string;
}

export type AuditAction =
  | "instance.create"
  | "instance.update"
  | "instance.delete"
  | "rating.create"
  | "rating.update"
  | "rating.delete";

export interface AuditEvent {
  id: string;
  actorId: string;
  action: AuditAction;
  entityType: "instance" | "rating";
  entityId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

/** Public-facing rating: identity stripped. */
export type PublicRating = Omit<Rating, "authorId">;
