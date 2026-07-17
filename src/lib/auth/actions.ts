"use server";

/**
 * 理解万岁 · Clerk 真名服务端操作
 * 使用 Cursor 制作
 */

export async function setRealNameAction(realNameRaw: string): Promise<void> {
  const { setRealNameAndProfileAction } = await import("@/lib/data/actions");
  await setRealNameAndProfileAction(realNameRaw);
}
