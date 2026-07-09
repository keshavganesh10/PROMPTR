'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScanningOverlayProps {
  isActive: boolean;
}

const SCAN_LINES = [
  { delay: 0, duration: 2.2 },
  { delay: 0.5, duration: 2.5 },
  { delay: 1.0, duration: 2.0 },
  { delay: 1.5, duration: 2.3 },
];

export default function ScanningOverlay({ isActive }: ScanningOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="scanning-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl"
        >
          {SCAN_LINES.map((line, index) => (
            <motion.div
              key={index}
              initial={{ y: '-100%' }}
              animate={{ y: '1000%' }}
              transition={{
                delay: line.delay,
                duration: line.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(92,110,60,0.2) 20%, rgba(92,110,60,0.35) 50%, rgba(92,110,60,0.2) 80%, transparent 100%)',
                boxShadow: '0 0 8px 2px rgba(92,110,60,0.08)',
              }}
            />
          ))}

          {/* Subtle overall tint pulse */}
          <motion.div
            animate={{ opacity: [0, 0.03, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[#5C6E3C]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
