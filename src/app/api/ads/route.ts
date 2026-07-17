/**
 * 理解万岁 · 广告 API（Lemon Squeezy + AIW）
 * 使用 Cursor 制作
 */

import { NextResponse } from "next/server";
import { buildAdInventory } from "@/lib/data/lemon-ads";

export const runtime = "nodejs";

export async function GET() {
  try {
    const ads = await buildAdInventory();
    return NextResponse.json({ ads });
  } catch {
    return NextResponse.json({ ads: [] }, { status: 200 });
  }
}
