'use client';

import { motion } from 'framer-motion';
import { CHEAT_CODES } from '@/lib/cheatCodes';

interface CheatCodeTogglesProps {
  selectedCodes: string[];
  onToggle: (id: string) => void;
}

export default function CheatCodeToggles({
  selectedCodes,
  onToggle,
}: CheatCodeTogglesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHEAT_CODES.map((code) => {
        const isActive = selectedCodes.includes(code.id);

        return (
          <button
            key={code.id}
            onClick={() => onToggle(code.id)}
            className={`
              relative flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200
              ${
                isActive
                  ? 'border-[#5C6E3C]/40 bg-[#5C6E3C]/10 text-[#2C1810] shadow-sm'
                  : 'border-[#EDE4D3] bg-transparent text-[#7A6652] hover:bg-[#FEFAF3] hover:text-[#2C1810]'
              }
            `}
            title={code.shortDescription}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                isActive ? 'bg-[#5C6E3C]' : 'bg-[#EDE4D3]'
              }`}
            />
            {code.label}
          </button>
        );
      })}
    </div>
  );
}
