export type UserRole = "user" | "admin";

/** Creator picks exactly one mode per instance. */
export type ScoringMode = "scale_10" | "binary";

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
  scoringMode: ScoringMode;
  category?: string;
  createdBy: string;
  createdAt: string;
}

/**
 * One rating per (authorId, instanceId). Score may be updated.
 * scale_10: 1–10; binary: 0 (oppose) | 1 (approve).
 */
export interface Rating {
  id: string;
  instanceId: string;
  score: number;
  /** Stored for audit only; never shown on public surfaces. */
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * One comment per (authorId, instanceId). No second comment.
 * Body may be edited on the same row.
 */
export interface Comment {
  id: string;
  instanceId: string;
  body: string;
  /** Stored for audit only; never shown on public surfaces. */
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | "instance.create"
  | "instance.update"
  | "instance.delete"
  | "rating.create"
  | "rating.update"
  | "rating.delete"
  | "comment.create"
  | "comment.update"
  | "comment.delete";

export interface AuditEvent {
  id: string;
  actorId: string;
  action: AuditAction;
  entityType: "instance" | "rating" | "comment";
  entityId: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}

/** Public aggregate for an instance. */
export type InstanceScoreSummary =
  | {
      mode: "scale_10";
      count: number;
      /** Null when no ratings. */
      average: number | null;
    }
  | {
      mode: "binary";
      count: number;
      approveCount: number;
      opposeCount: number;
      /** Side with more votes; tie when equal (including 0–0). */
      majority: "approve" | "oppose" | "tie";
    };

export type PublicRating = Omit<Rating, "authorId">;
export type PublicComment = Omit<Comment, "authorId">;
