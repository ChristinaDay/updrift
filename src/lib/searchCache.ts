interface CacheEntry {
  data: any;
  timestamp: number;
  searchParams: string;
}

interface SearchCache {
  [key: string]: CacheEntry;
}

// Cache and throttling configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours - how long to keep cached results
const MIN_INTERVAL_BETWEEN_CALLS = 24 * 60 * 60 * 1000; // 24 hours - minimum time between API calls for same search
const DEBOUNCE_DELAY = 300; // 300ms - delay before triggering search after user input

class SearchCacheManager {
  private cache: SearchCache = {};
  private lastCallTime: number = 0;
  private lastUserActivity: number = Date.now();
  private idleTimeout: number = 10 * 60 * 1000; // 10 minutes of inactivity

  private getCacheKey(searchQuery: string, location: string, radius: number): string {
    return `${searchQuery}:${location}:${radius}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < CACHE_DURATION;
  }

  private canMakeApiCall(): boolean {
    return Date.now() - this.lastCallTime >= MIN_INTERVAL_BETWEEN_CALLS;
  }

  private isUserActive(): boolean {
    return Date.now() - this.lastUserActivity < this.idleTimeout;
  }

  recordUserActivity(): void {
    this.lastUserActivity = Date.now();
  }

  getCachedResult(searchQuery: string, location: string, radius: number): any | null {
    const key = this.getCacheKey(searchQuery, location, radius);
    const entry = this.cache[key];
    
    if (entry && this.isCacheValid(entry)) {
      console.log('📦 Using cached search result for:', key);
      return entry.data;
    }
    
    return null;
  }

  getCacheEntry(searchQuery: string, location: string, radius: number): CacheEntry | null {
    const key = this.getCacheKey(searchQuery, location, radius);
    const entry = this.cache[key];
    
    if (entry && this.isCacheValid(entry)) {
      return entry;
    }
    
    return null;
  }

  setCachedResult(searchQuery: string, location: string, radius: number, data: any): void {
    const key = this.getCacheKey(searchQuery, location, radius);
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      searchParams: key
    };
    console.log('💾 Cached search result for:', key);
  }

  shouldMakeApiCall(searchQuery: string, location: string, radius: number): boolean {
    // Check if we have a valid cached result
    if (this.getCachedResult(searchQuery, location, radius)) {
      return false;
    }

    // Check if user is active (not idle)
    if (!this.isUserActive()) {
      console.log('😴 API call blocked - user is idle (inactive for 10+ minutes)');
      return false;
    }

    // Check if enough time has passed since last API call
    if (!this.canMakeApiCall()) {
      console.log('⏰ API call throttled - waiting for 24-hour cooldown period');
      return false;
    }

    return true;
  }

  recordApiCall(): void {
    this.lastCallTime = Date.now();
  }

  clearCache(): void {
    this.cache = {};
    console.log('🗑️ Search cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: Object.keys(this.cache).length,
      keys: Object.keys(this.cache)
    };
  }

  getAllCacheEntries(): CacheEntry[] {
    const now = Date.now();
    return Object.values(this.cache)
      .filter(entry => now - entry.timestamp < CACHE_DURATION)
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  }

  isUserIdle(): boolean {
    return !this.isUserActive();
  }

  getLastActivityTime(): number {
    return this.lastUserActivity;
  }
}

// Create a singleton instance
export const searchCache = new SearchCacheManager();

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
} 