'use client';

import { motion } from 'framer-motion';
import BentoCard from '@/components/BentoCard';
import type { TargetModel } from '@/lib/constants';
import { getModelLabel } from '@/lib/promptHistory';

interface CompareViewProps {
  compareResults: Record<TargetModel, string>;
  isVisible: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function CompareView({ compareResults, isVisible }: CompareViewProps) {
  if (!isVisible) return null;

  const models: TargetModel[] = ['claude', 'openai', 'gemini', 'lovable'];

  const copyPrompt = (prompt: string) => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
    >
      {models.map((model) => (
        <motion.div key={model} variants={itemVariants} className="h-full">
          <BentoCard className="h-full flex flex-col p-0 overflow-hidden bg-white border-[#EDE4D3]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EDE4D3] bg-[#FEFAF3] px-5 py-3">
              <span className="text-sm font-bold text-[#2C1810]">
                {getModelLabel(model)}
              </span>
              <button
                onClick={() => copyPrompt(compareResults[model])}
                className="text-xs font-semibold text-[#5C6E3C] hover:text-[#C1713A] transition-colors"
                title={`Copy ${getModelLabel(model)} prompt`}
              >
                Copy
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[60vh] bg-white">
              {compareResults[model] ? (
                <pre
                  className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#2C1810]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {compareResults[model]}
                </pre>
              ) : (
                <div className="flex h-full items-center justify-center text-sm italic text-[#7A6652]/60">
                  Processing...
                </div>
              )}
            </div>
          </BentoCard>
        </motion.div>
      ))}
    </motion.div>
  );
}
