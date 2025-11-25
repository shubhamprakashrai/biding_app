import { create } from 'zustand';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/services/firebase/FirebaseService';

export interface QrCode {
  id: string;
  name: string;
  url: string;
  paymentId?: string;
}

interface QrCodesState {
  // State
  qrCodes: QrCode[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Subscription (stored internally)
  _unsubscribe: Unsubscribe | null;

  // Actions
  initialize: () => void;
  cleanup: () => void;
  forceRefresh: () => void;
  addQrCode: (qrCode: QrCode) => void;
  removeQrCode: (qrId: string) => void;
}

// Cache duration: 5 minutes (in milliseconds)
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * QR Codes ViewModel using Zustand
 * Manages QR codes state with caching and real-time updates
 */
export const useQrCodesViewModel = create<QrCodesState>((set, get) => ({
  // Initial state
  qrCodes: [],
  isLoading: false,
  isInitialized: false,
  error: null,
  lastFetchTime: null,
  _unsubscribe: null,

  /**
   * Initialize QR codes with real-time listener
   * Sets up listener only once
   */
  initialize: () => {
    const state = get();

    // Skip if already initialized and cache is valid
    if (state.isInitialized && state.lastFetchTime) {
      const cacheAge = Date.now() - state.lastFetchTime;
      if (cacheAge < CACHE_DURATION && state.qrCodes.length >= 0) {
        console.log('Using cached QR codes data');
        return;
      }
    }

    // Skip if already has an active subscription
    if (state._unsubscribe) {
      console.log('QR codes subscription already active');
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const docRef = doc(db, 'adminData', 'qrCodes');

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          try {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data && Array.isArray(data.qrCodes)) {
                set({
                  qrCodes: data.qrCodes,
                  isLoading: false,
                  isInitialized: true,
                  lastFetchTime: Date.now(),
                  error: null
                });
                console.log('QR codes loaded:', data.qrCodes.length);
              } else {
                set({
                  qrCodes: [],
                  isLoading: false,
                  isInitialized: true,
                  lastFetchTime: Date.now()
                });
              }
            } else {
              set({
                qrCodes: [],
                isLoading: false,
                isInitialized: true,
                lastFetchTime: Date.now()
              });
            }
          } catch (error: any) {
            console.error('Error processing QR codes:', error);
            set({ error: error.message, isLoading: false });
          }
        },
        (error) => {
          console.error('Error listening to QR codes:', error);
          set({ error: error.message, isLoading: false });
        }
      );

      set({ _unsubscribe: unsubscribe });
    } catch (error: any) {
      console.error('Error setting up QR codes listener:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Cleanup subscription
   */
  cleanup: () => {
    const state = get();

    if (state._unsubscribe) {
      state._unsubscribe();
    }

    set({
      _unsubscribe: null,
      isInitialized: false
    });
  },

  /**
   * Force refresh data
   */
  forceRefresh: () => {
    const state = get();

    // Cleanup existing subscription
    if (state._unsubscribe) {
      state._unsubscribe();
      set({ _unsubscribe: null });
    }

    // Reset state
    set({
      isInitialized: false,
      lastFetchTime: null
    });

    // Re-initialize
    get().initialize();
  },

  /**
   * Add a QR code to the cache (optimistic update)
   */
  addQrCode: (qrCode: QrCode) => {
    set(state => ({
      qrCodes: [...state.qrCodes, qrCode]
    }));
  },

  /**
   * Remove a QR code from the cache (optimistic update)
   */
  removeQrCode: (qrId: string) => {
    set(state => ({
      qrCodes: state.qrCodes.filter(qr => qr.id !== qrId)
    }));
  }
}));

// Export for convenience
export const useQrCodes = useQrCodesViewModel;
