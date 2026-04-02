import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      activePage: '/',
      sidebarOpen: false,
      completedModules: [],
      quizScore: 0,

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
    }),
    {
      name: 'automataverse-progress-storage', // unique name
      partialize: (state) => ({ 
        completedModules: state.completedModules, 
        quizScore: state.quizScore 
      }), // Persist only progress, not active page or sidebar state
    }
  )
);

export default useAppStore;
