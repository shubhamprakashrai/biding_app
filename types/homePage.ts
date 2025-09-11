export interface HomePageData {
  id?: string; // Document ID in Firestore
  videoUrl?: string; // YouTube video URL for the hero section
  lastUpdated?: Date;
  isActive?: boolean;
}

export const defaultHomePageData: HomePageData = {
  videoUrl: '',
  isActive: true
};
