import { db } from '@/app/firebase/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { HomePageData, defaultHomePageData } from '@/types/homePage';

const HOME_PAGE_DOC_ID = 'homePageData';
const ADMIN_COLLECTION = 'adminData';

export class HomePageService {
  private static instance: HomePageService;
  private homePageData: HomePageData | null = null;
  private listeners: ((data: HomePageData) => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): HomePageService {
    if (!HomePageService.instance) {
      HomePageService.instance = new HomePageService();
    }
    return HomePageService.instance;
  }

  private notifyListeners() {
    if (this.homePageData) {
      this.listeners.forEach(listener => listener({ ...this.homePageData! }));
    }
  }

  public subscribe(callback: (data: HomePageData) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public async initializeHomePageData() {
    try {
      const docRef = doc(db, ADMIN_COLLECTION, HOME_PAGE_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create default home page data if it doesn't exist
        await this.setHomePageData(defaultHomePageData);
        this.homePageData = { ...defaultHomePageData, id: HOME_PAGE_DOC_ID };
      } else {
        const data = docSnap.data();
        this.homePageData = { 
          id: docSnap.id, 
          videoUrl: data.videoUrl,
          isActive: data.isActive !== false, // default to true if not set
          lastUpdated: data.lastUpdated?.toDate()
        };
      }

      // Set up real-time listener
      this.setupRealtimeListener();
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing home page data:', error);
      throw error;
    }
  }

  private setupRealtimeListener() {
    if (this.unsubscribe) {
      this.unsubscribe(); // Clean up any existing listener
    }
    
    const docRef = doc(db, ADMIN_COLLECTION, HOME_PAGE_DOC_ID);
    
    this.unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        this.homePageData = { 
          id: doc.id, 
          videoUrl: data.videoUrl,
          isActive: data.isActive !== false,
          lastUpdated: data.lastUpdated?.toDate()
        };
        this.notifyListeners();
      }
    });
  }

  public async setHomePageData(data: Partial<HomePageData>): Promise<void> {
    try {
      const docRef = doc(db, ADMIN_COLLECTION, HOME_PAGE_DOC_ID);
      const updateData = {
        ...data,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(docRef, updateData, { merge: true });
      // The real-time listener will update the local state
    } catch (error) {
      console.error('Error updating home page data:', error);
      throw error;
    }
  }

  public getCurrentData(): HomePageData | null {
    return this.homePageData ? { ...this.homePageData } : null;
  }

  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners = [];
  }
}

export const homePageService = HomePageService.getInstance();