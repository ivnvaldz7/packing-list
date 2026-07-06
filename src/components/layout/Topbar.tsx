import {
  IconSave,
  IconPrinter,
  IconSun,
  IconMoon,
  IconPlus,
  IconList,
  IconDownload,
} from './Icons';

type TopbarProps = {
  title: string;
  subtitle?: string;
  isSaving?: boolean;
  onSave?: () => void;
  onPrint?: () => void;
  onExportExcel?: () => void;
  onNew?: () => void;
  onOpenLibrary?: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
};

export const Topbar = ({
  title,
  subtitle,
  isSaving,
  onSave,
  onPrint,
  onExportExcel,
  onNew,
  onOpenLibrary,
  theme,
  onThemeToggle,
}: TopbarProps) => {
  const btnClass =
    'flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition-all duration-150 hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/75 px-6 backdrop-blur-lg dark:border-stone-800 dark:bg-stone-950/75">
      {/* ─── Left: Title / breadcrumb ─── */}
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="truncate text-base font-semibold text-stone-800 dark:text-stone-100">
          {title}
        </h1>
        {subtitle && (
          <>
            <span className="hidden text-stone-300 dark:text-stone-600 sm:inline">·</span>
            <span className="hidden truncate text-sm text-stone-500 dark:text-stone-400 sm:inline">
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* ─── Right: Actions ─── */}
      <div className="flex items-center gap-2">
        {/* ─── Autosave indicator ─── */}
        <span
          className={`flex items-center gap-1.5 text-[11px] font-medium transition-all duration-300 ${
            isSaving ? 'text-amber-500 opacity-100' : 'text-emerald-600 opacity-100'
          }`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          {isSaving ? 'Guardando...' : 'Guardado'}
        </span>
        {onSave && (
          <button onClick={onSave} title="Guardar" className={btnClass}>
            <IconSave className="h-4 w-4" />
          </button>
        )}
        {onPrint && (
          <button onClick={onPrint} title="Imprimir" className={btnClass}>
            <IconPrinter className="h-4 w-4" />
          </button>
        )}
        {onExportExcel && (
          <button onClick={onExportExcel} title="Exportar a Excel" className={btnClass}>
            <IconDownload className="h-4 w-4" />
          </button>
        )}
        {onNew && (
          <button onClick={onNew} title="Nuevo documento" className={btnClass}>
            <IconPlus className="h-4 w-4" />
          </button>
        )}
        {onOpenLibrary && (
          <button onClick={onOpenLibrary} title="Listas guardadas" className={btnClass}>
            <IconList className="h-4 w-4" />
          </button>
        )}

        <div className="mx-1 h-5 w-px bg-stone-200 dark:bg-stone-700" />

        <button
          onClick={onThemeToggle}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          className={btnClass}
        >
          {theme === 'light' ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
};
