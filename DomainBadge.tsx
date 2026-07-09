'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHistory, deletePrompt, getModelLabel, getModeLabel, type SavedPrompt } from '@/lib/promptHistory';
import type { TargetModel, PromptMode } from '@/lib/constants';
import BentoCard from '@/components/BentoCard';
import OutputDeck from '@/components/OutputDeck';

// ─── Filter Types ───
type ModelFilter = TargetModel | 'all';
type ModeFilter = PromptMode | 'all';

const MODEL_FILTERS: { value: ModelFilter; label: string }[] = [
  { value: 'all', label: 'All Models' },
  { value: 'claude', label: 'Claude 3.5' },
  { value: 'openai', label: 'GPT-4o' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'lovable', label: 'Lovable/v0' },
];

const MODE_FILTERS: { value: ModeFilter; label: string }[] = [
  { value: 'all', label: 'All Modes' },
  { value: 'builder', label: 'Builder' },
  { value: 'strategist', label: 'Strategist' },
  { value: 'lenz', label: 'Lenz' },
];

// ─── Prompt Card ───
function PromptCard({
  prompt,
  selected,
  onToggleSelect,
  onCopy,
  onDelete,
  onView,
}: {
  prompt: SavedPrompt;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onView: (prompt: SavedPrompt) => void;
}) {
  const date = new Date(prompt.timestamp);
  const dateStr = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const modelAccent =
    prompt.model === 'claude' ? '#5C6E3C' :
    prompt.model === 'openai' ? '#6F4E37' :
    prompt.model === 'gemini' ? '#B5A642' :
    '#C1713A';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-5 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(44,24,16,0.06)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className={`absolute -top-2 -right-2 transition-opacity ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <input type="checkbox" checked={selected} onChange={() => onToggleSelect(prompt.id)} className="w-4 h-4 rounded border-[#EDE4D3] text-[#5C6E3C] focus:ring-[#5C6E3C]/30 bg-[#FEFAF3] cursor-pointer" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: modelAccent }}
          >
            {getModelLabel(prompt.model)}
          </span>
          <span className="rounded-full bg-[#EDE4D3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6F4E37]">
            {getModeLabel(prompt.mode)}
          </span>
        </div>
        <span className="text-[11px] text-[#7A6652]">
          {dateStr} · {timeStr}
        </span>
      </div>

      {/* Preview */}
      <p className="text-sm text-[#2C1810] leading-relaxed mb-1 font-medium line-clamp-2">
        {prompt.userText}
      </p>
      <pre
        className="text-xs text-[#7A6652] leading-relaxed line-clamp-3 whitespace-pre-wrap break-words mt-2"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {prompt.generatedPrompt}
      </pre>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onView(prompt)}
          className="cursor-pointer rounded-lg border border-[#5C6E3C]/30 bg-[#5C6E3C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#4A5C30]"
        >
          View Full Prompt
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onCopy(prompt.generatedPrompt)}
          className="cursor-pointer rounded-lg border border-[#EDE4D3] bg-[#F5EDE0] px-3 py-1.5 text-xs font-medium text-[#6F4E37] transition-colors hover:border-[#5C6E3C]/30 hover:text-[#5C6E3C]"
        >
          Copy
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onDelete(prompt.id)}
          className="cursor-pointer rounded-lg border border-[#EDE4D3] bg-[#F5EDE0] px-3 py-1.5 text-xs font-medium text-[#7A6652] transition-colors hover:border-[#C1713A]/30 hover:text-[#C1713A]"
        >
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Library Page ───
export default function LibraryPage() {
  const [history, setHistory] = useState<SavedPrompt[]>([]);
  const [search, setSearch] = useState('');
  const [modelFilter, setModelFilter] = useState<ModelFilter>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<SavedPrompt | null>(null);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filtered = useMemo(() => {
    return history.filter((p) => {
      if (modelFilter !== 'all' && p.model !== modelFilter) return false;
      if (modeFilter !== 'all' && p.mode !== modeFilter) return false;
      if (selectedFolder !== 'All' && p.folder !== selectedFolder && (selectedFolder !== 'Unfiled' || p.folder !== null)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.userText.toLowerCase().includes(q) ||
          p.generatedPrompt.toLowerCase().includes(q) ||
          (p.lenzTopic && p.lenzTopic.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [history, search, modelFilter, modeFilter, selectedFolder]);

  const folders = useMemo(() => {
    const f = new Set(history.map(p => p.folder).filter(Boolean) as string[]);
    return ['All', ...Array.from(f), 'Unfiled'];
  }, [history]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text.substring(0, 20));
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* clipboard may fail */
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    deletePrompt(id);
    setHistory(getHistory());
    setSelectedPromptIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedPromptIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    selectedPromptIds.forEach(id => deletePrompt(id));
    setHistory(getHistory());
    setSelectedPromptIds(new Set());
  }, [selectedPromptIds]);

  const handleBulkMove = useCallback(() => {
    const folderName = window.prompt("Enter folder name (or leave empty to unfile):");
    if (folderName === null) return;
    const current = getHistory();
    const updated = current.map(p => selectedPromptIds.has(p.id) ? { ...p, folder: folderName || null } : p);
    localStorage.setItem('promptr_history', JSON.stringify(updated));
    setHistory(updated);
    setSelectedPromptIds(new Set());
  }, [selectedPromptIds]);

  const handleBulkExport = useCallback(() => {
    const toExport = history.filter(p => selectedPromptIds.has(p.id));
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promptr_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [history, selectedPromptIds]);

  const stats = useMemo(() => {
    const models = new Set(history.map((p) => p.model));
    const modes = new Set(history.map((p) => p.mode));
    return { total: history.length, models: models.size, modes: modes.size };
  }, [history]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5EDE0]">
      <div className="mx-auto max-w-[1440px] w-full px-6 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#C1713A]" />
              <div className="h-5 w-px bg-[#C1713A]/30" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#2C1810]">Library</h1>
              <p className="text-xs text-[#7A6652] mt-0.5">
                Your engineered prompts. <span className="font-semibold text-[#5C6E3C] ml-1">🔒 Stored securely in your local browser.</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            {[
              { value: stats.total, label: 'Prompts' },
              { value: stats.models, label: 'Models' },
              { value: stats.modes, label: 'Modes' },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <p className="text-xl font-bold text-[#2C1810]">{s.value}</p>
                <p className="text-[11px] text-[#7A6652]">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Folder Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                selectedFolder === folder ? 'bg-[#2C1810] text-[#F5EDE0]' : 'bg-[#FEFAF3] text-[#7A6652] hover:bg-[#EDE4D3] border border-[#EDE4D3]'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-6">
          {/* Search bar */}
          <div className="lg:col-span-6">
            <BentoCard>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts by content, topic, or keyword..."
                className="
                  w-full rounded-xl border border-[#EDE4D3] bg-[#FEFAF3]
                  px-4 py-3 text-sm text-[#2C1810]
                  placeholder:text-[#7A6652]/50
                  transition-colors duration-200
                  focus:border-[#5C6E3C] focus:outline-none focus:ring-2 focus:ring-[#5C6E3C]/10
                "
              />
            </BentoCard>
          </div>

          {/* Model filter */}
          <div className="lg:col-span-3">
            <BentoCard>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5C6E3C]" />
                <span className="text-[11px] font-semibold text-[#6F4E37] uppercase tracking-wider">Model</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setModelFilter(f.value)}
                    className={`
                      cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                      ${
                        modelFilter === f.value
                          ? 'bg-[#5C6E3C] text-white'
                          : 'bg-[#F5EDE0] text-[#7A6652] hover:text-[#2C1810]'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Mode filter */}
          <div className="lg:col-span-3">
            <BentoCard>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C1713A]" />
                <span className="text-[11px] font-semibold text-[#6F4E37] uppercase tracking-wider">Mode</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MODE_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setModeFilter(f.value)}
                    className={`
                      cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
                      ${
                        modeFilter === f.value
                          ? 'bg-[#C1713A] text-white'
                          : 'bg-[#F5EDE0] text-[#7A6652] hover:text-[#2C1810]'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Copied toast */}
        <AnimatePresence>
          {copiedId && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#5C6E3C] px-5 py-3 text-sm font-medium text-white shadow-lg"
            >
              Copied to clipboard ✓
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence>
              {filtered.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  selected={selectedPromptIds.has(p.id)}
                  onToggleSelect={toggleSelect}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  onView={setViewingPrompt}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#EDE4D3]/60 flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-[#2C1810]">
              {history.length === 0 ? 'No prompts yet' : 'No matching prompts'}
            </h3>
            <p className="mt-2 text-sm text-[#7A6652] max-w-sm">
              {history.length === 0
                ? 'Head to the Workspace and maximise your first prompt. It will appear here automatically.'
                : 'Try adjusting your search or filters to find what you are looking for.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal for Full Prompt View */}
      <AnimatePresence>
        {viewingPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C1810]/40 backdrop-blur-sm"
            onClick={() => setViewingPrompt(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#F5EDE0] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE4D3] bg-[#FEFAF3]">
                <div>
                  <h2 className="text-lg font-bold text-[#2C1810]">View Prompt</h2>
                  <p className="text-xs text-[#7A6652] mt-0.5">
                    {new Date(viewingPrompt.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingPrompt(null)}
                  className="p-2 text-[#7A6652] hover:bg-[#EDE4D3] rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider mb-2">Original Input</h3>
                  <div className="p-4 bg-[#FEFAF3] rounded-xl border border-[#EDE4D3] text-sm text-[#2C1810]">
                    {viewingPrompt.userText}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider mb-2">Mega-Prompt</h3>
                  <OutputDeck prompt={viewingPrompt.generatedPrompt} isVisible={true} />
                </div>

                {viewingPrompt.mode === 'builder' && (
                  <div className="mt-6 border-t border-[#EDE4D3] pt-6 mb-6">
                    <h3 className="text-sm font-semibold text-[#6F4E37] uppercase tracking-wider mb-2">Live Preview</h3>
                    <div className="w-full h-96 rounded-xl border border-[#EDE4D3] overflow-hidden bg-white">
                      <iframe
                        srcDoc={viewingPrompt.generatedPrompt}
                        className="w-full h-full border-0"
                        title="Live Preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-6 border-t border-[#EDE4D3] pt-6 grid grid-cols-2 gap-4">
                  <BentoCard>
                    <h3 className="text-xs font-semibold text-[#6F4E37] uppercase tracking-wider mb-3">Analytics</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between"><span className="text-sm text-[#7A6652]">Execution Time</span><span className="text-sm font-medium text-[#2C1810]">{viewingPrompt.analytics.executionTimeMs} ms</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[#7A6652]">Tokens</span><span className="text-sm font-medium text-[#2C1810]">{viewingPrompt.analytics.estimatedTokens}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-[#7A6652]">Cost</span><span className="text-sm font-medium text-[#2C1810]">${viewingPrompt.analytics.estimatedCost.toFixed(4)}</span></div>
                    </div>
                  </BentoCard>
                  <BentoCard>
                    <h3 className="text-xs font-semibold text-[#6F4E37] uppercase tracking-wider mb-3">Version History</h3>
                    <div className="text-sm text-[#7A6652]">
                      {viewingPrompt.versions.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {viewingPrompt.versions.map((v: any, i: number) => <li key={i}>Version {i+1}</li>)}
                        </ul>
                      ) : (
                        <p>No previous versions</p>
                      )}
                    </div>
                  </BentoCard>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedPromptIds.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-[#2C1810] px-6 py-3 flex items-center gap-4 shadow-2xl border border-[#6F4E37]"
          >
            <span className="text-white text-sm font-medium">{selectedPromptIds.size} selected</span>
            <div className="h-4 w-px bg-[#7A6652]" />
            <button onClick={handleBulkDelete} className="text-sm text-[#F5EDE0] hover:text-white transition-colors cursor-pointer">Delete</button>
            <button onClick={handleBulkMove} className="text-sm text-[#F5EDE0] hover:text-white transition-colors cursor-pointer">Move</button>
            <button onClick={handleBulkExport} className="text-sm text-[#F5EDE0] hover:text-white transition-colors cursor-pointer">Export JSON</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
