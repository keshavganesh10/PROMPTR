'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  enginePrompt,
  type PromptInput,
  type EngineResult,
  type ExplanationItem,
} from '@/lib/promptEngine';
import { savePrompt } from '@/lib/promptHistory';
import { analyzeInput, generateContextSuggestions, type InputAnalysis, type ContextSuggestions } from '@/lib/inputAnalyzer';
import type { TargetModel, PromptMode } from '@/lib/constants';
import { useContextMemory } from './useContextMemory';
import type { Hyperparameters } from '@/components/ModelSelector';

interface UsePromptEngineReturn {
  // State
  userText: string;
  model: TargetModel;
  mode: PromptMode;
  selectedCheatCodes: string[];
  lenzTopic: string;
  lenzStuckPoint: string;
  generatedPrompt: string;
  explanations: ExplanationItem[];
  isProcessing: boolean;
  isVague: boolean;
  coachingQuestions: string[];
  hasResult: boolean;

  // New State
  variables: Record<string, string>;
  examples: Array<{input: string, output: string}>;
  hyperparameters: Hyperparameters;
  history: Array<{ id: string; userText: string; generatedPrompt: string; timestamp: number }>;

  // Input analysis (live as user types)
  inputAnalysis: InputAnalysis | null;

  // Compare mode
  isCompareMode: boolean;
  compareResults: Record<TargetModel, string>;

  contextSuggestions: ContextSuggestions | null;
  ghostFilledDefaults: Record<string, string[]>;
  recordSelections: (selections: Record<string, string[]>) => void;

  // Actions
  setUserText: (text: string) => void;
  setModel: (model: TargetModel) => void;
  setMode: (mode: PromptMode) => void;
  toggleCheatCode: (id: string) => void;
  setLenzTopic: (topic: string) => void;
  setLenzStuckPoint: (point: string) => void;
  setVariable: (name: string, val: string) => void;
  setExamples: (examples: Array<{input: string, output: string}>) => void;
  setHyperparameters: (params: Hyperparameters) => void;
  autoFix: () => void;
  revertToHistory: (id: string) => void;

  maximise: () => void;
  applyGatheredContext: (gathered: Record<string, string[]>) => void;
  dismissCoaching: () => void;
  reset: () => void;
  toggleCompareMode: () => void;
  copyPrompt: () => void;
}

export function usePromptEngine(): UsePromptEngineReturn {
  const { ghostFilledDefaults, recordSelections } = useContextMemory();
  
  const [userText, setUserText] = useState('');
  const [model, setModel] = useState<TargetModel>('claude');
  const [mode, setMode] = useState<PromptMode>('builder');
  const [selectedCheatCodes, setSelectedCheatCodes] = useState<string[]>([]);
  const [lenzTopic, setLenzTopic] = useState('');
  const [lenzStuckPoint, setLenzStuckPoint] = useState('');

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [explanations, setExplanations] = useState<ExplanationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVague, setIsVague] = useState(false);
  const [coachingQuestions, setCoachingQuestions] = useState<string[]>([]);
  const [contextSuggestions, setContextSuggestions] = useState<ContextSuggestions | null>(null);
  const [hasResult, setHasResult] = useState(false);

  // New states
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [examples, setExamples] = useState<Array<{input: string, output: string}>>([]);
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({ temperature: 0.7, topP: 1, frequencyPenalty: 0 });
  const [history, setHistory] = useState<Array<{ id: string; userText: string; generatedPrompt: string; timestamp: number }>>([]);

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState<Record<TargetModel, string>>({
    claude: '',
    openai: '',
    gemini: '',
    lovable: '',
  });

  // Live input analysis — updates as user types (debounced via useMemo)
  const inputAnalysis = useMemo(() => {
    const trimmed = userText.trim();
    if (trimmed.length < 5) return null;
    return analyzeInput(trimmed);
  }, [userText]);

  const toggleCheatCode = useCallback((id: string) => {
    setSelectedCheatCodes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => !prev);
  }, []);

  const copyPrompt = useCallback(() => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
    }
  }, [generatedPrompt]);

  const setVariable = useCallback((name: string, val: string) => {
    setVariables(prev => ({ ...prev, [name]: val }));
  }, []);

  const autoFix = useCallback(() => {
    // Simulate AI enhancing the prompt
    setIsProcessing(true);
    setTimeout(() => {
      // Add chain of thought or anti-sycophant based on mode
      if (mode === 'builder' || mode === 'orchestrator') {
        setSelectedCheatCodes(prev => Array.from(new Set([...prev, 'chain-of-thought', 'no-yapping'])));
      } else if (mode === 'strategist') {
        setSelectedCheatCodes(prev => Array.from(new Set([...prev, 'anti-sycophant'])));
      } else {
        setSelectedCheatCodes(prev => Array.from(new Set([...prev, 'socratic-maieutics'])));
      }
      setIsProcessing(false);
    }, 800);
  }, [mode]);

  const revertToHistory = useCallback((id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setUserText(item.userText);
      setGeneratedPrompt(item.generatedPrompt);
    }
  }, [history]);

  const maximise = useCallback(() => {
    if (!userText.trim()) return;

    setIsProcessing(true);
    setHasResult(false);
    setIsVague(false);
    setCoachingQuestions([]);

    // Simulate processing delay for the scanning animation
    setTimeout(() => {
      const input: PromptInput = {
        userText: userText.trim(),
        model,
        mode,
        selectedCheatCodes,
        lenzTopic: mode === 'lenz' ? lenzTopic : undefined,
        lenzStuckPoint: mode === 'lenz' ? lenzStuckPoint : undefined,
      };

      const result: EngineResult = enginePrompt(input);

      // Skip the modal completely if Prompt Completeness Index is high enough (>80)
      if (result.isVague && (!inputAnalysis || inputAnalysis.pci <= 80)) {
        setIsVague(true);
        setCoachingQuestions(result.coachingQuestions || []);
        
        if (inputAnalysis) {
          setContextSuggestions(generateContextSuggestions(inputAnalysis));
        }
        
        setIsProcessing(false);
        return;
      }

      setGeneratedPrompt(result.prompt);
      setExplanations(result.explanations);
      setHasResult(true);
      setIsProcessing(false);

      // Generate compare results if in compare mode
      if (isCompareMode) {
        const models: TargetModel[] = ['claude', 'openai', 'gemini', 'lovable'];
        const newCompareResults: Record<string, string> = {};
        for (const m of models) {
          const compareInput: PromptInput = {
            userText: userText.trim(),
            model: m,
            mode,
            selectedCheatCodes,
            lenzTopic: mode === 'lenz' ? lenzTopic : undefined,
            lenzStuckPoint: mode === 'lenz' ? lenzStuckPoint : undefined,
          };
          const compareResult = enginePrompt(compareInput);
          newCompareResults[m] = compareResult.prompt;
        }
        setCompareResults(newCompareResults as Record<TargetModel, string>);
      }

      // Save to local storage history
      savePrompt({
        userText: userText.trim(),
        model,
        mode,
        cheatCodes: selectedCheatCodes,
        generatedPrompt: result.prompt,
        lenzTopic: mode === 'lenz' ? lenzTopic : undefined,
        lenzStuckPoint: mode === 'lenz' ? lenzStuckPoint : undefined,
      });

      // Save to runtime history for time-travel
      setHistory(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          userText: userText.trim(),
          generatedPrompt: result.prompt,
          timestamp: Date.now(),
        }
      ]);
    }, 2200); // 2.2s for the scanning animation effect
  }, [userText, model, mode, selectedCheatCodes, lenzTopic, lenzStuckPoint, isCompareMode]);

  const applyGatheredContext = useCallback((gathered: Record<string, string[]>) => {
    let newText = userText.trim();
    
    let hasVariants = false;
    
    if (gathered.goal && gathered.goal.length > 0) newText += `\nGoal: ${gathered.goal.join(', ')}`;
    if (gathered.audience && gathered.audience.length > 0) {
      if (gathered.audience.length > 1) hasVariants = true;
      newText += `\nAudience: ${gathered.audience.join(' AND ')}`;
    }
    if (gathered.constraints && gathered.constraints.length > 0) {
      if (gathered.constraints.length > 1 && !hasVariants) {
        // Just multiple constraints, maybe not full variants, but we can instruct multiple outputs if desired
        // Actually, the user asked specifically about Audience branching: "If the user selects both [C-Suite] AND [Junior Developers]... automatically branch the output".
      }
      newText += `\nConstraints: ${gathered.constraints.join(', ')}`;
    }
    if (gathered.context && gathered.context.length > 0) newText += `\nContext: ${gathered.context.join('; ')}`;
    
    if (hasVariants) {
      newText += `\n\n[SYSTEM INSTRUCTION: Produce distinct variants of the output tailored to the multiple audiences specified above (e.g., Variant A, Variant B).]`;
    }
    
    // Save to memory
    recordSelections(gathered);
    
    setUserText(newText);
    setIsVague(false);
    setContextSuggestions(null);
    
    // Trigger generation again
    setTimeout(() => {
    }, 0);
  }, [userText, recordSelections]);

  const dismissCoaching = useCallback(() => {
    setIsVague(false);
    setCoachingQuestions([]);
    setContextSuggestions(null);
  }, []);

  const reset = useCallback(() => {
    setGeneratedPrompt('');
    setExplanations([]);
    setHasResult(false);
    setIsVague(false);
    setCoachingQuestions([]);
    setCompareResults({ claude: '', openai: '', gemini: '', lovable: '' });
  }, []);

  return {
    userText,
    model,
    mode,
    selectedCheatCodes,
    lenzTopic,
    lenzStuckPoint,
    generatedPrompt,
    explanations,
    isProcessing,
    isVague,
    coachingQuestions,
    contextSuggestions,
    ghostFilledDefaults,
    recordSelections,
    hasResult,
    inputAnalysis,
    isCompareMode,
    compareResults,
    variables,
    examples,
    hyperparameters,
    history,
    setUserText,
    setModel,
    setMode,
    toggleCheatCode,
    setLenzTopic,
    setLenzStuckPoint,
    setVariable,
    setExamples,
    setHyperparameters,
    autoFix,
    revertToHistory,
    maximise,
    applyGatheredContext,
    dismissCoaching,
    reset,
    toggleCompareMode,
    copyPrompt,
  };
}
