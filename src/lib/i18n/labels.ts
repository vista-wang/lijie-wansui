import type { AuditAction, InstanceScoreSummary, ScoringMode } from "@/lib/types/domain";

export function scoringModeLabel(mode: ScoringMode): string {
  return mode === "scale_10" ? "1–10 分" : "赞成 / 反对";
}

export function formatScoreSummary(summary: InstanceScoreSummary): string {
  if (summary.mode === "scale_10") {
    if (summary.average == null) return "暂无评分";
    return `${summary.average.toFixed(1)} 分 · ${summary.count} 人评`;
  }
  if (summary.count === 0) return "暂无投票";
  const side =
    summary.majority === "approve"
      ? "赞成占优"
      : summary.majority === "oppose"
        ? "反对占优"
        : "双方持平";
  return `${side} · 赞成 ${summary.approveCount} / 反对 ${summary.opposeCount}`;
}

export function auditActionLabel(action: AuditAction): string {
  const map: Record<AuditAction, string> = {
    "instance.create": "创建实例",
    "instance.update": "更新实例",
    "instance.delete": "删除实例",
    "rating.create": "提交评分",
    "rating.update": "修改评分",
    "rating.delete": "删除评分",
    "comment.create": "发表评论",
    "comment.update": "修改评论",
    "comment.delete": "删除评论",
  };
  return map[action];
}

export function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
