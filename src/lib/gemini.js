import { GoogleGenerativeAI } from '@google/generative-ai';
import useAppStore from '@/store/useAppStore';

let genAI = null;

export const initGemini = (apiKey) => {
  if (!apiKey) return;
  genAI = new GoogleGenerativeAI(apiKey);
};

export const chatWithTutor = async (history, message, contextData) => {
  const apiKey = useAppStore.getState().geminiApiKey;
  if (!apiKey) throw new Error('No API key provided');

  if (!genAI) {
    initGemini(apiKey);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  // Pre-prompt injecting the automaton context
  let contextPrompt = `You are a strict but encouraging Theory of Computation tutor in a platform called AutomataVerse. 
  Your goal is to guide students through building and understanding finite automata (DFA, NFA), Turing Machines, and Formal Languages.
  DO NOT give away exact answers easily. Use the Socratic method.
  
  CURRENT STATE CONTEXT:
  ${JSON.stringify(contextData, null, 2)}
  `;

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: contextPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I have the context and am ready to tutor the student.' }] },
      ...history
    ],
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
};
