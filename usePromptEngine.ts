'use client';

import { motion } from 'framer-motion';

interface MaximiseButtonProps {
  onClick: () => void;
  isProcessing: boolean;
}

function AnimatedEllipsis() {
  return (
    <span className="inline-flex w-6 justify-start">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}

export default function MaximiseButton({
  onClick,
  isProcessing,
}: MaximiseButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isProcessing}
      whileHover={isProcessing ? {} : { scale: 1.02 }}
      whileTap={isProcessing ? {} : { scale: 0.98 }}
      className={`
        relative w-full cursor-pointer rounded-xl px-8 py-4
        text-lg font-semibold text-[#FEFAF3]
        transition-shadow duration-300
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#5C6E3C]/50 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${
          isProcessing
            ? 'bg-[#5C6E3C]/80'
            : 'bg-[#5C6E3C] hover:shadow-[0_0_20px_rgba(92,110,60,0.25),0_4px_12px_rgba(92,110,60,0.15)]'
        }
      `}
    >
      {/* Pulsing glow behind button when processing */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-[#5C6E3C]"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <span className="relative z-10 flex items-center justify-center gap-1">
        {isProcessing ? (
          <>
            Engineering
            <AnimatedEllipsis />
          </>
        ) : (
          'Maximise Prompt'
        )}
      </span>
    </motion.button>
  );
}
