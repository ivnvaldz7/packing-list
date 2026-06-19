import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type Stage = 'carteles' | 'preparacion' | 'carga';

type LayoutProps = {
  children: ReactNode;

  /* ─── Sidebar / BottomNav ─── */
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
  onFinalize?: () => void;
  onSummaryClick?: () => void;

  /* ─── Topbar ─── */
  title: string;
  subtitle?: string;
  onSave?: () => void;
  onPrint?: () => void;
  onNew?: () => void;
  onOpenLibrary?: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
};

export const Layout = ({
  children,
  activeStage,
  onStageChange,
  onFinalize,
  onSummaryClick,
  title,
  subtitle,
  onSave,
  onPrint,
  onNew,
  onOpenLibrary,
  theme,
  onThemeToggle,
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 dark:bg-stone-950 dark:text-stone-100">
      {/* ─── Sidebar: solo desktop ─── */}
      <div className="hidden lg:block">
        <Sidebar
          activeStage={activeStage}
          onStageChange={onStageChange}
          onFinalize={onFinalize}
          onSummaryClick={onSummaryClick}
        />
      </div>

      {/* ─── Main content ─── */}
      <div className="lg:pl-16">
        <Topbar
          title={title}
          subtitle={subtitle}
          onSave={onSave}
          onPrint={onPrint}
          onNew={onNew}
          onOpenLibrary={onOpenLibrary}
          theme={theme}
          onThemeToggle={onThemeToggle}
        />

        {/* ─── Canvas ─── */}
        <main className="mx-auto max-w-5xl px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-6">
          {children}
        </main>
      </div>

      {/* ─── BottomNav: solo mobile ─── */}
      <div className="lg:hidden">
        <BottomNav
          activeStage={activeStage}
          onStageChange={onStageChange}
          onFinalize={onFinalize}
          onSummaryClick={onSummaryClick}
        />
      </div>
    </div>
  );
};
