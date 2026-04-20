import { create } from 'zustand';
import { GoogleGenerativeAI } from '@google/generative-ai';

const useTutorStore = create((set, get) => ({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '',
  chatHistory: [],
  isOpen: false,
  isTyping: false,

  setApiKey: (key) => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      localStorage.setItem('gemini_api_key', key);
    }
    set({ apiKey: key || import.meta.env.VITE_GEMINI_API_KEY || '' });
  },

  toggleOpen: () => set(s => ({ isOpen: !s.isOpen })),
  
  clearChat: () => set({ chatHistory: [] }),

  sendMessage: async (userMessage, systemContext, toolsContext) => {
    const { apiKey, chatHistory } = get();
    if (!apiKey) return;

    // Add user message immediately
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    set({ chatHistory: updatedHistory, isTyping: true });

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const functionDeclarations = [
        {
          name: 'addState',
          description: 'Adds a new state to the automaton graph.',
          parameters: {
            type: 'OBJECT',
            properties: {
              label: { type: 'STRING', description: 'The name of the state (e.g. q3)' },
              isAccept: { type: 'BOOLEAN', description: 'Whether it is an accept state' }
            },
            required: ['label']
          }
        },
        {
          name: 'addTransition',
          description: 'Adds a directed transition between two states.',
          parameters: {
            type: 'OBJECT',
            properties: {
              source: { type: 'STRING', description: 'Source state label (e.g. q1)' },
              target: { type: 'STRING', description: 'Target state label (e.g. q2)' },
              symbol: { type: 'STRING', description: 'The input symbol (e.g. 0, 1, a, b)' }
            },
            required: ['source', 'target', 'symbol']
          }
        },
        {
          name: 'clearGraph',
          description: 'Clears the entire automaton graph.',
          parameters: { type: 'OBJECT', properties: {} }
        }
      ];

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [{ functionDeclarations }],
        systemInstruction: systemContext,
      });

      // Prepare history for Gemini format (role must be 'user' or 'model')
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chatSession = model.startChat({
        history: formattedHistory,
      });

      let result = await chatSession.sendMessage(userMessage);
      let response = result.response;
      
      let functionCalls = response.functionCalls();
      let assistantMessageText = response.text();
      let executionLogs = [];

      while (functionCalls && functionCalls.length > 0) {
        let functionResponses = [];
        for (const call of functionCalls) {
          try {
            if (call.name === 'addState') {
              toolsContext.addState(call.args.label, call.args.isAccept);
              executionLogs.push(`Added state ${call.args.label}`);
            } else if (call.name === 'addTransition') {
              toolsContext.addTransition(call.args.source, call.args.symbol, call.args.target);
              executionLogs.push(`Added transition ${call.args.source} -[${call.args.symbol}]-> ${call.args.target}`);
            } else if (call.name === 'clearGraph') {
              toolsContext.clearAll();
              executionLogs.push('Cleared graph.');
            }
            
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { success: true }
              }
            });
          } catch (e) {
            console.error('Function call error', e);
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { error: e.message }
              }
            });
          }
        }
        
        // Return function results back to the model so it can continue generating
        result = await chatSession.sendMessage(functionResponses);
        response = result.response;
        functionCalls = response.functionCalls();
        if (response.text()) {
          assistantMessageText = response.text();
        }
      }

      if (executionLogs.length > 0 && !assistantMessageText) {
        assistantMessageText = `I have updated the graph! (${executionLogs.join(', ')})`;
      }

      set(s => ({
        chatHistory: [...s.chatHistory, { role: 'assistant', content: assistantMessageText }],
        isTyping: false
      }));

    } catch (error) {
      console.error(error);
      set(s => ({
        chatHistory: [...s.chatHistory, { role: 'assistant', content: `Error: ${error.message}` }],
        isTyping: false
      }));
    }
  }
}));

export default useTutorStore;
