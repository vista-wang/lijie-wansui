import type {
  InstanceScoreSummary,
  Rating,
  ScoringMode,
} from "@/lib/types/domain";

export function assertValidScore(mode: ScoringMode, score: number): void {
  if (mode === "scale_10") {
    if (!Number.isInteger(score) || score < 1 || score > 10) {
      throw new Error("1–10 分模式下，分数须为 1 到 10 的整数");
    }
    return;
  }
  if (score !== 0 && score !== 1) {
    throw new Error("二元模式下，分数须为 0（反对）或 1（赞成）");
  }
}

export function summarizeScores(
  mode: ScoringMode,
  ratings: readonly Rating[],
): InstanceScoreSummary {
  const count = ratings.length;

  if (mode === "scale_10") {
    if (count === 0) {
      return { mode: "scale_10", count: 0, average: null };
    }
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return {
      mode: "scale_10",
      count,
      average: sum / count,
    };
  }

  const approveCount = ratings.filter((r) => r.score === 1).length;
  const opposeCount = ratings.filter((r) => r.score === 0).length;
  let majority: "approve" | "oppose" | "tie" = "tie";
  if (approveCount > opposeCount) majority = "approve";
  else if (opposeCount > approveCount) majority = "oppose";

  return {
    mode: "binary",
    count,
    approveCount,
    opposeCount,
    majority,
  };
}
