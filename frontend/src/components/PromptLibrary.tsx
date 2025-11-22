// import React, { useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { ChevronDown, ChevronRight, Copy, Zap } from 'lucide-react';
// import { promptLibrary, PromptCategory, PromptItem } from '@/lib/promptLibrary';

// interface PromptLibraryProps {
//   onPromptSelect: (prompt: string) => void;
// }

// const PromptLibrary: React.FC<PromptLibraryProps> = ({ onPromptSelect }) => {
//   const [expandedCategories, setExpandedCategories] = useState<string[]>(['speed']);

//   const toggleCategory = (categoryId: string) => {
//     setExpandedCategories(prev =>
//       prev.includes(categoryId)
//         ? prev.filter(id => id !== categoryId)
//         : [...prev, categoryId]
//     );
//   };

//   const handlePromptClick = (prompt: string) => {
//     onPromptSelect(prompt);
//   };

//   return (
//     <div className="w-80 h-full overflow-y-auto bg-gray-50 border-r border-gray-200 p-4 space-y-4">
//       <div className="mb-6">
//         <h2 className="text-lg font-bold text-gray-800 mb-2">Prompt Library</h2>
//         <p className="text-xs text-gray-600">Click any prompt to test model performance</p>
//       </div>

//       {promptLibrary.map((category: PromptCategory) => {
//         const isExpanded = expandedCategories.includes(category.id);
        
//         return (
//           <div key={category.id} className="space-y-2">
//             <button
//               onClick={() => toggleCategory(category.id)}
//               className="w-full flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
//             >
//               <div className="flex items-center gap-2">
//                 <span className="text-xl">{category.icon}</span>
//                 <span className="font-semibold text-gray-700 text-sm">{category.name}</span>
//                 <span className="text-xs text-gray-500">({category.prompts.length})</span>
//               </div>
//               {isExpanded ? (
//                 <ChevronDown className="h-4 w-4 text-gray-500" />
//               ) : (
//                 <ChevronRight className="h-4 w-4 text-gray-500" />
//               )}
//             </button>

//             {isExpanded && (
//               <div className="space-y-2 ml-2">
//                 {category.prompts.map((prompt: PromptItem) => (
//                   <Card
//                     key={prompt.id}
//                     className="cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all border border-gray-200 group"
//                     onClick={() => handlePromptClick(prompt.prompt)}
//                   >
//                     <CardContent className="p-3">
//                       <div className="flex items-start justify-between mb-2">
//                         <div className="flex-1">
//                           <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
//                             {prompt.title}
//                           </h4>
//                           <p className="text-xs text-gray-500 mt-1">{prompt.description}</p>
//                         </div>
//                         <Copy className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" />
//                       </div>
                      
//                       <div className="flex items-center gap-2 mt-2">
//                         <Zap className="h-3 w-3 text-yellow-500" />
//                         <span className="text-xs text-gray-600">~{prompt.estimatedTokens} tokens</span>
//                       </div>
                      
//                       <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 font-mono border border-gray-200 line-clamp-2">
//                         {prompt.prompt}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       })}

//       <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//         <p className="text-xs text-blue-800 font-medium mb-1">💡 Pro Tip</p>
//         <p className="text-xs text-blue-700">
//           Test the same prompt across all models to compare performance metrics in the Stats tab!
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PromptLibrary;

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Zap, Lightbulb, BookOpen, Rocket, Brain, PenTool, Code } from 'lucide-react';

// --- Data Definitions (Moved internally to ensure self-contained compilation) ---

export interface PromptItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
  estimatedTokens: number;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompts: PromptItem[];
}

export const promptLibrary: PromptCategory[] = [
  {
    id: 'speed',
    name: 'Speed & Latency',
    icon: <Rocket className="w-4 h-4" />,
    prompts: [
      {
        id: 's1',
        title: 'Quick Summary',
        description: 'Tests simple summarization speed on short text.',
        prompt: 'Summarize the history of the internet in 3 sentences.',
        estimatedTokens: 45
      },
      {
        id: 's2',
        title: 'JSON Formatting',
        description: 'Evaluates structured output generation speed.',
        prompt: 'Generate a JSON list of 5 distinct fruit objects with name, color, and weight properties.',
        estimatedTokens: 120
      }
    ]
  },
  {
    id: 'reasoning',
    name: 'Logic & Reasoning',
    icon: <Brain className="w-4 h-4" />,
    prompts: [
      {
        id: 'r1',
        title: 'Riddle Solving',
        description: 'Tests multi-step logical deduction capabilities.',
        prompt: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        estimatedTokens: 30
      },
      {
        id: 'r2',
        title: 'Math Word Problem',
        description: 'Checks for arithmetic accuracy in context.',
        prompt: 'If a train travels 300 miles in 4 hours, what is its average speed in mph? Show your work.',
        estimatedTokens: 60
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative Writing',
    icon: <PenTool className="w-4 h-4" />,
    prompts: [
      {
        id: 'c1',
        title: 'Haiku Generator',
        description: 'Tests adherence to strict structural constraints.',
        prompt: 'Write a haiku about a robot discovering emotions for the first time.',
        estimatedTokens: 25
      },
      {
        id: 'c2',
        title: 'Story Opening',
        description: 'Evaluates narrative hook generation.',
        prompt: 'Write the first paragraph of a mystery novel set on a colonized Mars.',
        estimatedTokens: 150
      }
    ]
  },
  {
    id: 'coding',
    name: 'Code Generation',
    icon: <Code className="w-4 h-4" />,
    prompts: [
      {
        id: 'cd1',
        title: 'React Component',
        description: 'Tests syntax correctness for modern frameworks.',
        prompt: 'Write a simple functional React counter component using useState.',
        estimatedTokens: 200
      }
    ]
  }
];

// --- Component ---

interface PromptLibraryProps {
  onPromptSelect: (prompt: string) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ onPromptSelect }) => {
  // Initialize with 'speed' open by default
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['speed']);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className="w-80 h-full flex flex-col bg-white border-r border-slate-200 font-sans">
      {/* Header Section */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Library</h2>
        </div>
        <p className="text-xs text-slate-500">Select a prompt to evaluate metrics</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {promptLibrary.map((category: PromptCategory) => {
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <div key={category.id} className="select-none">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200 group
                  ${isExpanded ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {/* Icon Container - Neutralizes any emoji/icon passed in data */}
                  <span className="flex items-center justify-center w-5 h-5 text-base leading-none opacity-80 grayscale group-hover:grayscale-0 transition-all">
                    {category.icon}
                  </span>
                  <span className="truncate">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {category.prompts.length}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400" />
                  )}
                </div>
              </button>

              {/* Prompts List */}
              {isExpanded && (
                <div className="mt-1 mb-2 ml-4 pl-3 border-l border-slate-200 space-y-2">
                  {category.prompts.map((prompt: PromptItem) => (
                    <div
                      key={prompt.id}
                      onClick={() => onPromptSelect(prompt.prompt)}
                      className="
                        group/item relative p-3 rounded border border-transparent bg-white hover:border-slate-200 
                        hover:shadow-sm hover:bg-slate-50/50 cursor-pointer transition-all duration-200
                      "
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="text-xs font-semibold text-slate-700 group-hover/item:text-blue-700 transition-colors">
                          {prompt.title}
                        </h4>
                        <Copy className="h-3 w-3 text-slate-300 group-hover/item:text-blue-500 transition-colors flex-shrink-0" />
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed mb-2 line-clamp-2">
                        {prompt.description}
                      </p>

                      {/* Code snippet styling */}
                      <div className="relative bg-slate-50 rounded border border-slate-100 p-2 mb-2">
                        <p className="text-[10px] text-slate-600 font-mono line-clamp-2 leading-4">
                          {prompt.prompt}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-slate-400 group-hover/item:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-medium text-slate-400 group-hover/item:text-slate-600">
                          ~{prompt.estimatedTokens} tokens
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Pro Tip */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded shadow-sm">
          <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-900">Pro Tip</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test the same prompt across all models to compare performance metrics in the Stats tab.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PromptLibrary;