import { create } from 'zustand';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/services/firebase/FirebaseService';
import { Project, Message } from '@/types';

interface ProjectsState {
  // State
  projects: Project[];
  userProjects: Project[];
  messages: Message[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastFetchTime: number | null;
  currentUserId: string | null;

  // Subscriptions (stored internally)
  _unsubscribeProjects: Unsubscribe | null;
  _unsubscribeUserProjects: Unsubscribe | null;

  // Actions
  initializeAllProjects: () => void;
  initializeUserProjects: (userId: string) => void;
  cleanup: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  forceRefresh: () => void;
}

// Cache duration: 5 minutes (in milliseconds)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Projects ViewModel using Zustand
 * Manages projects state with caching and real-time updates
 */
export const useProjectsViewModel = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: [],
  userProjects: [],
  messages: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  lastFetchTime: null,
  currentUserId: null,
  _unsubscribeProjects: null,
  _unsubscribeUserProjects: null,

  /**
   * Initialize all projects (for admin)
   * Sets up real-time listener only once
   */
  initializeAllProjects: () => {
    const state = get();

    // Skip if already initialized and cache is valid
    if (state.isInitialized && state.lastFetchTime) {
      const cacheAge = Date.now() - state.lastFetchTime;
      if (cacheAge < CACHE_DURATION && state.projects.length > 0) {
        console.log('Using cached projects data');
        return;
      }
    }

    // Skip if already has an active subscription
    if (state._unsubscribeProjects) {
      console.log('Projects subscription already active');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const unsubscribe = onSnapshot(
        collection(db, 'projects'),
        (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          set({
            projects: projectsData,
            isLoading: false,
            isInitialized: true,
            lastFetchTime: Date.now(),
            error: null
          });

          console.log('Projects loaded:', projectsData.length);
        },
        (error) => {
          console.error('Error listening to projects:', error);
          set({ error: error.message, isLoading: false });
        }
      );

      set({ _unsubscribeProjects: unsubscribe });
    } catch (error: any) {
      console.error('Error setting up projects listener:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Initialize user-specific projects
   * Sets up real-time listener only once per user
   */
  initializeUserProjects: (userId: string) => {
    const state = get();

    // Skip if same user and cache is valid
    if (state.currentUserId === userId && state.isInitialized && state.lastFetchTime) {
      const cacheAge = Date.now() - state.lastFetchTime;
      if (cacheAge < CACHE_DURATION && state.userProjects.length >= 0) {
        console.log('Using cached user projects data');
        return;
      }
    }

    // Cleanup previous user subscription if different user
    if (state.currentUserId !== userId && state._unsubscribeUserProjects) {
      state._unsubscribeUserProjects();
      set({ _unsubscribeUserProjects: null });
    }

    // Skip if already has an active subscription for this user
    if (state.currentUserId === userId && state._unsubscribeUserProjects) {
      console.log('User projects subscription already active');
      return;
    }

    set({ isLoading: true, error: null, currentUserId: userId });

    try {
      const q = query(collection(db, 'projects'), where('userId', '==', userId));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Project[];

          set({
            userProjects: projectsData,
            isLoading: false,
            isInitialized: true,
            lastFetchTime: Date.now(),
            error: null
          });

          console.log('User projects loaded:', projectsData.length);
        },
        (error) => {
          console.error('Error listening to user projects:', error);
          set({ error: error.message, isLoading: false });
        }
      );

      set({ _unsubscribeUserProjects: unsubscribe });
    } catch (error: any) {
      console.error('Error setting up user projects listener:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Cleanup subscriptions
   */
  cleanup: () => {
    const state = get();

    if (state._unsubscribeProjects) {
      state._unsubscribeProjects();
    }
    if (state._unsubscribeUserProjects) {
      state._unsubscribeUserProjects();
    }

    set({
      _unsubscribeProjects: null,
      _unsubscribeUserProjects: null,
      isInitialized: false,
      currentUserId: null
    });
  },

  /**
   * Add a new project to the cache
   */
  addProject: (project: Project) => {
    set(state => ({
      projects: [project, ...state.projects],
      userProjects: project.userId === state.currentUserId
        ? [project, ...state.userProjects]
        : state.userProjects
    }));
  },

  /**
   * Update an existing project in the cache
   */
  updateProject: (project: Project) => {
    set(state => ({
      projects: state.projects.map(p => p.id === project.id ? project : p),
      userProjects: state.userProjects.map(p => p.id === project.id ? project : p)
    }));
  },

  /**
   * Remove a project from the cache
   */
  removeProject: (projectId: string) => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== projectId),
      userProjects: state.userProjects.filter(p => p.id !== projectId)
    }));
  },

  /**
   * Set messages
   */
  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  /**
   * Add a message
   */
  addMessage: (message: Message) => {
    set(state => ({
      messages: [...state.messages, message]
    }));
  },

  /**
   * Force refresh data
   */
  forceRefresh: () => {
    const state = get();

    // Cleanup existing subscriptions
    if (state._unsubscribeProjects) {
      state._unsubscribeProjects();
      set({ _unsubscribeProjects: null });
    }
    if (state._unsubscribeUserProjects) {
      state._unsubscribeUserProjects();
      set({ _unsubscribeUserProjects: null });
    }

    // Reset state
    set({
      isInitialized: false,
      lastFetchTime: null
    });

    // Re-initialize based on current context
    if (state.currentUserId) {
      get().initializeUserProjects(state.currentUserId);
    } else {
      get().initializeAllProjects();
    }
  }
}));

// Export for convenience
export const useProjects = useProjectsViewModel;
