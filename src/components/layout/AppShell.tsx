/**
 * 理解万岁 · 桌面三栏壳层
 * 使用 Cursor 制作
 */

import { LeftSidePanel, RightSidePanel } from "@/components/layout/SidePanels";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-1 gap-5 px-4 pt-6 sm:px-5 lg:gap-6 xl:gap-8">
      <aside className="hidden w-[15.5rem] shrink-0 lg:block">
        <div className="sticky top-[4.25rem] max-h-[calc(100vh-5rem)] overflow-y-auto pb-8">
          <LeftSidePanel />
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>

      <aside className="hidden w-[15.5rem] shrink-0 xl:block">
        <div className="sticky top-[4.25rem] max-h-[calc(100vh-5rem)] overflow-y-auto pb-8">
          <RightSidePanel />
        </div>
      </aside>
    </div>
  );
}
