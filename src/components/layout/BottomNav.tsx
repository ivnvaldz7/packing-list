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
  { id: 'carga', label: 'Carga', icon: IconPackage },
];

type BottomNavProps = {
  activeStage: Stage;
  onStageChange: (stage: Stage) => void;
  onFinalize?: () => void;
  onSummaryClick?: () => void;
};

export const BottomNav = ({
  activeStage,
  onStageChange,
  onFinalize,
  onSummaryClick,
}: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200 bg-white/90 px-2 pb-safe backdrop-blur-lg dark:border-stone-800 dark:bg-stone-950/90 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeStage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onStageChange(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </button>
        );
      })}

      <button
        onClick={onSummaryClick}
        className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
      >
        <IconList className="h-5 w-5" />
        Resumen
      </button>

      {onFinalize && (
        <button
          onClick={onFinalize}
          className="flex flex-col items-center gap-0.5 rounded-lg bg-brand-500 px-4 py-2 text-[10px] font-medium text-white shadow-sm active:scale-95"
        >
          <IconCheck className="h-5 w-5" />
          Finalizar
        </button>
      )}
    </nav>
  );
};
