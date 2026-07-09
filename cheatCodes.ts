'use client';

import { motion } from 'framer-motion';
import { MODES, type PromptMode } from '@/lib/constants';

interface ModeSelectorProps {
  selectedMode: PromptMode;
  onSelect: (mode: PromptMode) => void;
}

export default function ModeSelector({
  selectedMode,
  onSelect,
}: ModeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {MODES.map((mode) => {
        const isSelected = selectedMode === mode.id;
        const isLenz = mode.id === 'lenz';

        /* Accent colours depend on Lenz vs standard */
        const accentColour = isLenz ? '#C1713A' : '#6F4E37';

        return (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`
              relative flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200
              ${
                isSelected
                  ? 'bg-[#FEFAF3] shadow-sm'
                  : 'border-[#EDE4D3] bg-transparent text-[#7A6652] hover:bg-[#FEFAF3]/60 hover:text-[#2C1810]'
              }
            `}
            style={{
              borderColor: isSelected ? accentColour + '40' : undefined,
              color: isSelected ? '#2C1810' : undefined,
            }}
            title={mode.description}
          >
            {isSelected && (
              <motion.div
                layoutId="mode-selector-bg"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: accentColour + '10' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <span role="img" aria-label={mode.label} className="text-base">
                {mode.icon}
              </span>
              {mode.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
