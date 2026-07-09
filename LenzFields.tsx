'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

const colSpanMap = {
  1: 'col-span-1',
  2: 'col-span-2',
} as const;

const rowSpanMap = {
  1: 'row-span-1',
  2: 'row-span-2',
} as const;

export default function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2 }}
      className={`
        group relative overflow-hidden
        rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3]
        shadow-[0_1px_3px_rgba(44,24,16,0.04),0_4px_12px_rgba(44,24,16,0.03)]
        transition-shadow duration-300
        hover:shadow-[0_2px_6px_rgba(44,24,16,0.06),0_8px_24px_rgba(44,24,16,0.05)]
        ${colSpanMap[colSpan]} ${rowSpanMap[rowSpan]}
        ${className}
      `}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, rgba(92,110,60,0.03) 0%, rgba(193,113,58,0.02) 100%)',
        }}
      />

      <div className="relative z-10 p-5">{children}</div>
    </motion.div>
  );
}
