'use client';

import { motion } from 'framer-motion';
import { UI_STRINGS } from '@/lib/constants';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-start gap-4 py-8"
    >
      <div className="flex items-center gap-3">
        {/* Decorative moss accent */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-[#5C6E3C]" />
          <div className="h-6 w-px bg-[#5C6E3C]/30" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#2C1810]">
            {UI_STRINGS.appName}
          </h1>
          <p className="mt-1 text-sm text-[#7A6652]">
            {UI_STRINGS.strapline}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
