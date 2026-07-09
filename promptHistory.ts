'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UI_STRINGS } from '@/lib/constants';

interface Explanation {
  technique: string;
  reason: string;
  icon: string;
}

interface WhyThisWorksProps {
  explanations: Explanation[];
  isVisible: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

export default function WhyThisWorks({
  explanations,
  isVisible,
}: WhyThisWorksProps) {
  return (
    <AnimatePresence>
      {isVisible && explanations.length > 0 && (
        <motion.div
          key="why-this-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >

          <div className="space-y-2">
            {explanations.map((item, index) => (
              <motion.div
                key={item.technique}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="
                  rounded-xl border border-[#EDE4D3] bg-[#FEFAF3]
                  p-4 shadow-[0_1px_2px_rgba(44,24,16,0.03)]
                "
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 text-base"
                    role="img"
                    aria-label={item.technique}
                  >
                    {item.icon}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#6F4E37]">
                      {item.technique}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#7A6652]">
                      {item.reason}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
