import React from 'react';
import { ShieldAlert, Activity, FileText, Cpu, ServerCrash, HelpCircle } from 'lucide-react';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const prompts = [
  { text: 'Explain current threats', icon: ShieldAlert },
  { text: 'Show recovery recommendations', icon: ServerCrash },
  { text: "Summarize today's incidents", icon: FileText },
  { text: 'Explain dashboard health', icon: Activity },
  { text: 'How does the Windows Agent work?', icon: HelpCircle },
  { text: 'Explain hardware status', icon: Cpu },
];

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 w-full max-w-4xl mx-auto px-4">
      {prompts.map((prompt, index) => {
        const Icon = prompt.icon;
        return (
          <button
            key={index}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/80 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-md bg-zinc-800 group-hover:bg-emerald-500/10 transition-colors">
              <Icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
              {prompt.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
