'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntakeHubProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  variables?: Record<string, string>;
  onVariableChange?: (name: string, val: string) => void;
  examples?: Array<{input: string, output: string}>;
  onExamplesChange?: (examples: Array<{input: string, output: string}>) => void;
}

const SUGGESTIONS = [
  { label: '+ Context', append: '\nContext: ' },
  { label: '+ Target Audience', append: '\nTarget Audience: ' },
  { label: '+ Constraints', append: '\nConstraints: ' },
  { label: '+ Output Format', append: '\nOutput Format: ' },
];

function estimateTokens(text: string) {
  return Math.ceil((text || '').length / 4);
}

export default function IntakeHub({
  value,
  onChange,
  placeholder,
  variables,
  onVariableChange,
  examples,
  onExamplesChange,
}: IntakeHubProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showExamples, setShowExamples] = useState(false);

  const variableMatches = Array.from((value || '').matchAll(/\{\{([^}]+)\}\}/g));
  const uniqueVariables = Array.from(new Set(variableMatches.map(m => m[1].trim())));

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  const handleSuggestionClick = (appendStr: string) => {
    const newVal = value ? `${value}${appendStr}` : appendStr.trimStart();
    onChange(newVal);
    // Focus the textarea after appending
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = newVal.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor="intake-hub"
          className="block text-sm font-medium text-[#7A6652]"
        >
          Your Prompt
        </label>
        
        {/* Helper prompt ideas */}
        <span className="text-xs text-[#7A6652]/60 hidden sm:inline-block">
          Tip: Add constraints or context to get better results
        </span>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id="intake-hub"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          rows={6}
          className="
            relative z-10 w-full resize-none rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3]
            px-4 py-3 text-sm leading-relaxed text-[#2C1810]
            placeholder:text-[#7A6652]/40
            transition-all duration-200
            focus:border-[#5C6E3C] focus:outline-none
            focus:ring-2 focus:ring-[#5C6E3C]/10
            shadow-[inset_0_2px_4px_rgba(44,24,16,0.02)]
          "
          style={{ minHeight: '9rem' }}
        />

        {/* Suggestion Chips */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 flex flex-wrap gap-2"
            >
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  onClick={() => handleSuggestionClick(sug.append)}
                  className="
                    rounded-lg border border-[#EDE4D3] bg-[#F5EDE0] px-3 py-1.5 
                    text-xs font-medium text-[#6F4E37] transition-colors
                    hover:border-[#6F4E37]/30 hover:bg-[#EDE4D3]
                  "
                >
                  {sug.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variables Section */}
        <AnimatePresence>
          {uniqueVariables.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 rounded-xl border border-[#EDE4D3] bg-[#FEFAF3] p-4 overflow-hidden"
            >
              <h4 className="text-xs font-semibold text-[#7A6652] mb-3 uppercase tracking-wider">Variables</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uniqueVariables.map(v => (
                  <div key={v} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#6F4E37]">{v}</label>
                    <input
                      type="text"
                      value={variables?.[v] || ''}
                      onChange={(e) => onVariableChange?.(v, e.target.value)}
                      className="
                        w-full rounded-lg border border-[#EDE4D3] bg-white
                        px-3 py-2 text-sm text-[#2C1810]
                        focus:border-[#5C6E3C] focus:outline-none focus:ring-1 focus:ring-[#5C6E3C]
                      "
                      placeholder={`Enter value for ${v}`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Examples Section Toggle & Token Counter */}
        <div className="mt-4 flex justify-between items-center">
           <button
             onClick={() => setShowExamples(!showExamples)}
             className="text-sm font-medium text-[#5C6E3C] hover:text-[#5C6E3C]/80 transition-colors flex items-center gap-1"
           >
             {showExamples ? '− Hide Examples' : '+ Add Few-Shot Examples'}
           </button>
           
           <div className="text-xs font-medium text-[#7A6652]/80">
              {(() => {
                const examplesText = (examples || []).map(ex => ex.input + ex.output).join('');
                const tokens = estimateTokens(value + examplesText);
                const cost = (tokens * 0.0001).toFixed(4);
                return `~${tokens} tokens ($${cost})`;
              })()}
           </div>
        </div>

        <AnimatePresence>
          {showExamples && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="mt-4 space-y-4 overflow-hidden"
             >
                {(examples || []).map((ex, idx) => (
                  <div key={idx} className="relative rounded-xl border border-[#EDE4D3] bg-[#FEFAF3] p-4 pt-8 shadow-sm">
                    <button 
                      onClick={() => {
                        const newEx = [...(examples || [])];
                        newEx.splice(idx, 1);
                        onExamplesChange?.(newEx);
                      }}
                      className="absolute top-2 right-3 text-xs text-[#C1713A] hover:text-[#C1713A]/80 font-medium transition-colors"
                    >
                      Remove
                    </button>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#7A6652] mb-1">Input</label>
                        <textarea
                          value={ex.input}
                          onChange={(e) => {
                             const newEx = [...(examples || [])];
                             newEx[idx].input = e.target.value;
                             onExamplesChange?.(newEx);
                          }}
                          className="w-full rounded-lg border border-[#EDE4D3] bg-white px-3 py-2 text-sm text-[#2C1810] focus:border-[#5C6E3C] focus:outline-none focus:ring-1 focus:ring-[#5C6E3C] resize-y min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#7A6652] mb-1">Output</label>
                        <textarea
                          value={ex.output}
                          onChange={(e) => {
                             const newEx = [...(examples || [])];
                             newEx[idx].output = e.target.value;
                             onExamplesChange?.(newEx);
                          }}
                          className="w-full rounded-lg border border-[#EDE4D3] bg-white px-3 py-2 text-sm text-[#2C1810] focus:border-[#5C6E3C] focus:outline-none focus:ring-1 focus:ring-[#5C6E3C] resize-y min-h-[60px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const newEx = [...(examples || []), {input: '', output: ''}];
                    onExamplesChange?.(newEx);
                  }}
                  className="w-full rounded-xl border border-dashed border-[#C1713A]/40 bg-[#FEFAF3] py-3 text-sm font-medium text-[#C1713A] hover:bg-[#C1713A]/5 transition-colors"
                >
                  + Add another example
                </button>
             </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
