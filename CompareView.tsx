'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { courses } from '@/lib/academyData';
import IntakeHub from '@/components/IntakeHub';
import { Play } from 'lucide-react';

export default function LabPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const course = courses.find(c => c.id === courseId);
  
  const [prompt, setPrompt] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [examples, setExamples] = useState<{input: string, output: string}[]>([]);
  
  const [isPassed, setIsPassed] = useState(false);
  const [feedback, setFeedback] = useState('');

  if (!course) {
    return <div className="p-8 text-[#2C1810]">Course not found.</div>;
  }

  const verify = () => {
    const text = prompt.toLowerCase();
    const missingWords = course.targetWords.filter(word => !text.includes(word.toLowerCase()));
    
    if (missingWords.length === 0) {
      setIsPassed(true);
      setFeedback('🎉 Success! You included all required concepts.');
      
      // Save progress
      const saved = localStorage.getItem('promptr-academy-progress');
      let progress = saved ? JSON.parse(saved) : [];
      if (!progress.includes(courseId)) {
        progress.push(courseId);
        localStorage.setItem('promptr-academy-progress', JSON.stringify(progress));
      }
    } else {
      setIsPassed(false);
      setFeedback(`Missing words: ${missingWords.join(', ')}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#F5EDE0] font-sans text-[#2C1810]">
      {/* Left Panel - Tutorial */}
      <div className="w-1/2 overflow-y-auto border-r border-[#EDE4D3] p-8">
        <div className="max-w-2xl prose prose-stone">
          <div dangerouslySetInnerHTML={{ __html: course.content.replace(/\n/g, '<br/>') }} />
        </div>
        
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-4 rounded-xl font-medium ${isPassed ? 'bg-[#5C6E3C]/20 text-[#5C6E3C]' : 'bg-[#C1713A]/20 text-[#C1713A]'}`}
          >
            {feedback}
          </motion.div>
        )}
        
        {isPassed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => router.push('/academy')}
            className="mt-6 rounded-xl bg-[#5C6E3C] px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-[#5C6E3C]/90 active:scale-95"
          >
            Return to Dashboard
          </motion.button>
        )}
      </div>
      
      {/* Right Panel - Sandbox */}
      <div className="w-1/2 overflow-y-auto p-8 bg-[#FEFAF3]">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Sandbox</h2>
          <button
            onClick={verify}
            className="flex items-center gap-2 rounded-xl bg-[#2C1810] px-4 py-2 text-sm font-medium text-[#F5EDE0] shadow-sm transition-all hover:bg-[#2C1810]/90 active:scale-95"
          >
            <Play className="h-4 w-4" />
            Verify
          </button>
        </div>
        
        <IntakeHub
          value={prompt}
          onChange={setPrompt}
          placeholder="Craft your prompt here..."
          variables={variables}
          onVariableChange={(k, v) => setVariables({...variables, [k]: v})}
          examples={examples}
          onExamplesChange={setExamples}
        />
      </div>
    </div>
  );
}
