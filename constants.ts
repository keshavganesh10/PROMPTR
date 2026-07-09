'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/academy', label: '✨ Academy' },
  { href: '/library', label: 'Library' },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="
        sticky top-0 z-40 w-full
        border-b border-[#EDE4D3]/80
        bg-[#F5EDE0]/90 backdrop-blur-md
      "
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#5C6E3C] transition-transform duration-200 group-hover:scale-125" />
            <div className="h-4 w-px bg-[#5C6E3C]/30" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#2C1810]">
            Promptr
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative rounded-lg px-4 py-2 text-sm font-medium
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'text-[#5C6E3C]'
                      : 'text-[#7A6652] hover:text-[#2C1810]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-[#5C6E3C]/[0.07] border border-[#5C6E3C]/20"
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#5C6E3C] animate-pulse" />
          <span className="text-xs font-medium text-[#7A6652]">Engine Ready</span>
        </div>
      </div>
    </motion.nav>
  );
}
