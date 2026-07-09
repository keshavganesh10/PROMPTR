'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromptActionsProps {
  prompt: string;
  model: string;
  mode: string;
  onRegenerate: () => void;
}

function buildFilename(model: string, extension: string): string {
  const sanitized = model.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const date = new Date().toISOString().split('T')[0];
  return `promptr-builder-${sanitized}-${date}.${extension}`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/* ── Inline SVG Icons ─────────────────────────────────────────────── */

function ClipboardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/* ── Action Button ────────────────────────────────────────────────── */

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: '#FEFAF3',
        color: '#6F4E37',
        border: '1px solid #EDE4D3',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'inherit',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(111, 78, 55, 0.30)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(111, 78, 55, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#EDE4D3';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
      {label}
    </motion.button>
  );
}

/* ── PromptActions ────────────────────────────────────────────────── */

export default function PromptActions({
  prompt,
  model,
  mode,
  onRegenerate,
}: PromptActionsProps) {
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = useCallback(async (format: 'raw' | 'system' | 'api') => {
    try {
      let textToCopy = prompt;
      if (format === 'system') {
        textToCopy = JSON.stringify({ role: "system", content: prompt }, null, 2);
      } else if (format === 'api') {
        textToCopy = JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "system", content: prompt }]
        }, null, 2);
      }

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setDropdownOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API may fail in insecure contexts — silent fallback */
    }
  }, [prompt]);

  const handleDownloadTxt = useCallback(() => {
    downloadBlob(prompt, buildFilename(model, 'txt'), 'text/plain;charset=utf-8');
  }, [prompt, model]);

  const handleDownloadMd = useCallback(() => {
    downloadBlob(prompt, buildFilename(model, 'md'), 'text/markdown;charset=utf-8');
  }, [prompt, model]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '12px 16px',
        background: '#FEFAF3',
        border: '1px solid #EDE4D3',
        borderRadius: '14px',
      }}
    >
      {/* Copy to Clipboard Dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <ActionButton label={copied ? 'Copied!' : 'Copy'} onClick={() => setDropdownOpen(!dropdownOpen)}>
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex', color: '#5C6E3C' }}
              >
                <CheckIcon />
              </motion.span>
            ) : (
              <motion.span
                key="clipboard"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'flex' }}
              >
                <ClipboardIcon />
              </motion.span>
            )}
          </AnimatePresence>
        </ActionButton>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: '#FEFAF3',
                border: '1px solid #EDE4D3',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(44, 24, 16, 0.08)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                minWidth: '200px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => handleCopy('raw')}
                style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#2C1810', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(92, 110, 60, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Copy as Raw Text
              </button>
              <button
                onClick={() => handleCopy('system')}
                style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#2C1810', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(92, 110, 60, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Copy as System Message
              </button>
              <button
                onClick={() => handleCopy('api')}
                style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: '#2C1810', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(92, 110, 60, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Copy as API Request
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download .txt */}
      <ActionButton label="Download .txt" onClick={handleDownloadTxt}>
        <DownloadIcon />
      </ActionButton>

      {/* Download .md */}
      <ActionButton label="Download .md" onClick={handleDownloadMd}>
        <DownloadIcon />
      </ActionButton>

      {/* Re-generate */}
      <ActionButton label="Re-generate" onClick={onRegenerate}>
        <RefreshIcon />
      </ActionButton>
    </motion.div>
  );
}
