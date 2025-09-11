import { useState, useEffect } from 'react';
import { HomePageData } from '@/types/homePage';
import { homePageService } from '@/services/homePageService';

export const useHomePageData = (): [HomePageData | null, boolean, Error | null] => {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Initialize the service if not already done
        await homePageService.initializeHomePageData();
        
        // Set initial data
        if (mounted) {
          setData(homePageService.getCurrentData());
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    initialize();

    // Subscribe to real-time updates
    const unsubscribe = homePageService.subscribe((updatedData) => {
      if (mounted) {
        setData(updatedData);
      }
    });

    return () => {
      mounted = false;
      // The service manages its own subscriptions, so we don't need to unsubscribe here
      // as the service is a singleton and other components might still need updates
    };
  }, []);

  return [data, loading, error];
};

export const useUpdateHomePage = () => {
  const updateHomePage = async (data: Partial<HomePageData>) => {
    try {
      await homePageService.setHomePageData(data);
      return { success: true };
    } catch (error) {
      console.error('Failed to update home page:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update home page'
      };
    }
  };

  return { updateHomePage };
};
