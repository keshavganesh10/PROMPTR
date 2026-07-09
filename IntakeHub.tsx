'use client';

import { usePromptEngine } from '@/hooks/usePromptEngine';
import BentoCard from '@/components/BentoCard';
import IntakeHub from '@/components/IntakeHub';
import ModelSelector from '@/components/ModelSelector';
import ModeSelector from '@/components/ModeSelector';
import CheatCodeToggles from '@/components/CheatCodeToggles';
import LenzFields from '@/components/LenzFields';
import MaximiseButton from '@/components/MaximiseButton';
import ContextGatheringModal from '@/components/ContextGatheringModal';
import OutputDeck from '@/components/OutputDeck';
import WhyThisWorks from '@/components/WhyThisWorks';
import ScanningOverlay from '@/components/ScanningOverlay';
import DomainBadge from '@/components/DomainBadge';
import PromptActions from '@/components/PromptActions';
import CompareToggle from '@/components/CompareToggle';
import CompareView from '@/components/CompareView';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import { UI_STRINGS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePage() {
  const engine = usePromptEngine();

  return (
    <div className="flex-1 flex flex-col bg-[#F5EDE0] min-h-0">

      {/* ═══ FULL-HEIGHT SPLIT WORKSPACE ═══ */}
      <div className="flex-1 flex flex-col min-h-0">

        <AnimatePresence mode="wait">
          {!engine.hasResult && !engine.isProcessing ? (
            /* ═══ CONFIGURATION VIEW ═══ */
            <motion.div
              key="config"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="mx-auto max-w-[1440px] w-full px-6 py-6">
                {/* Page header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#5C6E3C]" />
                    <div className="h-5 w-px bg-[#5C6E3C]/30" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#2C1810]">Workspace</h1>
                    <p className="text-sm text-[#7A6652]">Configure and maximise your prompt</p>
                  </div>
                </div>

                {/* Top Settings Bar */}
                <div className="flex flex-col md:flex-row gap-3 mb-3">
                  {/* Mode Selector (Compact) */}
                  <BentoCard className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#B5A642]" />
                        <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">Mode</h2>
                      </div>
                      <ModeSelector selectedMode={engine.mode} onSelect={engine.setMode} />
                    </div>
                  </BentoCard>

                  {/* Cheat Codes (Compact) */}
                  <BentoCard className="flex-1">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#5C6E3C]" />
                        <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">Cheat Codes</h2>
                      </div>
                      <CheatCodeToggles selectedCodes={engine.selectedCheatCodes} onToggle={engine.toggleCheatCode} />
                    </div>
                  </BentoCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* Intake Hub — Spans 8 columns */}
                  <div className="lg:col-span-8 relative">
                    <BentoCard className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#5C6E3C]" />
                          <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">Intake Hub</h2>
                        </div>
                        <button
                          onClick={engine.autoFix}
                          className="px-3 py-1.5 rounded-full border border-[#EDE4D3] text-[#6F4E37] text-xs font-medium hover:bg-[#FEFAF3] transition-colors flex items-center justify-center gap-1.5"
                        >
                          Auto-Fix ✨
                        </button>
                      </div>
                      <div className="flex-1 relative">
                        <IntakeHub
                          value={engine.userText}
                          onChange={engine.setUserText}
                          placeholder={UI_STRINGS.placeholderText}
                          variables={engine.variables}
                          onVariableChange={engine.setVariable}
                          examples={engine.examples}
                          onExamplesChange={engine.setExamples}
                        />
                        {engine.mode === 'lenz' && (
                          <div className="mt-4">
                            <LenzFields
                              topic={engine.lenzTopic}
                              stuckPoint={engine.lenzStuckPoint}
                              onTopicChange={engine.setLenzTopic}
                              onStuckPointChange={engine.setLenzStuckPoint}
                            />
                          </div>
                        )}
                        <ScanningOverlay isActive={engine.isProcessing} />
                      </div>
                      <div className="mt-6 flex justify-end border-t border-[#EDE4D3] pt-4">
                        <div className="w-48">
                          <MaximiseButton onClick={engine.maximise} isProcessing={engine.isProcessing} />
                        </div>
                      </div>
                    </BentoCard>
                  </div>

                  {/* Target Model — Spans 4 columns */}
                  <div className="lg:col-span-4 flex flex-col gap-3">
                    <BentoCard className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#C1713A]" />
                        <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">Target Model</h2>
                      </div>
                      <ModelSelector
                        selectedModel={engine.model}
                        onSelect={engine.setModel}
                        hyperparameters={engine.hyperparameters}
                        onHyperparametersChange={engine.setHyperparameters}
                      />
                    </BentoCard>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══ OUTPUT VIEW — FULL-HEIGHT SPLIT PANELS ═══ */
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Top bar with back button */}
              <div className="shrink-0 border-b border-[#EDE4D3] bg-[#FEFAF3]/60 backdrop-blur-sm">
                <div className="mx-auto max-w-[1440px] px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={engine.reset}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer rounded-lg border border-[#EDE4D3] bg-[#FEFAF3] px-4 py-2 text-sm font-medium text-[#6F4E37] transition-colors hover:border-[#6F4E37]/30"
                    >
                      ← New Prompt
                    </motion.button>
                    
                    {engine.history.length > 0 && (
                      <select 
                        onChange={(e) => engine.revertToHistory(e.target.value)}
                        className="bg-[#FEFAF3] border border-[#EDE4D3] rounded-lg px-3 py-2 text-sm text-[#6F4E37] outline-none"
                      >
                        <option value="" disabled selected>Time-Travel (History)</option>
                        {engine.history.map((h, i) => (
                          <option key={h.id} value={h.id}>Version {i + 1} ({new Date(h.timestamp).toLocaleTimeString()})</option>
                        ))}
                      </select>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#5C6E3C]" />
                      <span className="text-sm font-medium text-[#2C1810]">
                        {engine.isProcessing ? 'Engineering...' : 'Prompt Ready'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CompareToggle
                      isCompareMode={engine.isCompareMode}
                      onToggle={engine.toggleCompareMode}
                    />
                    <div className="flex items-center gap-3 text-xs text-[#7A6652]">
                      <span className="rounded-full bg-[#5C6E3C]/10 px-3 py-1 font-medium text-[#5C6E3C]">
                        {engine.model === 'claude' ? 'Claude 3.5' :
                         engine.model === 'openai' ? 'GPT-4o' :
                         engine.model === 'gemini' ? 'Gemini' : 'Lovable/v0'}
                      </span>
                      <span className="rounded-full bg-[#C1713A]/10 px-3 py-1 font-medium text-[#C1713A]">
                        {engine.mode === 'builder' ? 'Builder' :
                         engine.mode === 'strategist' ? 'Strategist' : 'Lenz'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split panels */}
              <div className="flex-1 flex min-h-0">
                {/* Left panel — Output Deck */}
                <div className="flex-1 min-w-0 border-r border-[#EDE4D3] overflow-y-auto">
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#5C6E3C]" />
                        <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">
                          {engine.isCompareMode ? 'Model Comparison' : 'Engineered Prompt'}
                        </h2>
                      </div>
                      
                      {engine.inputAnalysis && (
                        <DomainBadge
                          domain={engine.inputAnalysis.domain}
                          taskType={engine.inputAnalysis.taskType}
                          complexity={engine.inputAnalysis.complexity}
                          technologies={engine.inputAnalysis.detectedTechnologies}
                          isVisible={engine.hasResult}
                        />
                      )}
                    </div>

                    {!engine.isCompareMode ? (
                      <>
                        <OutputDeck
                          prompt={engine.generatedPrompt}
                          isVisible={engine.hasResult}
                        />
                        <div className="flex justify-end mt-2">
                          <PromptActions
                            prompt={engine.generatedPrompt}
                            model={engine.model}
                            mode={engine.mode}
                            onRegenerate={engine.maximise}
                          />
                        </div>
                      </>
                    ) : (
                      <CompareView
                        compareResults={engine.compareResults}
                        isVisible={engine.hasResult}
                      />
                    )}
                  </div>
                </div>

                {/* Right panel — Why This Works */}
                <div className="w-[380px] shrink-0 overflow-y-auto bg-[#FEFAF3]/40 hidden lg:block">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-[#C1713A]" />
                      <h2 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider">
                        {UI_STRINGS.whyTitle}
                      </h2>
                    </div>
                    <WhyThisWorks
                      explanations={engine.explanations}
                      isVisible={engine.hasResult}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Context Gathering Modal */}
      <ContextGatheringModal
        isOpen={engine.isVague}
        suggestions={engine.contextSuggestions}
        inputAnalysis={engine.inputAnalysis}
        ghostFilledDefaults={engine.ghostFilledDefaults}
        onClose={engine.dismissCoaching}
        onSubmit={engine.applyGatheredContext}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onMaximise={engine.maximise}
        onReset={engine.reset}
        onCopy={engine.copyPrompt}
        hasResult={engine.hasResult}
      />
    </div>
  );
}
