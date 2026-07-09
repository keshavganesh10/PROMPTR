'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutputDeckProps {
  prompt: string;
  isVisible: boolean;
}

// ─── Token Types for Syntax Highlighting ───
type TokenType =
  | 'xml-tag'
  | 'xml-close-tag'
  | 'md-header'
  | 'bold-label'
  | 'spec-header'
  | 'numbered-rule'
  | 'bullet'
  | 'quoted-text'
  | 'emphasis-phrase'
  | 'separator'
  | 'text';

interface ParsedLine {
  type: TokenType;
  content: string;
  raw: string;
  sectionTag?: string; // for XML — the tag name
  depth?: number;      // for headers/indentation
}

// ─── Prompt Parser ───
function parsePromptLines(prompt: string): ParsedLine[] {
  const lines = prompt.split('\n');
  return lines.map((raw): ParsedLine => {
    const trimmed = raw.trim();

    // XML opening tags: <role>, <task>, <rules>, etc.
    if (/^<([a-z_]+)>$/i.test(trimmed)) {
      const match = trimmed.match(/^<([a-z_]+)>$/i);
      return { type: 'xml-tag', content: trimmed, raw, sectionTag: match?.[1] };
    }

    // XML closing tags: </role>, </task>, etc.
    if (/^<\/([a-z_]+)>$/i.test(trimmed)) {
      const match = trimmed.match(/^<\/([a-z_]+)>$/i);
      return { type: 'xml-close-tag', content: trimmed, raw, sectionTag: match?.[1] };
    }

    // Markdown headers: ### System Role, ## Objective
    if (/^#{1,4}\s+/.test(trimmed)) {
      const hashCount = trimmed.match(/^(#{1,4})\s/)?.[1].length || 1;
      return { type: 'md-header', content: trimmed, raw, depth: hashCount };
    }

    // Spec headers: [PROJECT SPECIFICATION], [TUTORING SESSION]
    if (/^\[.+\]$/.test(trimmed) && trimmed.length < 60) {
      return { type: 'spec-header', content: trimmed, raw };
    }

    // Bold labels: **Role:**, **Task:**, **Guidelines:**
    if (/^\*\*[^*]+:\*\*/.test(trimmed)) {
      return { type: 'bold-label', content: trimmed, raw };
    }

    // Numbered rules: 1. NEVER reveal..., 2. Always wait...
    if (/^\d{1,2}\.\s+/.test(trimmed)) {
      return { type: 'numbered-rule', content: trimmed, raw };
    }

    // Bullet points: - item, • item
    if (/^[-•]\s+/.test(trimmed)) {
      return { type: 'bullet', content: trimmed, raw };
    }

    // Quoted text blocks: """
    if (trimmed === '"""' || trimmed === '```') {
      return { type: 'quoted-text', content: trimmed, raw };
    }

    // All-caps emphasis phrases (likely section sub-headers)
    if (/^[A-Z][A-Z\s_\-:()]{8,}$/.test(trimmed) && trimmed.length < 80) {
      return { type: 'emphasis-phrase', content: trimmed, raw };
    }

    // Separators (empty lines)
    if (trimmed === '') {
      return { type: 'separator', content: '', raw };
    }

    return { type: 'text', content: trimmed, raw };
  });
}

// ─── Group lines into collapsible sections ───
interface PromptSection {
  id: string;
  label: string;
  type: 'xml' | 'md' | 'spec' | 'bold' | 'emphasis' | 'root';
  lines: ParsedLine[];
  startIndex: number;
}

function groupIntoSections(parsed: ParsedLine[]): PromptSection[] {
  const sections: PromptSection[] = [];
  let currentSection: PromptSection = {
    id: 'preamble',
    label: 'Preamble',
    type: 'root',
    lines: [],
    startIndex: 0,
  };

  for (let i = 0; i < parsed.length; i++) {
    const line = parsed[i];

    if (line.type === 'xml-tag' && line.sectionTag) {
      // Save current section if it has content
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `xml-${line.sectionTag}-${i}`,
        label: formatTagLabel(line.sectionTag),
        type: 'xml',
        lines: [line],
        startIndex: i,
      };
    } else if (line.type === 'xml-close-tag') {
      currentSection.lines.push(line);
      sections.push(currentSection);
      currentSection = {
        id: `after-${i}`,
        label: '',
        type: 'root',
        lines: [],
        startIndex: i + 1,
      };
    } else if (line.type === 'md-header') {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `md-${i}`,
        label: line.content.replace(/^#{1,4}\s+/, ''),
        type: 'md',
        lines: [line],
        startIndex: i,
      };
    } else if (line.type === 'spec-header') {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `spec-${i}`,
        label: line.content.replace(/[\[\]]/g, ''),
        type: 'spec',
        lines: [line],
        startIndex: i,
      };
    } else if (line.type === 'bold-label' && currentSection.lines.length > 0 &&
               currentSection.type !== 'root') {
      // Bold labels within an existing section stay inside
      currentSection.lines.push(line);
    } else if (line.type === 'bold-label') {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      const labelMatch = line.content.match(/^\*\*([^*]+):\*\*/);
      currentSection = {
        id: `bold-${i}`,
        label: labelMatch?.[1] || 'Section',
        type: 'bold',
        lines: [line],
        startIndex: i,
      };
    } else if (line.type === 'emphasis-phrase' && currentSection.lines.length > 0 &&
               currentSection.lines[currentSection.lines.length - 1].type === 'separator') {
      // All-caps section subheader after a blank line — start new section
      if (currentSection.lines.length > 1) {
        sections.push(currentSection);
      }
      currentSection = {
        id: `emphasis-${i}`,
        label: toTitleCase(line.content),
        type: 'emphasis',
        lines: [line],
        startIndex: i,
      };
    } else {
      currentSection.lines.push(line);
    }
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  // Filter out empty root sections
  return sections.filter(s =>
    s.lines.some(l => l.type !== 'separator')
  );
}

function formatTagLabel(tag: string): string {
  return tag
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\b(A|An|The|And|But|Or|For|Nor|In|On|At|To|Of|By|With)\b/g,
      m => m.toLowerCase())
    .replace(/^./, c => c.toUpperCase());
}

// ─── Syntax-Highlighted Line Renderer ───
function HighlightedLine({ line, lineNumber }: { line: ParsedLine; lineNumber: number }) {
  const lineNumStr = String(lineNumber).padStart(3, ' ');

  switch (line.type) {
    case 'xml-tag':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#5C6E3C] font-semibold">{line.content}</span>
        </div>
      );
    case 'xml-close-tag':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#5C6E3C]/60">{line.content}</span>
        </div>
      );
    case 'md-header':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#6F4E37] font-bold">{line.content}</span>
        </div>
      );
    case 'spec-header':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#C1713A] font-bold tracking-wide">{line.content}</span>
        </div>
      );
    case 'bold-label': {
      const match = line.content.match(/^(\*\*[^*]+:\*\*)(.*)$/);
      if (match) {
        return (
          <div className="flex">
            <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
            <span>
              <span className="text-[#6F4E37] font-semibold">{match[1].replace(/\*\*/g, '')}</span>
              <span className="text-[#2C1810]">{match[2]}</span>
            </span>
          </div>
        );
      }
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#6F4E37] font-semibold">{line.content.replace(/\*\*/g, '')}</span>
        </div>
      );
    }
    case 'numbered-rule': {
      const ruleMatch = line.content.match(/^(\d{1,2}\.)\s+(.*)$/);
      if (ruleMatch) {
        return (
          <div className="flex">
            <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
            <span>
              <span className="text-[#C1713A] font-semibold">{ruleMatch[1]}</span>
              <span className="text-[#2C1810]"> {ruleMatch[2]}</span>
            </span>
          </div>
        );
      }
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#2C1810]">{line.content}</span>
        </div>
      );
    }
    case 'bullet':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span>
            <span className="text-[#5C6E3C]">•</span>
            <span className="text-[#2C1810]">{line.content.replace(/^[-•]/, '')}</span>
          </span>
        </div>
      );
    case 'quoted-text':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#7A6652]/50">{line.content}</span>
        </div>
      );
    case 'emphasis-phrase':
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#6F4E37] font-semibold text-[0.8rem] tracking-wide">{line.content}</span>
        </div>
      );
    case 'separator':
      return <div className="h-2" />;
    default:
      return (
        <div className="flex">
          <span className="select-none text-[#B5A642]/40 w-10 shrink-0 text-right pr-3">{lineNumStr}</span>
          <span className="text-[#2C1810]">{line.raw}</span>
        </div>
      );
  }
}

// ─── Collapsible Section ───
function SectionBlock({
  section,
  isCollapsed,
  onToggle,
  globalLineOffset,
}: {
  section: PromptSection;
  isCollapsed: boolean;
  onToggle: () => void;
  globalLineOffset: number;
}) {
  const contentLines = section.lines.filter(
    l => l.type !== 'xml-tag' && l.type !== 'xml-close-tag'
  );
  const hasHeader = section.type !== 'root';

  // Color the left accent bar by section type
  const accentColor =
    section.type === 'xml' ? '#5C6E3C' :
    section.type === 'md' ? '#6F4E37' :
    section.type === 'spec' ? '#C1713A' :
    section.type === 'bold' ? '#B5A642' :
    section.type === 'emphasis' ? '#6F4E37' :
    'transparent';

  // Count of meaningful lines (non-separator)
  const meaningfulLines = contentLines.filter(l => l.type !== 'separator').length;

  return (
    <div className="group/section">
      {hasHeader && (
        <button
          onClick={onToggle}
          className="
            w-full flex items-center gap-2 py-2 px-1 -mx-1
            rounded-lg cursor-pointer text-left
            transition-colors duration-150
            hover:bg-[#5C6E3C]/[0.04]
          "
        >
          {/* Accent dot */}
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />

          {/* Section label */}
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6F4E37] flex-1 truncate">
            {section.label}
          </span>

          {/* Line count badge */}
          <span className="text-[10px] text-[#7A6652]/50 font-medium tabular-nums">
            {meaningfulLines} {meaningfulLines === 1 ? 'line' : 'lines'}
          </span>

          {/* Collapse chevron */}
          <motion.span
            animate={{ rotate: isCollapsed ? -90 : 0 }}
            transition={{ duration: 0.15 }}
            className="text-[#7A6652]/40 text-xs"
          >
            ▼
          </motion.span>
        </button>
      )}

      {/* Section content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div
              className="pl-3 border-l-2 ml-0.5 mb-2"
              style={{ borderColor: hasHeader ? `${accentColor}20` : 'transparent' }}
            >
              {section.lines.map((line, idx) => (
                <HighlightedLine
                  key={`${section.id}-${idx}`}
                  line={line}
                  lineNumber={globalLineOffset + idx + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main OutputDeck Component ───
export default function OutputDeck({ prompt, isVisible }: OutputDeckProps) {
  const [copied, setCopied] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const parsed = useMemo(() => parsePromptLines(prompt), [prompt]);
  const sections = useMemo(() => groupIntoSections(parsed), [parsed]);

  const stats = useMemo(() => {
    const lines = prompt.split('\n').filter(l => l.trim().length > 0);
    const words = prompt.split(/\s+/).filter(w => w.length > 0);
    const chars = prompt.length;
    return { lines: lines.length, words: words.length, chars, sections: sections.length };
  }, [prompt, sections]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may fail */ }
  }, [prompt]);

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedSections(new Set(sections.filter(s => s.type !== 'root').map(s => s.id)));
  }, [sections]);

  const expandAll = useCallback(() => {
    setCollapsedSections(new Set());
  }, []);

  const allCollapsed = sections
    .filter(s => s.type !== 'root')
    .every(s => collapsedSections.has(s.id));

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <AnimatePresence>
      {isVisible && prompt && (
        <motion.div
          key="output-deck"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* ═══ Toolbar ═══ */}
          <div className="flex items-center justify-between mb-3">
            {/* Stats */}
            <div className="flex items-center gap-4 text-[11px] text-[#7A6652]/70 font-medium tabular-nums">
              <span>{stats.sections} sections</span>
              <span className="text-[#EDE4D3]">·</span>
              <span>{stats.lines} lines</span>
              <span className="text-[#EDE4D3]">·</span>
              <span>{stats.words.toLocaleString()} words</span>
              <span className="text-[#EDE4D3]">·</span>
              <span>{stats.chars.toLocaleString()} chars</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={allCollapsed ? expandAll : collapseAll}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="
                  cursor-pointer rounded-lg border border-[#EDE4D3]
                  bg-[#FEFAF3] px-3 py-1.5 text-[11px] font-medium
                  text-[#7A6652] transition-colors duration-150
                  hover:border-[#6F4E37]/20 hover:text-[#6F4E37]
                "
              >
                {allCollapsed ? 'Expand All' : 'Collapse All'}
              </motion.button>

              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  cursor-pointer rounded-lg border px-3 py-1.5 text-[11px] font-semibold
                  transition-all duration-200
                  ${copied
                    ? 'border-[#5C6E3C] bg-[#5C6E3C]/10 text-[#5C6E3C]'
                    : 'border-[#5C6E3C]/30 bg-[#5C6E3C] text-white hover:bg-[#4A5C30]'
                  }
                `}
              >
                {copied ? '✓ Copied' : 'Copy Prompt'}
              </motion.button>
            </div>
          </div>

          {/* ═══ Prompt Body ═══ */}
          <div
            className="
              rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3]
              shadow-[0_1px_4px_rgba(44,24,16,0.04)]
              overflow-hidden
            "
          >
            <div
              className="p-5 text-[13px] leading-[1.7]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {sections.map((section) => {
                // Calculate the global line offset for this section
                let offset = 0;
                for (const s of sections) {
                  if (s.id === section.id) break;
                  offset += s.lines.length;
                }

                return (
                  <SectionBlock
                    key={section.id}
                    section={section}
                    isCollapsed={collapsedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    globalLineOffset={offset}
                  />
                );
              })}
            </div>

            {/* Output Evaluation */}
            <div className="flex items-center justify-end gap-2 px-5 pb-4">
              <button
                onClick={() => setFeedback('up')}
                className={`transition-all duration-200 text-lg grayscale opacity-60 hover:grayscale-0 hover:opacity-100 ${feedback === 'up' ? 'grayscale-0 opacity-100 scale-110 drop-shadow-md' : ''}`}
                title="Thumbs Up"
              >
                👍
              </button>
              <button
                onClick={() => setFeedback('down')}
                className={`transition-all duration-200 text-lg grayscale opacity-60 hover:grayscale-0 hover:opacity-100 ${feedback === 'down' ? 'grayscale-0 opacity-100 scale-110 drop-shadow-md' : ''}`}
                title="Thumbs Down"
              >
                👎
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
