import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Key, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';
import useAppStore from '@/store/useAppStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { chatWithTutor } from '@/lib/gemini';

export default function AITutor({ contextData = {}, moduleName = 'AutomataVerse' }) {
  const { geminiApiKey, setGeminiApiKey } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  
  const [messages, setMessages] = useState([
    { role: 'model', content: `Hello! I'm your AI Tutor for **${moduleName}**. How can I help you today?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSaveKey = () => {
    if (inputKey.trim() !== '') {
      setGeminiApiKey(inputKey.trim());
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !geminiApiKey) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Convert UI messages format to Gemini history format (excluding first welcome msg)
      const history = messages.slice(1).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Add a slight delay for realism, especially for fast API returns
      const response = await chatWithTutor(history, userMessage, { moduleName, ...contextData });
      
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: `*Error:* ${err.message}. Please check your API key.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={clsx(
          'fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl shadow-indigo-500/20 text-white transition-all',
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100',
          geminiApiKey ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/10 border border-white/20 hover:bg-white/20'
        )}
      >
        {geminiApiKey ? <Bot size={24} /> : <Key size={24} />}
        {geminiApiKey && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-[#09090b]" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] flex flex-col rounded-2xl border border-white/10 bg-[#09090b]/95 backdrop-blur-2xl shadow-2xl shadow-black overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles size={16} />
                </div>
                <div>
                   <h3 className="text-sm font-semibold text-text-primary">AI Tutor</h3>
                   <p className="text-[10px] text-text-muted">{geminiApiKey ? 'Connected to Gemini 1.5' : 'Setup required'}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {!geminiApiKey ? (
              /* API Key Setup State */
              <div className="flex-1 flex flex-col justify-center p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-emerald-400 border border-white/10">
                  <Key size={24} />
                </div>
                <h4 className="text-lg font-display text-white mb-2">Connect AI Tutor</h4>
                <p className="text-sm text-text-muted mb-6">
                  Enter a Gemini API Key to enable your personal Theory of Computation tutor. Your key is stored solely in your local browser.
                </p>
                <div className="flex flex-col gap-3">
                   <Input 
                     type="password"
                     placeholder="AIzaSy..." 
                     value={inputKey}
                     onChange={(e) => setInputKey(e.target.value)}
                   />
                   <Button onClick={handleSaveKey} className="w-full">Save Key</Button>
                </div>
              </div>
            ) : (
              /* Chat State */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={clsx(
                        "flex flex-col max-w-[85%]",
                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <span className="text-[10px] text-text-muted mb-1 px-1">
                        {msg.role === 'user' ? 'You' : 'AI Tutor'}
                      </span>
                      <div className={clsx(
                        "px-3 py-2 text-sm rounded-2xl whitespace-pre-wrap leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-indigo-500 text-white rounded-br-sm" 
                          : "bg-white/10 text-text-secondary rounded-bl-sm border border-white/5"
                      )}>
                        {msg.role === 'user' ? msg.content : (
                          <ReactMarkdown className="prose prose-invert prose-sm prose-p:my-1 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="mr-auto flex flex-col items-start">
                       <div className="px-4 py-3 text-sm rounded-2xl rounded-bl-sm bg-white/5 border border-white/5 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-[#09090b] border-t border-white/5">
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-text-primary focus:outline-none focus:border-indigo-500/50 transition-colors"
                      placeholder="Ask about the current topic..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={isTyping}
                    />
                    <button 
                      type="submit"
                      disabled={isTyping || !inputText.trim()}
                      className="absolute right-2 p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 disabled:opacity-50 transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
