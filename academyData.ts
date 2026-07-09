'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODELS, type TargetModel } from '@/lib/constants';

export interface Hyperparameters {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
}

interface ModelSelectorProps {
  selectedModel: TargetModel;
  onSelect: (model: TargetModel) => void;
  hyperparameters?: Hyperparameters;
  onHyperparametersChange?: (params: Hyperparameters) => void;
}

export default function ModelSelector({
  selectedModel,
  onSelect,
  hyperparameters = { temperature: 0.7, topP: 1, frequencyPenalty: 0 },
  onHyperparametersChange,
}: ModelSelectorProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleParamChange = (key: keyof Hyperparameters, value: number) => {
    if (onHyperparametersChange) {
      onHyperparametersChange({
        ...hyperparameters,
        [key]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;

          return (
            <motion.button
              key={model.id}
              layout
              onClick={() => onSelect(model.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative cursor-pointer rounded-xl border p-3 text-left
                transition-colors duration-200
                ${
                  isSelected
                    ? 'border-[#5C6E3C] bg-[#5C6E3C]/[0.05]'
                    : 'border-[#EDE4D3] bg-[#FEFAF3] hover:border-[#5C6E3C]/40'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="model-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-[#5C6E3C]"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label={model.label}>
                    {model.icon}
                  </span>
                  <span className="text-sm font-semibold text-[#2C1810]">
                    {model.label}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#7A6652]">
                  {model.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#EDE4D3] bg-[#FEFAF3] overflow-hidden">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-[#2C1810] hover:bg-[#5C6E3C]/5 transition-colors"
        >
          <span>Advanced Settings</span>
          <motion.svg
            animate={{ rotate: isAdvancedOpen ? 180 : 0 }}
            className="w-4 h-4 text-[#7A6652]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 pt-0 space-y-4 border-t border-[#EDE4D3]">
                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#2C1810]">Temperature</label>
                    <span className="text-xs text-[#7A6652]">{hyperparameters.temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={hyperparameters.temperature}
                    onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
                    className="w-full accent-[#5C6E3C]"
                  />
                  <p className="text-[10px] text-[#7A6652]">Controls randomness: lower is more deterministic, higher is more creative.</p>
                </div>

                {/* Top-P */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#2C1810]">Top-P</label>
                    <span className="text-xs text-[#7A6652]">{hyperparameters.topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={hyperparameters.topP}
                    onChange={(e) => handleParamChange('topP', parseFloat(e.target.value))}
                    className="w-full accent-[#5C6E3C]"
                  />
                  <p className="text-[10px] text-[#7A6652]">Nucleus sampling: limits token choices to top probability mass.</p>
                </div>

                {/* Frequency Penalty */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[#2C1810]">Frequency Penalty</label>
                    <span className="text-xs text-[#7A6652]">{hyperparameters.frequencyPenalty.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={hyperparameters.frequencyPenalty}
                    onChange={(e) => handleParamChange('frequencyPenalty', parseFloat(e.target.value))}
                    className="w-full accent-[#5C6E3C]"
                  />
                  <p className="text-[10px] text-[#7A6652]">Penalizes new tokens based on their existing frequency in the text.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
