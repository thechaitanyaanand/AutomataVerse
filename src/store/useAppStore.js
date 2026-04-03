import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      activePage: '/',
      sidebarOpen: false,
      completedModules: [],
      quizScore: 0,
      savedMachines: [],
      geminiApiKey: '',

      setActivePage: (page) => set({ activePage: page }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      closeSidebar: () => set({ sidebarOpen: false }),
      completeModule: (id) => set((s) => ({
        completedModules: s.completedModules.includes(id) 
          ? s.completedModules 
          : [...s.completedModules, id]
      })),
      addQuizScore: (points) => set((s) => ({ quizScore: s.quizScore + points })),
      resetQuizScore: () => set({ quizScore: 0 }),
      saveMachine: (machine) => set((s) => ({
        savedMachines: [...s.savedMachines, { ...machine, id: Date.now().toString() }]
      })),
      deleteMachine: (id) => set((s) => ({
        savedMachines: s.savedMachines.filter(m => m.id !== id)
      })),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
    }),
    {
      name: 'automataverse-progress-storage', // unique name
      partialize: (state) => ({ 
        completedModules: state.completedModules, 
        quizScore: state.quizScore,
        savedMachines: state.savedMachines,
        geminiApiKey: state.geminiApiKey,
      }), // Persist progress and saved machines
    }
  )
);

export default useAppStore;
