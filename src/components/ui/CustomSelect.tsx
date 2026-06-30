import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; color?: string }[];
  placeholder?: string;
  className?: string; // allow overrides of the trigger style occasionally, or wrap it
  disabled?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Recalculate position on scroll / resize while open
  useEffect(() => {
    if (!isOpen) return;

    const recalculate = () => updatePosition();
    window.addEventListener('scroll', recalculate, true);
    window.addEventListener('resize', recalculate);
    recalculate();

    return () => {
      window.removeEventListener('scroll', recalculate, true);
      window.removeEventListener('resize', recalculate);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check trigger container
      if (containerRef.current?.contains(target)) return;
      // Check portal dropdown
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);

  const dropdown = isOpen && dropdownPos
    ? createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              transformOrigin: 'top',
              zIndex: 9999,
            }}
            className="bg-[#0F1B2D] border border-white/10 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.04)]"
          >
            <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 py-1">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2.5 flex items-center gap-2 text-sm font-sans cursor-pointer transition-colors duration-100
                      ${isSelected ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'}
                    `}
                  >
                    {option.color && (
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-blue-400 ml-auto shrink-0" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/[0.04] border rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-sm font-sans transition-all duration-200 
          ${isOpen ? 'border-blue-500/40 bg-white/[0.06]' : 'border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.06]'} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedOption?.color && (
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className={`truncate ${!selectedOption ? 'text-slate-600' : 'text-slate-200'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {dropdown}
    </div>
  );
};
