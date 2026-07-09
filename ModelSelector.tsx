'use client';

import { motion } from 'framer-motion';

interface CompareToggleProps {
  isCompareMode: boolean;
  onToggle: () => void;
}

export default function CompareToggle({ isCompareMode, onToggle }: CompareToggleProps) {
  return (
    <div
      className="group relative flex items-center rounded-full border border-[#EDE4D3] bg-[#FEFAF3] p-1 cursor-pointer"
      onClick={onToggle}
      title="Generate for all 4 models simultaneously"
    >
      <div className="relative z-10 flex text-xs font-semibold">
        <div
          className={`px-3 py-1.5 transition-colors duration-200 ${
            !isCompareMode ? 'text-[#FEFAF3]' : 'text-[#7A6652] hover:text-[#2C1810]'
          }`}
        >
          Single
        </div>
        <div
          className={`px-3 py-1.5 transition-colors duration-200 ${
            isCompareMode ? 'text-[#FEFAF3]' : 'text-[#7A6652] hover:text-[#2C1810]'
          }`}
        >
          Compare All
        </div>
      </div>
      
      {/* Sliding Background Indicator */}
      <motion.div
        layout
        className="absolute bottom-1 top-1 rounded-full bg-[#5C6E3C] shadow-sm z-0"
        initial={false}
        animate={{
          left: isCompareMode ? '50%' : '4px',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  );
}
