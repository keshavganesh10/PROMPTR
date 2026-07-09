@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

:root {
  --bg-sand: #F5EDE0;
  --bg-wheat: #FEFAF3;
  --bg-linen: #EDE4D3;
  --accent-moss: #5C6E3C;
  --accent-coffee: #6F4E37;
  --accent-autumn: #C1713A;
  --accent-prairie: #B5A642;
  --text-espresso: #2C1810;
  --text-muted: #7A6652;
  --text-cream: #FAF6F0;

  --background: var(--bg-sand);
  --foreground: var(--text-espresso);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-sand: #F5EDE0;
  --color-wheat: #FEFAF3;
  --color-linen: #EDE4D3;
  --color-moss: #5C6E3C;
  --color-moss-light: #7A9450;
  --color-coffee: #6F4E37;
  --color-coffee-light: #8B6A50;
  --color-autumn: #C1713A;
  --color-autumn-light: #D4894F;
  --color-prairie: #B5A642;
  --color-espresso: #2C1810;
  --color-muted: #7A6652;
  --color-cream: #FAF6F0;

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

/* ─── Base ─── */
body {
  background: var(--bg-sand);
  color: var(--text-espresso);
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── Scrollbar ─── */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-linen);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--accent-coffee);
  border-radius: 3px;
  opacity: 0.6;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-moss);
}

/* ─── Selection ─── */
::selection {
  background: rgba(92, 110, 60, 0.2);
  color: var(--text-espresso);
}

/* ─── Bento Grid ─── */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

/* ─── Scanning Animation ─── */
@keyframes scanLine {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(400%);
    opacity: 0;
  }
}

.scan-line {
  animation: scanLine 2.5s ease-in-out infinite;
}

.scan-line:nth-child(2) {
  animation-delay: 0.6s;
}

.scan-line:nth-child(3) {
  animation-delay: 1.2s;
}

.scan-line:nth-child(4) {
  animation-delay: 1.8s;
}

/* ─── Pulse Glow for CTA ─── */
@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(92, 110, 60, 0);
  }
  50% {
    box-shadow: 0 0 20px 4px rgba(92, 110, 60, 0.15);
  }
}

.pulse-glow {
  animation: pulseGlow 3s ease-in-out infinite;
}

/* ─── Toggle Switch ─── */
.toggle-track {
  transition: background-color 0.2s ease;
}

.toggle-thumb {
  transition: transform 0.2s ease;
}

/* ─── Code Block ─── */
.prompt-output {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  tab-size: 2;
}

/* ─── Textarea Auto-resize ─── */
.auto-textarea {
  resize: none;
  overflow: hidden;
  min-height: 160px;
  field-sizing: content;
}

/* ─── Subtle card hover ─── */
.bento-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bento-card-hover:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 30px rgba(44, 24, 16, 0.06);
}

/* ─── Line Clamp ─── */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Split Panel Scrollbar ─── */
.split-panel::-webkit-scrollbar {
  width: 4px;
}

.split-panel::-webkit-scrollbar-track {
  background: transparent;
}

.split-panel::-webkit-scrollbar-thumb {
  background: rgba(122, 102, 82, 0.2);
  border-radius: 2px;
}

.split-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(122, 102, 82, 0.4);
}

