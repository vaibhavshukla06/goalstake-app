import { PerformanceObserver, type EntryType } from 'react-native-performance';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  // Create a performance observer to track important metrics
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Log important events to Sentry
      if (entry.entryType === 'mark' || entry.entryType === 'measure') {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `${entry.name}: ${entry.duration || 0}ms`,
          level: 'info',
        });
      }
      
      // Console log in development
      if (__DEV__) {
        console.log(`Performance: ${entry.name} - ${entry.duration || 0}ms`);
      }
    });
  });

  // Start observing various performance entry types
  observer.observe({ entryTypes: ['mark', 'measure', 'resource'] as EntryType[] });

  return observer;
}

// Track a specific component render time
export function trackComponentRender(componentName: string) {
  const startMark = `${componentName}_start`;
  const endMark = `${componentName}_end`;
  const measureName = `${componentName}_render`;
  
  return {
    start: () => {
      performance.mark(startMark);
    },
    end: () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
      
      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    },
  };
}

// Custom hook for tracking React component rendering performance
export function useComponentPerformance(componentName: string) {
  const tracker = trackComponentRender(componentName);
  
  // Track render time on mount and unmount
  useEffect(() => {
    tracker.start();
    
    return () => {
      tracker.end();
    };
  }, []);
  
  return tracker;
}

// Track API call performance
export function trackApiCall(endpoint: string) {
  const startMark = `api_${endpoint}_start`;
  const endMark = `api_${endpoint}_end`;
  const measureName = `api_${endpoint}`;
  
  return {
    start: () => {
      performance.mark(startMark);
    },
    end: (status: 'success' | 'error' = 'success') => {
      performance.mark(endMark);
      performance.measure(`${measureName}_${status}`, startMark, endMark);
      
      // Clean up marks
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    },
  };
}

// Utility to track app startup time
export function trackAppStartup() {
  // Usually called at the app's entry point
  performance.mark('app_startup_start');
  
  // Call this when the app is fully rendered and interactive
  return () => {
    performance.mark('app_startup_end');
    performance.measure('app_startup', 'app_startup_start', 'app_startup_end');
    
    // Clean up marks
    performance.clearMarks('app_startup_start');
    performance.clearMarks('app_startup_end');
  };
} 