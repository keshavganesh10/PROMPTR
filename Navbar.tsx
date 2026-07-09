'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ContextSuggestions, type InputAnalysis } from '@/lib/inputAnalyzer';

interface ContextGatheringModalProps {
  isOpen: boolean;
  suggestions: ContextSuggestions | null;
  inputAnalysis: InputAnalysis | null;
  ghostFilledDefaults: Record<string, string[]>;
  onClose: () => void;
  onSubmit: (gathered: Record<string, string[]>) => void;
}

type Category = 'goal' | 'audience' | 'constraints' | 'context';

export default function ContextGatheringModal({
  isOpen,
  suggestions,
  inputAnalysis,
  ghostFilledDefaults,
  onClose,
  onSubmit,
}: ContextGatheringModalProps) {
  const [selections, setSelections] = useState<Record<Category, string[]>>({
    goal: [],
    audience: [],
    constraints: [],
    context: [],
  });

  const [customInputs, setCustomInputs] = useState<Record<Category, string>>({
    goal: '',
    audience: '',
    constraints: '',
    context: '',
  });

  const [customInputActive, setCustomInputActive] = useState<Record<Category, boolean>>({
    goal: false,
    audience: false,
    constraints: false,
    context: false,
  });

  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Pre-fill with ghost defaults on mount if they exist
  useEffect(() => {
    if (isOpen) {
      setSelections((prev) => {
        const next = { ...prev };
        let hasDefaults = false;
        if (ghostFilledDefaults.goal?.length > 0) { next.goal = [...ghostFilledDefaults.goal]; hasDefaults = true; }
        if (ghostFilledDefaults.audience?.length > 0) { next.audience = [...ghostFilledDefaults.audience]; hasDefaults = true; }
        if (ghostFilledDefaults.constraints?.length > 0) { next.constraints = [...ghostFilledDefaults.constraints]; hasDefaults = true; }
        if (ghostFilledDefaults.context?.length > 0) { next.context = [...ghostFilledDefaults.context]; hasDefaults = true; }
        
        if (hasDefaults) setFeedbackMsg('Loaded your frequent parameters.');
        return next;
      });
    } else {
      // Reset on close
      setSelections({ goal: [], audience: [], constraints: [], context: [] });
      setCustomInputs({ goal: '', audience: '', constraints: '', context: '' });
      setCustomInputActive({ goal: false, audience: false, constraints: false, context: false });
      setFeedbackMsg('');
    }
  }, [isOpen, ghostFilledDefaults]);

  if (!isOpen || !suggestions) return null;

  const handleChipToggle = (category: Category, value: string) => {
    setSelections((prev) => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      } else {
        // Provide micro-feedback
        if (category === 'constraints') setFeedbackMsg('Excellent parameter. This prevents AI hallucination.');
        else if (category === 'audience') setFeedbackMsg('Great. Tailoring tone to the audience.');
        else setFeedbackMsg('Context added.');
        
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const handleCustomClick = (category: Category) => {
    setCustomInputActive((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleCustomChange = (category: Category, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = () => {
    const payload: Record<string, string[]> = {};
    for (const cat of ['goal', 'audience', 'constraints', 'context'] as Category[]) {
      const vals = [...selections[cat]];
      if (customInputs[cat].trim()) {
        vals.push(customInputs[cat].trim());
      }
      if (vals.length > 0) {
        payload[cat] = vals;
      }
    }
    
    // Check missing
    if (!payload.audience) {
      // Gentle warning (in reality, we close the modal, so this might not be seen long, but good for UX)
    }

    onSubmit(payload);
  };

  // Dynamic placeholders based on what is NOT selected
  const getPlaceholder = (category: Category) => {
    const rejected = suggestions[category].filter(chip => !selections[category].includes(chip));
    if (category === 'constraints' && rejected.length > 0) {
      return `What specific frameworks, stylistic rules, or formatting limits must the AI strictly follow? (e.g. not ${rejected[0].toLowerCase()})`;
    }
    if (category === 'audience' && rejected.length > 0) {
      return `Who exactly is this for? (e.g. rather than ${rejected[0].toLowerCase()})`;
    }
    return 'Type your own custom parameters here...';
  };

  const categories: { key: Category; title: string }[] = [];
  
  // Adaptive Friction Protocol: Only show categories that are NOT already satisfied
  if (!inputAnalysis?.pci || inputAnalysis.pci < 80) {
    // Only filter if we aren't completely missing everything. If it's very low PCI, we probably show all anyway if they didn't explicitly trigger it.
    // Let's filter strictly based on has[Property]
    categories.push({ key: 'goal', title: 'Goal & Deliverable' }); // Assuming we might not have extractedGoal boolean, always show unless very high PCI
    if (!inputAnalysis?.hasAudience) categories.push({ key: 'audience', title: 'Target Audience' });
    if (!inputAnalysis?.hasConstraints) categories.push({ key: 'constraints', title: 'Constraints & Style' });
    if (!inputAnalysis?.hasContext) categories.push({ key: 'context', title: 'Background Context' });
    
    // If somehow everything is satisfied but PCI is low (unlikely), ensure at least constraints shows
    if (categories.length === 0) {
      categories.push({ key: 'constraints', title: 'Constraints & Style' });
    }
  }

  // Calculate live Prompt Power Score
  const basePci = inputAnalysis?.pci || 0;
  const addedScore = Object.values(selections).reduce((acc, curr) => acc + (curr.length * 10), 0) + 
                     Object.values(customInputs).reduce((acc, curr) => acc + (curr.trim() ? 15 : 0), 0);
  const currentScore = Math.min(100, basePci + addedScore);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#2C1810]/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-8 shadow-2xl flex flex-col md:flex-row gap-8"
        >
          
          <div className="flex-1 space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-[#C1713A]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6F4E37]">
                  Intelligent Scaffolding
                </h2>
              </div>
              <h3 className="text-2xl font-bold text-[#2C1810]">
                Select missing parameters
              </h3>
              <p className="mt-2 text-sm text-[#7A6652]">
                You can select multiple options to generate distinct variants.
              </p>
            </div>

            {categories.map((cat) => (
              <div key={cat.key} className="rounded-xl border border-[#EDE4D3] bg-white p-5">
                <h4 className="mb-3 font-semibold text-[#2C1810]">{cat.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions[cat.key].map((chip) => {
                    const isSelected = selections[cat.key].includes(chip);
                    const isGhostFill = ghostFilledDefaults[cat.key]?.includes(chip);
                    
                    return (
                      <button
                        key={chip}
                        onClick={() => handleChipToggle(cat.key, chip)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-[#5C6E3C] bg-[#5C6E3C] text-white shadow-sm'
                            : isGhostFill
                              ? 'border-[#5C6E3C]/50 bg-[#5C6E3C]/10 text-[#5C6E3C] border-dashed'
                              : 'border-[#EDE4D3] bg-[#FEFAF3] text-[#6F4E37] hover:border-[#5C6E3C]/30 hover:bg-[#5C6E3C]/5'
                        }`}
                      >
                        {chip} {isGhostFill && !isSelected && ' (Frequent)'}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleCustomClick(cat.key)}
                    className={`rounded-full border border-dashed px-4 py-1.5 text-sm font-medium transition-colors ${
                      customInputActive[cat.key]
                        ? 'border-[#C1713A] bg-[#C1713A]/10 text-[#C1713A]'
                        : 'border-[#C1713A]/50 bg-transparent text-[#C1713A] hover:border-[#C1713A] hover:bg-[#C1713A]/5'
                    }`}
                  >
                    + Custom
                  </button>
                </div>

                {customInputActive[cat.key] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <textarea
                      autoFocus
                      value={customInputs[cat.key]}
                      onChange={(e) => handleCustomChange(cat.key, e.target.value)}
                      placeholder={getPlaceholder(cat.key)}
                      className="w-full resize-none rounded-lg border border-[#EDE4D3] bg-[#FEFAF3] p-3 text-sm text-[#2C1810] placeholder-[#7A6652]/50 focus:border-[#5C6E3C] focus:outline-none focus:ring-1 focus:ring-[#5C6E3C]"
                      rows={2}
                    />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Right Panel: Telemetry & Health */}
          <div className="w-full md:w-64 shrink-0 bg-[#EDE4D3]/30 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[#6F4E37] mb-6">
                Prompt Health
              </h4>
              
              <div className="mb-2 flex justify-between items-end">
                <span className="text-[#2C1810] font-bold text-3xl">{currentScore}%</span>
                <span className="text-[#7A6652] text-xs mb-1">Power Score</span>
              </div>
              
              <div className="h-2 w-full bg-[#EDE4D3] rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${currentScore > 80 ? 'bg-[#5C6E3C]' : currentScore > 50 ? 'bg-[#C1713A]' : 'bg-red-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${currentScore}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                />
              </div>
              
              <AnimatePresence mode="wait">
                <motion.p 
                  key={feedbackMsg}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-[#6F4E37] font-medium min-h-[40px]"
                >
                  {feedbackMsg || 'Select options to improve prompt power.'}
                </motion.p>
              </AnimatePresence>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleSubmit}
                className="w-full rounded-lg bg-[#2C1810] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#2C1810]/90"
              >
                Apply Context
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-lg px-5 py-2.5 text-sm font-medium text-[#7A6652] hover:bg-[#EDE4D3]/50"
              >
                Skip
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
