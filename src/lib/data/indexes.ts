/**
 * 理解万岁 · 评分索引（面向多用户多实例）
 * 使用 Cursor 制作
 */

import type { Instance, Rating } from "@/lib/types/domain";

export interface RatingIndexes {
  byUser: Map<string, Rating[]>;
  byInstance: Map<string, Rating[]>;
  byUserInstance: Map<string, Rating>;
}

function key(userId: string, instanceId: string): string {
  return `${userId}::${instanceId}`;
}

/** O(n) 建索引，之后按用户/实例查询为 O(1)~O(k) */
export function buildRatingIndexes(ratings: readonly Rating[]): RatingIndexes {
  const byUser = new Map<string, Rating[]>();
  const byInstance = new Map<string, Rating[]>();
  const byUserInstance = new Map<string, Rating>();

  for (const rating of ratings) {
    const userList = byUser.get(rating.authorId);
    if (userList) userList.push(rating);
    else byUser.set(rating.authorId, [rating]);

    const instList = byInstance.get(rating.instanceId);
    if (instList) instList.push(rating);
    else byInstance.set(rating.instanceId, [rating]);

    byUserInstance.set(key(rating.authorId, rating.instanceId), rating);
  }

  return { byUser, byInstance, byUserInstance };
}

export function buildInstanceMap(
  instances: readonly Instance[],
): Map<string, Instance> {
  return new Map(instances.map((item) => [item.id, item]));
}
