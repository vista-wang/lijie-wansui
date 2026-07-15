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
 * anonymous=true 时公开不显示姓名；后台审计仍保留 authorId。
 */
export interface Rating {
  id: string;
  instanceId: string;
  score: number;
  authorId: string;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * One comment per (authorId, instanceId). No second comment.
 * anonymous 由用户自选。
 */
export interface Comment {
  id: string;
  instanceId: string;
  body: string;
  authorId: string;
  anonymous: boolean;
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
      average: number | null;
    }
  | {
      mode: "binary";
      count: number;
      approveCount: number;
      opposeCount: number;
      majority: "approve" | "oppose" | "tie";
    };

export type PublicRating = {
  id: string;
  instanceId: string;
  score: number;
  anonymous: boolean;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicComment = {
  id: string;
  instanceId: string;
  body: string;
  anonymous: boolean;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
};
