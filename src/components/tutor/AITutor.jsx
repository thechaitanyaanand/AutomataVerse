import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Key, Sparkles } from 'lucide-react';
import useTutorStore from '@/store/useTutorStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ReactMarkdown from 'react-markdown';

export default function AITutor({ systemContext, toolsContext }) {
  const { apiKey, chatHistory, isOpen, toggleOpen, isTyping, sendMessage } = useTutorStore();
  const [inputVal, setInputVal] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || !apiKey) return;
    sendMessage(inputVal, systemContext, toolsContext);
    setInputVal('');
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleOpen}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-violet flex items-center justify-center to-violet-light rounded-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all z-50 text-white"
          >
            <Sparkles size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[360px] h-[550px] bg-void/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center text-violet-light">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">AI Tutor</h3>
                  <p className="text-[10px] text-text-muted">powered by Gemini</p>
                </div>
              </div>
              <button onClick={toggleOpen} className="text-text-muted hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!apiKey ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Key size={24} />
                  </div>
                  <h4 className="text-sm font-semibold text-text-primary">API Key Missing</h4>
                  <p className="text-xs text-text-secondary">
                    Tutor is currently disabled. Please add <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file.
                  </p>
                </div>
              ) : (
                <>
                  {chatHistory.length === 0 && (
                    <div className="text-center text-xs text-text-muted mt-10 space-y-2">
                      <Sparkles size={24} className="mx-auto opacity-50" />
                      <p>Hello! I am your AI Tutor.</p>
                      <p>I can help you build automata, explain concepts, or check your work.</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-violet/20 text-text-primary border border-violet/30 rounded-br-sm' 
                          : 'bg-white/5 text-text-secondary border border-white/10 rounded-bl-sm prose prose-invert prose-sm'
                      }`}>
                        {msg.role === 'assistant' ? (
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </>
              )}
            </div>

            {/* Input Footer */}
            {apiKey && (
              <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/[0.02]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    placeholder="Ask tutor or give a command..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-violet/50"
                  />
                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="w-10 h-10 flex items-center justify-center bg-violet disabled:bg-violet/50 text-white rounded-xl transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
