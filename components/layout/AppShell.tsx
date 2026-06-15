"use client";

import { useState, type ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShaderBackground } from "@/components/layout/ShaderBackground";
import { ControlsPanel } from "@/components/visualizer/ControlsPanel";
import { Icon } from "@/components/ui/Icon";

interface AppShellProps {
  children: ReactNode;
  /** Left control rail. Defaults to the array Build & Run sidebar. */
  sidebar?: ReactNode;
  /** Bottom transport bar. Defaults to the array controls. */
  footer?: ReactNode;
}

export function AppShell({ children, sidebar, footer }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const rail = sidebar ?? <Sidebar />;
  const bar = footer ?? <ControlsPanel />;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <ShaderBackground />
      <Navbar />

      <div className="mt-16 flex h-[calc(100dvh-120px)] w-full flex-1 overflow-hidden">
        {/* Control rail: static column on md+, slide-in drawer on mobile */}
        <div
          className={`fixed bottom-14 left-0 top-16 z-50 flex transition-transform duration-300 ease-out md:static md:bottom-0 md:top-0 md:z-auto md:translate-x-0 ${
            drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {rail}
        </div>

        {/* Mobile backdrop */}
        {drawerOpen && (
          <button
            aria-label="Close controls"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 top-16 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}

        {children}
      </div>

      {bar}

      {/* Mobile FAB to reveal the control rail */}
      <button
        onClick={() => setDrawerOpen((v) => !v)}
        aria-label="Toggle controls"
        className="fixed bottom-[4.5rem] right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-primary-container bg-primary-container text-surface shadow-lg transition-transform active:scale-95 md:hidden"
      >
        <Icon name={drawerOpen ? "close" : "tune"} className="text-[22px]" />
      </button>
    </div>
  );
}
