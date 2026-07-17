/**
 * 理解万岁 · 敏感词（读快照）
 * 使用 Cursor 制作
 */

import { getStore } from "@/lib/data/store";

export function maskSensitiveText(
  text: string,
  words?: readonly string[],
): string {
  const list = words ?? getStore().sensitiveWords;
  let out = text;
  for (const word of list) {
    if (!word) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "gi"), "*".repeat(Math.min(word.length, 4)));
  }
  return out;
}

export function listSensitiveWords(): string[] {
  return getStore().sensitiveWords.slice().sort((a, b) => a.localeCompare(b, "zh-CN"));
}
