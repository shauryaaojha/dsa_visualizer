import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { SECTIONS } from "@/data/curriculum";

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-container/80 px-gutter backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-md">
        <span className="font-headline-md text-headline-md font-bold text-primary">&lt;DS/&gt;</span>
        <span className="ml-sm hidden rounded-sm border border-outline-variant bg-surface-container-high px-2 py-1 font-label-caps text-label-caps text-on-surface-variant sm:inline">
          DS_VISUALIZER
        </span>
      </Link>

      <div className="hidden items-center gap-4 overflow-x-auto lg:flex">
        {SECTIONS.map((s) =>
          s.status === "available" ? (
            <Link
              key={s.slug}
              href={`/topics/${s.slug}`}
              className="font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
            >
              {s.title}
            </Link>
          ) : (
            <span
              key={s.slug}
              title="Coming soon"
              className="cursor-not-allowed font-label-caps text-label-caps text-on-surface-variant/40"
            >
              {s.title}
            </span>
          ),
        )}
      </div>

      <Link
        href="/topics/arrays"
        className="flex items-center gap-1.5 border border-primary-container bg-primary-container px-4 py-2 font-label-caps text-label-caps text-surface transition-transform hover:bg-opacity-90 active:scale-95"
      >
        <Icon name="explore" className="text-[16px]" />
        Explore
      </Link>
    </nav>
  );
}
