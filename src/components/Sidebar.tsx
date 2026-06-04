import React from 'react';
import { Terminal, Box, Cloud, AlertTriangle, Cpu, Layers } from 'lucide-react';
import { Topic } from '../types';

const iconMap: Record<string, React.ElementType> = {
  terminal: Terminal,
  box: Box,
  cloud: Cloud,
  'alert-triangle': AlertTriangle,
  cpu: Cpu,
  layers: Layers,
};

interface SidebarProps {
  topics: Topic[];
  activeTopicId: string;
  onSelect: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, activeTopicId, onSelect }) => {
  return (
    <aside className="w-80 border-r border-gray-800/60 bg-gray-900/40 hidden lg:flex flex-col flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800/60 flex-shrink-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 border border-indigo-500/30">
          <Box size={18} />
        </div>
        <span className="font-semibold text-lg tracking-tight text-gray-100">Docker Hub</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <div className="px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Masterclass Modules
        </div>
        {topics.map((topic) => {
          const Icon = iconMap[topic.icon] || Box;
          const isActive = topic.id === activeTopicId;
          
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className={`w-full flex items-center text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
              }`}
              >
              <Icon size={18} className={`mr-3 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
              {topic.title}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800/60 flex-shrink-0">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
          <p className="text-xs text-gray-400 leading-snug">
            Interactive guide. Use the copy button on code snippets to test locally.
          </p>
        </div>
      </div>
    </aside>
  );
};
