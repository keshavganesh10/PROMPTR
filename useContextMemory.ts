'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UI_STRINGS } from '@/lib/constants';

interface LenzFieldsProps {
  topic: string;
  stuckPoint: string;
  onTopicChange: (v: string) => void;
  onStuckPointChange: (v: string) => void;
}

export default function LenzFields({
  topic,
  stuckPoint,
  onTopicChange,
  onStuckPointChange,
}: LenzFieldsProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="lenz-fields"
        initial={{ opacity: 0, height: 0, marginTop: 0 }}
        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="space-y-4 overflow-hidden"
      >
        {/* Topic field */}
        <div className="space-y-1.5">
          <label
            htmlFor="lenz-topic"
            className="block text-sm font-medium text-[#2C1810]"
          >
            {UI_STRINGS.lenzTopicLabel}
          </label>
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#C1713A]" />
            <input
              id="lenz-topic"
              type="text"
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              placeholder={UI_STRINGS.lenzTopicPlaceholder}
              className="
                w-full rounded-xl border border-[#EDE4D3] bg-[#FEFAF3]
                py-3 pl-5 pr-4 text-sm text-[#2C1810]
                placeholder:text-[#7A6652]/50
                transition-colors duration-200
                focus:border-[#C1713A]/60 focus:outline-none
                focus:ring-2 focus:ring-[#C1713A]/10
              "
            />
          </div>
        </div>

        {/* Stuck-point field */}
        <div className="space-y-1.5">
          <label
            htmlFor="lenz-stuck"
            className="block text-sm font-medium text-[#2C1810]"
          >
            {UI_STRINGS.lenzStuckLabel}
          </label>
          <div className="relative">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#C1713A]" />
            <input
              id="lenz-stuck"
              type="text"
              value={stuckPoint}
              onChange={(e) => onStuckPointChange(e.target.value)}
              placeholder={UI_STRINGS.lenzStuckPlaceholder}
              className="
                w-full rounded-xl border border-[#EDE4D3] bg-[#FEFAF3]
                py-3 pl-5 pr-4 text-sm text-[#2C1810]
                placeholder:text-[#7A6652]/50
                transition-colors duration-200
                focus:border-[#C1713A]/60 focus:outline-none
                focus:ring-2 focus:ring-[#C1713A]/10
              "
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
