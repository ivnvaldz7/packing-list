import { createPortal } from 'react-dom';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import type { Product } from '../types';

const formatProductInputLabel = (product: Product): string => product.name;

const normalizeSearch = (value: string): string => value.trim().toLocaleLowerCase();

type ProductComboboxProps = {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
  className: string;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  title?: string;
  placeholder?: string;
};

type PanelPosition = {
  top: number;
  left: number;
  minWidth: number;
  maxWidth: number;
};

const panelOffset = 4;
const estimatedMinPanelWidth = 320;
const horizontalMargin = 16;

export const ProductCombobox = ({
  products,
  value,
  onChange,
  className,
  label,
  disabled = false,
  readOnly = false,
  title,
  placeholder = 'Seleccionar producto',
}: ProductComboboxProps) => {
  const listboxId = useId();
  const triggerRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedProduct = products.find((product) => product.id === value);
  const selectedLabel = selectedProduct ? formatProductInputLabel(selectedProduct) : '';
  const [draftValue, setDraftValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const isInteractive = !disabled && !readOnly;
  const inputValue = isSearching ? draftValue : selectedLabel;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeSearch(inputValue);

    if (!isSearching || !normalizedQuery) {
      return [];
    }

    return products.filter((product) => {
      const code = product.code.toLocaleLowerCase();
      const name = product.name.toLocaleLowerCase();
      return code.includes(normalizedQuery) || name.includes(normalizedQuery);
    });
  }, [inputValue, isSearching, products]);

  const measurePanelPosition = useCallback((): PanelPosition | null => {
    const rect = triggerRef.current?.getBoundingClientRect();

    if (!rect) {
      return null;
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const maxViewportWidth = Math.max(viewportWidth - horizontalMargin * 2, rect.width);
    const preferredWidth = Math.min(Math.max(rect.width, estimatedMinPanelWidth), maxViewportWidth);
    const left = Math.min(
      Math.max(rect.left, horizontalMargin),
      Math.max(horizontalMargin, viewportWidth - horizontalMargin - preferredWidth),
    );

    return {
      top: rect.bottom + panelOffset,
      left,
      minWidth: rect.width,
      maxWidth: Math.max(rect.width, viewportWidth - horizontalMargin - left),
    };
  }, []);

  const openDropdown = () => {
    if (!isInteractive) {
      return;
    }

    setPanelPosition(measurePanelPosition());
    setIsOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const restoreSelectedValue = useCallback(() => {
    setDraftValue('');
    setIsSearching(false);
  }, []);

  const closeAndRestore = useCallback(() => {
    restoreSelectedValue();
    closeDropdown();
  }, [closeDropdown, restoreSelectedValue]);

  const selectProduct = (product: Product) => {
    setDraftValue('');
    setIsSearching(false);
    onChange(product.id);
    closeDropdown();
  };

  const clearSelection = () => {
    setDraftValue('');
    setIsSearching(false);
    onChange('');
    closeDropdown();
    triggerRef.current?.focus();
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (filteredProducts.length === 0) {
      return;
    }

    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0) {
        return filteredProducts.length - 1;
      }
      if (nextIndex >= filteredProducts.length) {
        return 0;
      }
      return nextIndex;
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isInteractive) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
        setActiveIndex(0);
      } else {
        moveActiveOption(1);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openDropdown();
        setActiveIndex(Math.max(filteredProducts.length - 1, 0));
      } else {
        moveActiveOption(-1);
      }
      return;
    }

    if (event.key === 'Enter') {
      if (isOpen && filteredProducts[activeIndex]) {
        event.preventDefault();
        selectProduct(filteredProducts[activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndRestore();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      closeAndRestore();
    };

    const updatePanelPosition = () => {
      setPanelPosition(measurePanelPosition());
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [closeAndRestore, isOpen, measurePanelPosition]);

  const panelStyle: CSSProperties | undefined = panelPosition
    ? {
        position: 'fixed',
        top: panelPosition.top,
        left: panelPosition.left,
        minWidth: panelPosition.minWidth,
        width: `min(${Math.max(panelPosition.minWidth, estimatedMinPanelWidth)}px, calc(100vw - ${
          horizontalMargin * 2
        }px))`,
        maxWidth: `min(${panelPosition.maxWidth}px, calc(100vw - ${horizontalMargin * 2}px))`,
        overflowX: 'hidden',
        zIndex: 1000,
      }
    : undefined;

  const dropdown =
    isOpen && isInteractive
      ? createPortal(
          <div
            ref={panelRef}
            className="rounded-lg border border-stone-200 bg-white text-sm shadow-lg dark:border-stone-700 dark:bg-stone-900"
            style={panelStyle}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-60 overflow-x-hidden overflow-y-auto py-1"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const isActive = index === activeIndex;
                  const isSelected = product.id === value;

                  return (
                    <li
                      id={`${listboxId}-option-${product.id}`}
                      key={product.id}
                      role="option"
                      aria-label={product.name}
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectProduct(product)}
                      className={`cursor-pointer whitespace-normal break-words px-3 py-2 text-left text-stone-800 hover:bg-brand-50 dark:text-stone-100 dark:hover:bg-stone-800 ${
                        isActive ? 'bg-brand-50 dark:bg-stone-800' : ''
                      }`}
                    >
                      {product.name}
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-2 text-left text-stone-500 dark:text-stone-400">
                  {isSearching && normalizeSearch(inputValue)
                    ? 'Sin resultados'
                    : 'Escribi para buscar'}
                </li>
              )}
            </ul>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <input
        ref={triggerRef}
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={isOpen && isInteractive}
        aria-haspopup="listbox"
        aria-activedescendant={
          isOpen && filteredProducts[activeIndex]
            ? `${listboxId}-option-${filteredProducts[activeIndex].id}`
            : undefined
        }
        autoComplete="off"
        value={inputValue}
        placeholder={placeholder}
        onClick={openDropdown}
        onFocus={openDropdown}
        onChange={(event) => {
          const nextValue = event.target.value;
          const typedOverSelectedLabel =
            selectedLabel && inputValue === selectedLabel && nextValue.startsWith(selectedLabel);

          if (nextValue === '') {
            setDraftValue('');
            setIsSearching(false);
            setActiveIndex(0);
            onChange('');
            openDropdown();
            return;
          }

          setDraftValue(typedOverSelectedLabel ? nextValue.slice(selectedLabel.length) : nextValue);
          setIsSearching(true);
          setActiveIndex(0);
          openDropdown();
        }}
        onBlur={(event) => {
          const nextFocusedElement = event.relatedTarget;

          if (nextFocusedElement && panelRef.current?.contains(nextFocusedElement)) {
            return;
          }

          closeAndRestore();
        }}
        onKeyDown={handleInputKeyDown}
        className={className}
        title={title}
        readOnly={readOnly}
        disabled={disabled}
      />

      {value && isInteractive && (
        <button
          type="button"
          aria-label="Limpiar producto"
          tabIndex={-1}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={clearSelection}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          ×
        </button>
      )}

      {dropdown}
    </div>
  );
};
