'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getDomainLabel, getTaskTypeLabel } from '@/lib/inputAnalyzer';
import type { Domain, TaskType, Complexity } from '@/lib/inputAnalyzer';

interface DomainBadgeProps {
  domain: string;
  taskType: string;
  complexity: string;
  technologies: string[];
  isVisible: boolean;
}

const COMPLEXITY_COLORS: Record<string, string> = {
  simple: '#5C6E3C',
  moderate: '#B5A642',
  complex: '#C1713A',
};

const COMPLEXITY_LABELS: Record<string, string> = {
  simple: 'Simple',
  moderate: 'Moderate',
  complex: 'Complex',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, x: -12, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.35 },
  },
  exit: {
    opacity: 0,
    x: -8,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export default function DomainBadge({
  domain,
  taskType,
  complexity,
  technologies,
  isVisible,
}: DomainBadgeProps) {
  const complexityColor = COMPLEXITY_COLORS[complexity] || COMPLEXITY_COLORS.simple;
  const complexityLabel = COMPLEXITY_LABELS[complexity] || 'Simple';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="domain-badges"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Domain badge */}
          <motion.span
            variants={badgeVariants}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide text-white"
            style={{ backgroundColor: '#5C6E3C' }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="opacity-80"
            >
              <circle cx="6" cy="6" r="2.5" fill="currentColor" />
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            </svg>
            {getDomainLabel(domain as Domain)}
          </motion.span>

          {/* Task type badge */}
          <motion.span
            variants={badgeVariants}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide text-white"
            style={{ backgroundColor: '#6F4E37' }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="opacity-80"
            >
              <path
                d="M2 6h8M6 2v8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {getTaskTypeLabel(taskType as TaskType)}
          </motion.span>

          {/* Complexity badge */}
          <motion.span
            variants={badgeVariants}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide text-white"
            style={{ backgroundColor: complexityColor }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="opacity-80"
            >
              <rect x="1" y="7" width="2.5" height="4" rx="0.5" fill="currentColor" />
              <rect
                x="4.75"
                y="4"
                width="2.5"
                height="7"
                rx="0.5"
                fill="currentColor"
                opacity={complexity === 'simple' ? 0.3 : 1}
              />
              <rect
                x="8.5"
                y="1"
                width="2.5"
                height="10"
                rx="0.5"
                fill="currentColor"
                opacity={complexity === 'complex' ? 1 : 0.3}
              />
            </svg>
            {complexityLabel}
          </motion.span>

          {/* Separator dot */}
          {technologies.length > 0 && (
            <motion.span
              variants={badgeVariants}
              className="shrink-0 text-[#EDE4D3]"
              aria-hidden
            >
              ·
            </motion.span>
          )}

          {/* Technology badges */}
          {technologies.map((tech) => (
            <motion.span
              key={tech}
              variants={badgeVariants}
              className="inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide"
              style={{
                borderColor: '#EDE4D3',
                color: '#7A6652',
                backgroundColor: 'rgba(254,250,243,0.7)',
              }}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
