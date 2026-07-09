'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { courses, quickTips, trendingArticles } from '@/lib/academyData';

export default function AcademyDashboard() {
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('promptr-academy-progress');
    if (saved) {
      try {
        setCompletedCourses(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5EDE0] p-6 lg:p-12 font-sans text-[#2C1810]">
      <div className="mx-auto max-w-[1440px]">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C1713A] mb-2 block">
            Interactive Learning Center
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">✨ Promptr Academy</h1>
          <p className="text-lg text-[#7A6652] max-w-2xl mx-auto">
            Master the art of prompt engineering through hands-on labs, discover power-user tips, and see what the community is building.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: The Prompt Lab (Courses) */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 rounded-full bg-[#5C6E3C]" />
              <h2 className="text-2xl font-bold text-[#2C1810]">The Prompt Lab</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {courses.map((course, idx) => {
                const isCompleted = completedCourses.includes(course.id);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/academy/lab/${course.id}`}>
                      <div className="h-full rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-6 shadow-sm transition-all hover:shadow-[0_4px_24px_rgba(44,24,16,0.06)] hover:border-[#5C6E3C]/30 relative overflow-hidden group flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-bold group-hover:text-[#5C6E3C] transition-colors">{course.title}</h3>
                            {isCompleted && (
                              <div className="rounded-full bg-[#5C6E3C]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#5C6E3C]">
                                ✓ Done
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-[#7A6652] mb-6">{course.description}</p>
                        </div>
                        
                        <div className="flex items-center text-sm font-semibold text-[#C1713A] group-hover:text-[#5C6E3C] transition-colors">
                          Enter Lab <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Tips & Community */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Quick Tips */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 rounded-full bg-[#C1713A]" />
                <h2 className="text-2xl font-bold text-[#2C1810]">Power Moves</h2>
              </div>
              <div className="flex flex-col gap-4">
                {quickTips.map((tip, idx) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl border border-[#EDE4D3] bg-[#FEFAF3] p-5 shadow-sm"
                  >
                    <h4 className="text-sm font-bold text-[#2C1810] mb-2">💡 {tip.title}</h4>
                    <p className="text-xs text-[#7A6652] leading-relaxed mb-3">{tip.description}</p>
                    <div className="inline-block rounded-lg bg-[#F5EDE0] px-3 py-1.5 text-[11px] font-mono text-[#6F4E37] border border-[#EDE4D3]">
                      {tip.action}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trending Articles */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1.5 rounded-full bg-[#6F4E37]" />
                <h2 className="text-2xl font-bold text-[#2C1810]">Trending</h2>
              </div>
              <div className="flex flex-col gap-4">
                {trendingArticles.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="group cursor-pointer rounded-2xl border border-[#EDE4D3] bg-white p-5 shadow-sm hover:border-[#6F4E37]/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1713A]">{article.category}</span>
                      <span className="text-[10px] font-medium text-[#7A6652]">{article.author}</span>
                    </div>
                    <h4 className="text-base font-bold text-[#2C1810] mb-2 group-hover:text-[#6F4E37] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-xs text-[#7A6652] leading-relaxed line-clamp-2">
                      {article.snippet}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
