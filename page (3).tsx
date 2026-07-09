'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mini-Previewer Demo Data ───
const RAW_PROMPT = `Write me a good landing page for my SaaS app that sells AI tools to developers.`;

const ENGINEERED_PROMPT = `<role>
You are an elite UI/UX designer and conversion-rate optimisation specialist with 18 years of experience designing high-performing SaaS landing pages for developer-facing products. You have shipped pages for companies like Vercel, Supabase, and Linear.
</role>

<context>
The client is building a SaaS platform that sells AI-powered development tools to software engineers. The landing page must convert technical visitors — developers who are skeptical of marketing fluff and value clarity, speed, and proof.
</context>

<task>
Design and write the complete copy, layout structure, and component hierarchy for a high-converting landing page.
</task>

<rules>
1. Use technical language that resonates with developers — avoid corporate jargon.
2. Lead with a value proposition, not a feature list.
3. Include social proof: GitHub stars, testimonials, or usage metrics.
4. Every CTA must have a clear, low-friction next step.
5. Use the inverted pyramid: most important information first.
</rules>

<quality_checklist>
Before submitting, verify:
- [ ] Hero headline is under 12 words
- [ ] Page can be scanned in under 8 seconds
- [ ] At least 3 sections of social proof exist
</quality_checklist>`;

const MODES = [
  {
    id: 'builder',
    icon: '🔨',
    title: 'Builder / Creator',
    subtitle: 'For code, design, copy, and creative output',
    detail: 'Generates production-ready system prompts with deep role definitions, quality checklists, structural constraints, and output format locks.',
    accent: '#5C6E3C',
  },
  {
    id: 'strategist',
    icon: '🎯',
    title: 'Strategist / Reviewer',
    subtitle: 'For brutal feedback and critical analysis',
    detail: 'Injects anti-sycophancy directives, structured critique frameworks, and evidence-grounding rules that force the AI to be genuinely helpful.',
    accent: '#6F4E37',
  },
  {
    id: 'lenz',
    icon: '🔍',
    title: 'Lenz',
    subtitle: 'Teaches, never solves — the learning engine',
    detail: 'Produces exhaustive academic tutoring prompts with 10+ knowledge constraints, multi-turn protocols, cognitive scaffolding, and sample dialogues.',
    accent: '#C1713A',
  },
  {
    id: 'orchestrator',
    icon: '🤖',
    title: 'Orchestrator',
    subtitle: 'For multi-step tools & autonomous agents',
    detail: 'Generates complex state-machine prompts designed for agentic workflows, complete with tool definitions, error recovery paths, and reasoning loop constraints.',
    accent: '#4A607A',
  },
] as const;

// ─── Typewriter Effect ───
function useTypewriter(text: string, speed = 8, trigger = false) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayed('');
      setIsComplete(false);
      return;
    }
    let i = 0;
    setDisplayed('');
    setIsComplete(false);
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return { displayed, isComplete };
}

// ─── Syntax Highlighting ───
function renderHighlightedText(text: string) {
  // Simple regex to match XML-like tags e.g. <role>, </role>
  const parts = text.split(/(<\/?\w+>)/g);
  
  return parts.map((part, i) => {
    if (part.match(/^<\/?\w+>$/)) {
      // Highlight tags
      return (
        <span key={i} className="text-[#C1713A] font-semibold bg-[#C1713A]/10 px-1 rounded-sm relative group cursor-help">
          {part}
          <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block w-max bg-[#2C1810] text-[#FEFAF3] text-[10px] px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
            Structural Constraint
          </span>
        </span>
      );
    }
    // Highlight checklist brackets
    if (part.includes('- [ ]')) {
      const subParts = part.split(/(- \[ \])/g);
      return subParts.map((sp, j) => {
        if (sp === '- [ ]') return <span key={`${i}-${j}`} className="text-[#5C6E3C] font-bold">{sp}</span>;
        return <span key={`${i}-${j}`}>{sp}</span>;
      });
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Mini Previewer Widget ───
function MiniPreviewer() {
  const [isTransformed, setIsTransformed] = useState(false);
  const { displayed, isComplete } = useTypewriter(ENGINEERED_PROMPT, 6, isTransformed);

  return (
    <div className="rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] shadow-[0_2px_12px_rgba(44,24,16,0.06)] overflow-hidden">
      {/* Header tabs */}
      <div className="flex border-b border-[#EDE4D3]">
        <button
          onClick={() => setIsTransformed(false)}
          className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            !isTransformed
              ? 'text-[#5C6E3C] bg-[#5C6E3C]/[0.05] border-b-2 border-[#5C6E3C]'
              : 'text-[#7A6652] hover:text-[#2C1810]'
          }`}
        >
          Raw Input
        </button>
        <button
          onClick={() => setIsTransformed(true)}
          className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            isTransformed
              ? 'text-[#5C6E3C] bg-[#5C6E3C]/[0.05] border-b-2 border-[#5C6E3C]'
              : 'text-[#7A6652] hover:text-[#2C1810]'
          }`}
        >
          Engineered Prompt
        </button>
      </div>

      {/* Content */}
      <div className="p-5 h-[280px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isTransformed ? (
            <motion.div
              key="raw"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-sm text-[#7A6652] italic leading-relaxed">
                {RAW_PROMPT}
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[#7A6652]/60">
                <span>7 words</span>
                <span>·</span>
                <span>No structure</span>
                <span>·</span>
                <span>No constraints</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="engineered"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <pre
                className="text-xs leading-relaxed text-[#2C1810] whitespace-pre-wrap break-words"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {renderHighlightedText(displayed)}
                {!isComplete && (
                  <span className="inline-block w-[2px] h-3.5 bg-[#5C6E3C] ml-0.5 animate-pulse" />
                )}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transform button */}
      {!isTransformed && (
        <div className="border-t border-[#EDE4D3] p-4">
          <motion.button
            onClick={() => setIsTransformed(true)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full cursor-pointer rounded-xl bg-[#5C6E3C] px-5 py-3 text-sm font-semibold text-[#FEFAF3] transition-shadow hover:shadow-[0_0_16px_rgba(92,110,60,0.2)]"
          >
            Maximise This Prompt →
          </motion.button>
        </div>
      )}
    </div>
  );
}

// ─── Main Landing Page ───
export default function LandingPage() {
  return (
    <div className="flex-1 bg-[#F5EDE0]">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Subtle background gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(92,110,60,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="mx-auto max-w-[1440px] px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-[#5C6E3C]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C6E3C]">
                  Prompt Engineering Platform
                </span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-[#2C1810] sm:text-5xl lg:text-[3.4rem]">
                Better Questions get{' '}
                <span className="relative">
                  Better Answers
                  <div className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-[#5C6E3C]/25" />
                </span>
                .
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#7A6652]">
                Transform your unrefined ideas into perfectly engineered, model-specific mega-prompts. 
                Tailored syntax for Claude, GPT-4o, Gemini, and Lovable — with community cheat codes 
                and the Lenz teaching engine built in.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/workspace">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer rounded-xl bg-[#5C6E3C] px-8 py-4 text-base font-semibold text-[#FEFAF3] shadow-[0_2px_8px_rgba(92,110,60,0.15)] transition-shadow hover:shadow-[0_4px_20px_rgba(92,110,60,0.25)]"
                  >
                    Open Workspace →
                  </motion.div>
                </Link>
                <Link href="/library">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer rounded-xl border border-[#EDE4D3] bg-[#FEFAF3] px-8 py-4 text-base font-semibold text-[#6F4E37] transition-colors hover:border-[#6F4E37]/30"
                  >
                    View Library
                  </motion.div>
                </Link>
              </div>

              {/* Stats row & Badges */}
              <div className="mt-12 space-y-6">
                <div className="flex gap-10">
                  {[
                    { value: '20%', label: 'Reduced token usage' },
                    { value: '40%', label: 'Higher logic accuracy' },
                    { value: '10x', label: 'Faster integration' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold text-[#2C1810]">{stat.value}</p>
                      <p className="text-xs text-[#7A6652] mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-[#EDE4D3]/50">
                  <span className="inline-flex items-center rounded-md bg-[#5C6E3C]/10 px-2 py-1 text-xs font-medium text-[#5C6E3C] ring-1 ring-inset ring-[#5C6E3C]/20">
                    Artifacts-Ready (Claude)
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[#6F4E37]/10 px-2 py-1 text-xs font-medium text-[#6F4E37] ring-1 ring-inset ring-[#6F4E37]/20">
                    Token-Optimized (GPT-4o)
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[#C1713A]/10 px-2 py-1 text-xs font-medium text-[#C1713A] ring-1 ring-inset ring-[#C1713A]/20">
                    System-Aligned (Gemini)
                  </span>
                  <span className="inline-flex items-center rounded-md bg-[#4A607A]/10 px-2 py-1 text-xs font-medium text-[#4A607A] ring-1 ring-inset ring-[#4A607A]/20">
                    UI-Focused (Lovable)
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right — Mini Previewer */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <MiniPreviewer />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURE GRID ═══ */}
      <section className="border-t border-[#EDE4D3]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C6E3C]">
              Four Modes, One Engine
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2C1810] sm:text-4xl">
              Choose your approach
            </h2>
            <p className="mt-3 text-base text-[#7A6652] max-w-md mx-auto">
              Each mode transforms your input through a different lens, optimised for the specific outcome you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MODES.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className="group relative rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-6 lg:p-8 transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(44,24,16,0.06)] flex flex-col h-full"
              >
                {/* Accent line */}
                <div
                  className="absolute left-0 top-6 h-10 w-1 rounded-r-full transition-all duration-300 group-hover:h-14"
                  style={{ backgroundColor: mode.accent }}
                />

                <span className="text-3xl">{mode.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-[#2C1810]">{mode.title}</h3>
                <p className="mt-1 text-sm font-medium text-[#7A6652]">{mode.subtitle}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#7A6652]/80 flex-grow">{mode.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DEEP DEVELOPER INTEGRATIONS ═══ */}
      <section className="border-t border-[#EDE4D3] bg-[#FEFAF3]/50">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6F4E37]">
              Workflow Integrated
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2C1810] sm:text-4xl">
              From Browser to Codebase
            </h2>
            <p className="mt-3 text-base text-[#7A6652] max-w-md mx-auto">
              Export your engineered prompts directly into your IDE or via REST API. Promptr lives where you work.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: 'One-Click Copy', desc: 'Copy formatted JSON or raw text straight to your clipboard.' },
              { title: 'VS Code & Cursor Extensions', desc: 'Pull your Library prompts directly into your IDE editor window.' },
              { title: 'REST API Access', desc: 'Fetch dynamically engineered prompts on the fly from your own microservices.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl bg-white p-8 border border-[#EDE4D3] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-[#6F4E37]/10 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-[#6F4E37] text-xl font-bold">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-[#2C1810]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#7A6652]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="border-t border-[#EDE4D3]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C1713A]">
              Simple as 1, 2, 3
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2C1810] sm:text-4xl">
              From idea to mega-prompt
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Describe your intent',
                description: 'Type what you want the AI to do. Be as vague or specific as you like — the engine handles the rest.',
              },
              {
                step: '02',
                title: 'Choose your model & mode',
                description: 'Select your target AI (Claude, GPT-4o, Gemini, Lovable) and your approach (Builder, Strategist, or Lenz).',
              },
              {
                step: '03',
                title: 'Get your mega-prompt',
                description: 'Promptr generates a massive, model-specific, industry-grade prompt with cheat codes and a "Why This Works" breakdown.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-8"
              >
                <span className="text-3xl font-bold text-[#EDE4D3]">{item.step}</span>
                <h3 className="mt-3 text-base font-bold text-[#2C1810]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7A6652]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRENDING LIBRARY ═══ */}
      <section className="border-t border-[#EDE4D3] bg-[#FEFAF3]/50">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          >
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C1713A]">
                Community Library
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2C1810] sm:text-4xl">
                Trending Prompts
              </h2>
            </div>
            <Link href="/library">
              <span className="text-[#5C6E3C] font-semibold hover:underline">
                View all in Library →
              </span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Next.js 15 Migration Expert',
                author: '@promptr_community',
                desc: 'A strict builder prompt that acts as a migration assistant for upgrading React 18 apps to Next.js 15 App Router.',
                tags: ['Code', 'Builder'],
              },
              {
                title: 'Senior B2B SaaS Copywriter',
                author: '@growth_hacker',
                desc: 'Strategist prompt that reviews landing page copy against 10 cognitive biases and heuristic UX principles.',
                tags: ['Writing', 'Strategist'],
              },
              {
                title: 'Socratic Rust Tutor',
                author: '@rustacean',
                desc: 'A Lenz prompt that forces the LLM to teach memory management and ownership without ever writing the actual code for you.',
                tags: ['Code', 'Lenz'],
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group flex flex-col justify-between rounded-2xl bg-white p-6 border border-[#EDE4D3] shadow-sm hover:border-[#5C6E3C]/30 hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <div className="flex gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-md bg-[#F5EDE0] px-2 py-1 text-[10px] font-semibold text-[#6F4E37] uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-[#2C1810] group-hover:text-[#5C6E3C] transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs text-[#C1713A]">{item.author}</p>
                  <p className="mt-4 text-sm text-[#7A6652] leading-relaxed line-clamp-3">{item.desc}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#EDE4D3] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#5C6E3C]">Copy to Workspace</span>
                  <span className="text-[#5C6E3C]">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA ═══ */}
      <section className="border-t border-[#EDE4D3]">
        <div className="mx-auto max-w-[1440px] px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-[#2C1810] sm:text-4xl">
              Ready to maximise your prompts?
            </h2>
            <p className="mt-4 text-base text-[#7A6652] max-w-md mx-auto">
              Stop guessing. Start engineering. The workspace is waiting.
            </p>
            <Link href="/workspace">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 inline-block cursor-pointer rounded-xl bg-[#5C6E3C] px-10 py-4 text-base font-semibold text-[#FEFAF3] shadow-[0_2px_8px_rgba(92,110,60,0.15)] transition-shadow hover:shadow-[0_4px_20px_rgba(92,110,60,0.25)]"
              >
                Open Workspace →
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#EDE4D3]">
        <div className="mx-auto max-w-[1440px] px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-[#7A6652]">
            © 2026 Promptr. Engineered with care.
          </p>
          <p className="text-xs text-[#7A6652]">
            Better questions get better answers.
          </p>
        </div>
      </footer>
    </div>
  );
}
