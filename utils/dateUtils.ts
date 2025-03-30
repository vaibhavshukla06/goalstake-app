export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };
  
  export const getDaysBetween = (startDate: Date, endDate: Date): number => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((startDate.getTime() - endDate.getTime()) / oneDay));
    return diffDays;
  };
  
  /**
   * Calculate the number of days remaining between now and a future date
   * @param endDateString ISO date string of the end date
   * @returns Number of days remaining, 0 if date is past
   */
  export const getDaysRemaining = (endDateString: string): number => {
    const endDate = new Date(endDateString);
    const now = new Date();
    
    // If end date is in the past, return 0
    if (endDate <= now) {
      return 0;
    }
    
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.floor((endDate.getTime() - now.getTime()) / oneDay);
    return diffDays;
  };
  
  export const getRelativeTimeString = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return formatDate(dateString);
  };
  
  export const isDateInPast = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  };
  
  export const isDateInFuture = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
  };
  
  export const isDateToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    return date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
  };
  
  export const addDays = (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  /**
   * Generates a unique ID with optional prefix
   * @param prefix Optional prefix for the ID
   * @returns A unique string ID
   */
  export const generateId = (prefix: string = ''): string => {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${prefix}${prefix ? '-' : ''}${timestamp}-${randomPart}`;
  };