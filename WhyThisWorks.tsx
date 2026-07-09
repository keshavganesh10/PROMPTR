'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsProps {
  onMaximise: () => void;
  onReset: () => void;
  onCopy: () => void;
  hasResult: boolean;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutEntry[] = [
  { keys: ['Ctrl', 'Enter'], description: 'Generate prompt' },
  { keys: ['Ctrl', 'Shift', 'N'], description: 'New prompt' },
  { keys: ['Ctrl', 'Shift', 'C'], description: 'Copy generated prompt' },
  { keys: ['Shift', '?'], description: 'Toggle shortcuts modal' },
];

export default function KeyboardShortcuts({
  onMaximise,
  onReset,
  onCopy,
  hasResult,
}: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Enter → generate prompt
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        onMaximise();
        return;
      }

      // Ctrl/Cmd + Shift + N → new prompt
      if (mod && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        onReset();
        return;
      }

      // Ctrl/Cmd + Shift + C → copy generated prompt
      if (mod && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        if (hasResult) {
          onCopy();
        }
        return;
      }

      // Shift + ? → toggle shortcuts modal
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        toggleModal();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMaximise, onReset, onCopy, hasResult, toggleModal]);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={toggleModal}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '50%',
          border: '1px solid #EDE4D3',
          background: '#FEFAF3',
          color: '#7A6652',
          fontSize: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(44, 24, 16, 0.08)',
          zIndex: 50,
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.14)',
        }}
        whileTap={{ scale: 0.95 }}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (Shift + ?)"
      >
        ⌨
      </motion.button>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="shortcuts-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(44, 24, 16, 0.3)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            {/* Modal content */}
            <motion.div
              key="shortcuts-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FEFAF3',
                border: '1px solid #EDE4D3',
                borderRadius: '1rem',
                padding: '2rem',
                width: '100%',
                maxWidth: '28rem',
                boxShadow: '0 8px 40px rgba(44, 24, 16, 0.12)',
                position: 'relative',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close shortcuts modal"
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #EDE4D3',
                  background: 'transparent',
                  color: '#7A6652',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5EDE0';
                  e.currentTarget.style.color = '#2C1810';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#7A6652';
                }}
              >
                ✕
              </button>

              {/* Title */}
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#2C1810',
                  marginBottom: '1.5rem',
                  letterSpacing: '-0.01em',
                }}
              >
                Keyboard Shortcuts
              </h2>

              {/* Shortcuts grid */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    {/* Key combination */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        flexShrink: 0,
                      }}
                    >
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {keyIndex > 0 && (
                            <span
                              style={{
                                color: '#7A6652',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              +
                            </span>
                          )}
                          <kbd
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '1.75rem',
                              height: '1.75rem',
                              padding: '0 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #EDE4D3',
                              background: '#F5EDE0',
                              color: '#2C1810',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              fontFamily: 'inherit',
                              lineHeight: 1,
                              boxShadow: '0 1px 2px rgba(44, 24, 16, 0.06)',
                            }}
                          >
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: '#7A6652',
                        textAlign: 'right',
                      }}
                    >
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #EDE4D3',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#7A6652',
                  }}
                >
                  Use <kbd style={{
                    padding: '0.1rem 0.35rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #EDE4D3',
                    background: '#F5EDE0',
                    color: '#2C1810',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}>⌘</kbd> on Mac instead of <kbd style={{
                    padding: '0.1rem 0.35rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #EDE4D3',
                    background: '#F5EDE0',
                    color: '#2C1810',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}>Ctrl</kbd>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
