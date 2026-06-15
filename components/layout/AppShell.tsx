"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ShaderBackground } from "@/components/layout/ShaderBackground";
import { ControlsPanel } from "@/components/visualizer/ControlsPanel";

interface AppShellProps {
  children: ReactNode;
  /** Left control rail. Defaults to the array Build & Run sidebar. */
  sidebar?: ReactNode;
  /** Bottom transport bar. Defaults to the array controls. */
  footer?: ReactNode;
}

export function AppShell({ children, sidebar, footer }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ShaderBackground />
      <Navbar />

      <div className="mt-16 flex h-[calc(100vh-120px)] w-full flex-1 overflow-hidden">
        {sidebar ?? <Sidebar />}
        {children}
      </div>

      {footer ?? <ControlsPanel />}
    </div>
  );
}
