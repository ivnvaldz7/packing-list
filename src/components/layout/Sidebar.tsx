import { type FC } from 'react';
import { IconLabels, IconClipboard, IconPackage, IconList, IconCheck } from './Icons';

type Stage = 'carteles' | 'preparacion' | 'carga';

type NavItem = {
  id: Stage;
  label: string;
  icon: FC<{ className?: string }>;
};

const navItems: NavItem[] = [
  { id: 'carteles', label: 'Carteles', icon: IconLabels },
  { id: 'preparacion', label: 'Preparación', icon: IconClipboard },
  { id: 'carga', label: 'Carga final', icon: IconPackage },
];

type SidebarProps = {
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
  onFinalize?: () => void;
  onSummaryClick?: () => void;
};

export const Sidebar = ({
  activeStage,
  onStageChange,
  onFinalize,
  onSummaryClick,
}: SidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center border-r border-stone-200 bg-white/90 py-3 shadow-sm backdrop-blur-lg transition-all duration-200 dark:border-stone-800 dark:bg-stone-950/90">
      {/* ─── Logo ─── */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">
        AB
      </div>

      {/* ─── Navegación ─── */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onStageChange(item.id)}
              title={item.label}
              className={`
                group relative flex h-10 w-10 items-center justify-center rounded-lg
                transition-all duration-150
                ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 ring-1 ring-brand-200 dark:bg-brand-950 dark:text-brand-400 dark:ring-brand-800'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200'
                }
              `}
            >
              <Icon className="h-5 w-5" />

              {/* ─── Tooltip ─── */}
              <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block dark:bg-stone-100 dark:text-stone-900">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ─── Resumen ─── */}
      <div className="mb-2">
        <button
          onClick={onSummaryClick}
          title="Resumen"
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <IconList className="h-5 w-5" />
          <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block dark:bg-stone-100 dark:text-stone-900">
            Resumen
          </span>
        </button>
      </div>

      {/* ─── Finalizar ─── */}
      {onFinalize && (
        <button
          onClick={onFinalize}
          title="Finalizar"
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-95"
        >
          <IconCheck className="h-5 w-5" />
          <span className="absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
            Finalizar
          </span>
        </button>
      )}
    </aside>
  );
};
