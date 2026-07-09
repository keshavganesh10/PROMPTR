export type TargetModel = 'claude' | 'openai' | 'gemini' | 'lovable';
export type PromptMode = 'builder' | 'strategist' | 'lenz' | 'orchestrator';

export interface ModelOption {
  id: TargetModel;
  label: string;
  description: string;
  icon: string;
}

export interface ModeOption {
  id: PromptMode;
  label: string;
  description: string;
  icon: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'claude',
    label: 'Claude 3.5',
    description: 'Anthropic — XML-structured, reasoning-first',
    icon: '🟣',
  },
  {
    id: 'openai',
    label: 'GPT-4o',
    description: 'OpenAI — Markdown-delimited, role-powered',
    icon: '🟢',
  },
  {
    id: 'gemini',
    label: 'Gemini Advanced',
    description: 'Google — Structured, multi-turn native',
    icon: '🔵',
  },
  {
    id: 'lovable',
    label: 'Lovable / v0',
    description: 'Code-gen — Spec-style, builder-focused',
    icon: '🟠',
  },
];

export const MODES: ModeOption[] = [
  {
    id: 'builder',
    label: 'Builder / Creator',
    description: 'For code, design, copy, and creative output',
    icon: '🔨',
  },
  {
    id: 'strategist',
    label: 'Strategist / Reviewer',
    description: 'For brutal feedback, business plans, and analysis',
    icon: '🎯',
  },
  {
    id: 'lenz',
    label: 'Lenz',
    description: 'Teaches, never solves — the learning engine',
    icon: '🔍',
  },
  {
    id: 'orchestrator',
    label: 'Orchestrator',
    description: 'For multi-step tools & autonomous agents',
    icon: '🤖',
  },
];

export const UI_STRINGS = {
  appName: 'Promptr',
  strapline: 'Better questions get Better Answers.',
  maximiseButton: 'Maximise Prompt',
  copyButton: 'Copy to Clipboard',
  copiedButton: 'Copied!',
  placeholderText: 'Describe what you want the AI to do. Be as specific or as vague as you like — Promptr will engineer the rest...',
  lenzTopicLabel: 'What topic is this?',
  lenzTopicPlaceholder: 'e.g., Fluid Dynamics, Linear Algebra, Organic Chemistry',
  lenzStuckLabel: 'Where exactly are you stuck?',
  lenzStuckPlaceholder: 'e.g., I don\'t understand how to apply the divergence theorem to this velocity field...',
  coachingTitle: 'Let\'s sharpen this up.',
  coachingSubtitle: 'To engineer the perfect prompt, I need a bit more context.',
  whyTitle: 'Why This Works',
} as const;
