import { loadMockStore, saveMockStore } from "@/lib/data/mock-store";

/** 将命中的敏感词替换为等长 * */
export function maskSensitiveText(
  text: string,
  words: readonly string[],
): string {
  if (!text || words.length === 0) return text;

  const sorted = [...words]
    .filter((w) => w.trim().length > 0)
    .sort((a, b) => b.length - a.length);

  let result = text;
  for (const word of sorted) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "gi");
    result = result.replace(re, "*".repeat(word.length));
  }
  return result;
}

export function listSensitiveWords(): string[] {
  return loadMockStore().sensitiveWords.slice().sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

export function addSensitiveWord(word: string): string[] {
  const trimmed = word.trim();
  if (!trimmed) throw new Error("敏感词不能为空");
  if (trimmed.length > 32) throw new Error("敏感词过长");
  const store = loadMockStore();
  const exists = store.sensitiveWords.some(
    (w) => w.toLowerCase() === trimmed.toLowerCase(),
  );
  if (!exists) {
    store.sensitiveWords.push(trimmed);
    saveMockStore(store);
  }
  return listSensitiveWords();
}

export function removeSensitiveWord(word: string): string[] {
  const store = loadMockStore();
  store.sensitiveWords = store.sensitiveWords.filter((w) => w !== word);
  saveMockStore(store);
  return listSensitiveWords();
}

export function maskForPublic(text: string): string {
  return maskSensitiveText(text, listSensitiveWords());
}
