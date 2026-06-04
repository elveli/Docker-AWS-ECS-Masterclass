import React, { useState } from 'react';
import { topics } from './data';
import { Sidebar } from './components/Sidebar';
import { CodeBlock } from './components/CodeBlock';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  const handleTopicSelect = (id: string) => {
    setActiveTopicId(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-50 font-sans overflow-hidden">
      {/* Mobile Header overlay control */}
      <div className="lg:hidden fixed top-0 w-full h-16 border-b border-gray-800/60 bg-gray-900/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <span className="font-semibold text-lg tracking-tight text-gray-100 flex items-center">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 border border-indigo-500/30">
            <span className="text-sm">🐳</span>
          </div>
          Docker Hub
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar
        topics={topics}
        activeTopicId={activeTopicId}
        onSelect={handleTopicSelect}
      />
      
      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-gray-950 lg:hidden overflow-y-auto w-full">
          <div className="py-6 px-4 space-y-2">
             {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl text-lg ${
                    topic.id === activeTopicId
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20'
                      : 'text-gray-400'
                  }`}
                >
                  {topic.title}
                </button>
              ))}
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-12 px-6 lg:pt-16 lg:px-12 scroll-smooth">
        <div className="max-w-3xl mx-auto h-full">
          <header className="mb-12">
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-4">
              {activeTopic.title}
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              {activeTopic.description}
            </p>
          </header>

          <div className="space-y-16">
            {activeTopic.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl lg:text-2xl font-medium text-gray-100 mb-5 flex items-center">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3 inline-block"></span>
                  {section.title}
                </h2>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-base mb-6">
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                {section.code && (
                  <CodeBlock code={section.code} language={section.language} />
                )}
              </section>
            ))}
          </div>
          
          <footer className="mt-24 border-t border-gray-800 pt-8 pb-4 text-center text-sm text-gray-500">
            End of {activeTopic.title} module.
          </footer>
        </div>
      </main>
    </div>
  );
}
