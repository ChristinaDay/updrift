'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolidIcon,
  ExclamationTriangleIcon as ExclamationTriangleSolidIcon
} from '@heroicons/react/24/solid';
import Header from '@/components/Header';

// Import quota tracker with error handling
let quotaTrackerInstance: any = null;
try {
  const { quotaTracker } = require('@/lib/quotaTracker');
  quotaTrackerInstance = quotaTracker;
} catch (error) {
  console.error('Failed to import quota tracker:', error);
  // Create a fallback quota tracker
  quotaTrackerInstance = {
    getMonthlyQuota: (apiName: string) => ({
      apiName,
      monthlyLimit: 1000,
      currentUsage: 0,
      remainingQuota: 1000,
      usagePercentage: 0,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      lastUpdated: new Date()
    }),
    getUsageEstimate: (apiName: string) => ({
      dailyUsage: 0,
      weeklyUsage: 0,
      monthlyUsage: 0,
      estimatedMonthlyTotal: 0,
      daysUntilReset: 30
    })
  };
}

interface APIUsage {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastUsed: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

interface MonthlyQuota {
  apiName: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingQuota: number;
  usagePercentage: number;
  resetDate: Date;
  lastUpdated: Date;
}

interface QuotaEstimate {
  dailyUsage: number;
  weeklyUsage: number;
  monthlyUsage: number;
  estimatedMonthlyTotal: number;
  daysUntilReset: number;
}

interface APIStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  logoUrl?: string;
  description: string;
  usage: APIUsage;
  configStatus: 'configured' | 'missing-key' | 'not-configured';
  features: string[];
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  monthlyQuota?: MonthlyQuota;
  quotaEstimate?: QuotaEstimate;
}

export default function APIhubPage() {
  console.log('🚀 APIhubPage component loading...');
  
  const { data: session } = useSession();
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadAPIStatuses();
  }, []);

  const loadAPIStatuses = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading API statuses...');
      
      // Get rate limit information
      const rateLimitResponse = await fetch('/api/debug/rate-limits');
      console.log('📊 Rate limit response status:', rateLimitResponse.status);
      const rateLimitData = rateLimitResponse.ok ? await rateLimitResponse.json() : {};
      console.log('📊 Rate limit data:', rateLimitData);
      
      // Get API test results
      const testResponse = await fetch('/api/jobs/test');
      console.log('🧪 Test response status:', testResponse.status);
      const testData = testResponse.ok ? await testResponse.json() : {};
      console.log('🧪 Test data:', testData);

      // Get quota information
      const adzunaQuota = quotaTrackerInstance.getMonthlyQuota('adzuna');
      const jsearchQuota = quotaTrackerInstance.getMonthlyQuota('jsearch');
      console.log('📈 Adzuna quota:', adzunaQuota);
      console.log('📈 JSearch quota:', jsearchQuota);

      const statuses: APIStatus[] = [
        {
          id: 'adzuna',
          name: 'Adzuna',
          status: testData.adzuna?.status === 'success' ? 'active' : 'error',
          logoUrl: '/logos/Adzuna.png',
          description: 'Comprehensive job search API with detailed job information, salary data, and company details.',
          usage: {
            totalRequests: rateLimitData.adzuna?.totalRequests || 0,
            successfulRequests: rateLimitData.adzuna?.successfulRequests || 0,
            failedRequests: rateLimitData.adzuna?.failedRequests || 0,
            averageResponseTime: rateLimitData.adzuna?.averageResponseTime || 0,
            lastUsed: rateLimitData.adzuna?.lastUsed || 'Never',
            rateLimitRemaining: rateLimitData.adzuna?.remaining,
            rateLimitReset: rateLimitData.adzuna?.resetTime
          },
          configStatus: testData.adzuna?.configured ? 'configured' : 'missing-key',
          features: [
            'Job search with location filtering',
            'Salary information',
            'Company details and logos',
            'Remote job filtering',
            'Job descriptions and requirements'
          ],
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          monthlyQuota: adzunaQuota,
          quotaEstimate: quotaTrackerInstance.getUsageEstimate('adzuna')
        },
        {
          id: 'jsearch',
          name: 'JSearch',
          status: testData.jsearch?.status === 'success' ? 'active' : 'error',
          logoUrl: '/logos/jsearch-rapidapi.jpeg',
          description: 'RapidAPI-powered job search with real-time job listings and comprehensive search capabilities.',
          usage: {
            totalRequests: rateLimitData.jsearch?.totalRequests || 0,
            successfulRequests: rateLimitData.jsearch?.successfulRequests || 0,
            failedRequests: rateLimitData.jsearch?.failedRequests || 0,
            averageResponseTime: rateLimitData.jsearch?.averageResponseTime || 0,
            lastUsed: rateLimitData.jsearch?.lastUsed || 'Never',
            rateLimitRemaining: rateLimitData.jsearch?.remaining,
            rateLimitReset: rateLimitData.jsearch?.resetTime
          },
          configStatus: testData.jsearch?.configured ? 'configured' : 'missing-key',
          features: [
            'Real-time job listings',
            'Advanced search filters',
            'Job categorization',
            'Company information',
            'Application tracking'
          ],
          rateLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000
          },
          monthlyQuota: jsearchQuota,
          quotaEstimate: quotaTrackerInstance.getUsageEstimate('jsearch')
        },
        {
          id: 'mock',
          name: 'MockJobs',
          status: 'testing',
          logoUrl: '/logos/mock.png',
          description: 'Testing API for development and demonstration purposes with sample job data.',
          usage: {
            totalRequests: rateLimitData.mock?.totalRequests || 0,
            successfulRequests: rateLimitData.mock?.successfulRequests || 0,
            failedRequests: rateLimitData.mock?.failedRequests || 0,
            averageResponseTime: rateLimitData.mock?.averageResponseTime || 0,
            lastUsed: rateLimitData.mock?.lastUsed || 'Never'
          },
          configStatus: 'configured',
          features: [
            'Sample job data',
            'Development testing',
            'Demo functionality',
            'No API keys required'
          ]
        }
      ];

      console.log('✅ API statuses loaded:', statuses);
      setApiStatuses(statuses);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error('❌ Error loading API statuses:', error);
      // Set some default statuses if there's an error
      setApiStatuses([
        {
          id: 'adzuna',
          name: 'Adzuna',
          status: 'error',
          logoUrl: '/logos/Adzuna.png',
          description: 'Comprehensive job search API with detailed job information, salary data, and company details.',
          usage: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastUsed: 'Never'
          },
          configStatus: 'not-configured',
          features: [
            'Job search with location filtering',
            'Salary information',
            'Company details and logos',
            'Remote job filtering',
            'Job descriptions and requirements'
          ],
          rateLimits: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          }
        },
        {
          id: 'jsearch',
          name: 'JSearch',
          status: 'error',
          logoUrl: '/logos/jsearch-rapidapi.jpeg',
          description: 'RapidAPI-powered job search with real-time job listings and comprehensive search capabilities.',
          usage: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            lastUsed: 'Never'
          },
          configStatus: 'not-configured',
          features: [
            'Real-time job listings',
            'Advanced search filters',
            'Job categorization',
            'Company information',
            'Application tracking'
          ],
          rateLimits: {
            requestsPerMinute: 30,
            requestsPerHour: 500,
            requestsPerDay: 5000
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleSolidIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleSolidIcon className="h-5 w-5 text-red-500" />;
      case 'inactive':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'testing':
        return <CogIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'error':
        return 'Error';
      case 'inactive':
        return 'Inactive';
      case 'testing':
        return 'Testing';
      default:
        return 'Unknown';
    }
  };

  const getConfigStatusText = (status: string) => {
    switch (status) {
      case 'configured':
        return 'Configured';
      case 'missing-key':
        return 'Missing API Key';
      case 'not-configured':
        return 'Not Configured';
      default:
        return 'Unknown';
    }
  };

  const getConfigStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'text-primary';
      case 'missing-key':
        return 'text-warning';
      case 'not-configured':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getQuotaStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    if (percentage >= 50) return 'text-accent';
    return 'text-primary';
  };

  const getQuotaStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <ExclamationTriangleSolidIcon className="h-4 w-4 text-destructive" />;
    if (percentage >= 75) return <ExclamationTriangleIcon className="h-4 w-4 text-warning" />;
    if (percentage >= 50) return <ClockIcon className="h-4 w-4 text-accent" />;
    return <CheckCircleIcon className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">APIhub</h1>
          <p className="text-lg text-muted-foreground mb-4">
            All connected job API sources powering your UpDrift search. More sources = better results!
          </p>
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow"
            >
              ← Return to Dashboard
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={loadAPIStatuses}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </button>
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {apiStatuses.map((api) => (
            <div key={api.id} className="bg-card rounded-lg shadow border border-border p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {api.logoUrl && (
                    <img 
                      src={api.logoUrl} 
                      alt={`${api.name} logo`} 
                      className="w-12 h-12 rounded bg-muted object-contain" 
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{api.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(api.status)}
                      <span className="text-sm font-medium">{getStatusText(api.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getConfigStatusColor(api.configStatus)}`}>
                    {getConfigStatusText(api.configStatus)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4">{api.description}</p>

              {/* Monthly Quota Section */}
              {api.monthlyQuota && (
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Monthly Quota</h4>
                    {getQuotaStatusIcon(api.monthlyQuota.usagePercentage)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Used</p>
                      <p className="text-lg font-semibold text-foreground">
                        {api.monthlyQuota.currentUsage} / {api.monthlyQuota.monthlyLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className={`text-lg font-semibold ${getQuotaStatusColor(api.monthlyQuota.usagePercentage)}`}>
                        {api.monthlyQuota.remainingQuota}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        api.monthlyQuota.usagePercentage >= 90 ? 'bg-destructive' :
                        api.monthlyQuota.usagePercentage >= 75 ? 'bg-warning' :
                        api.monthlyQuota.usagePercentage >= 50 ? 'bg-accent' :
                        'bg-primary'
                      }`}
                      style={{ width: `${Math.min(api.monthlyQuota.usagePercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{Math.round(api.monthlyQuota.usagePercentage)}% used</span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Resets {api.monthlyQuota.resetDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Usage Estimates */}
              {api.quotaEstimate && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">Usage Estimates</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Daily Average</p>
                      <p className="font-medium">{api.quotaEstimate.dailyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weekly Total</p>
                      <p className="font-medium">{api.quotaEstimate.weeklyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly Total</p>
                      <p className="font-medium">{api.quotaEstimate.monthlyUsage} requests</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projected Monthly</p>
                      <p className="font-medium">{api.quotaEstimate.estimatedMonthlyTotal} requests</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Usage Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                  <p className="text-lg font-semibold text-foreground">{api.usage.totalRequests}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p className="text-lg font-semibold text-foreground">
                    {api.usage.totalRequests > 0 
                      ? Math.round((api.usage.successfulRequests / api.usage.totalRequests) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  <p className="text-lg font-semibold text-foreground">
                    {api.usage.averageResponseTime > 0 
                      ? `${Math.round(api.usage.averageResponseTime)}ms`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Last Used</p>
                  <p className="text-sm font-semibold text-foreground">
                    {api.usage.lastUsed === 'Never' ? 'Never' : new Date(api.usage.lastUsed).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rate Limits */}
              {api.rateLimits && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Rate Limits</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerMinute}/min</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerHour}/hour</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-foreground font-medium">{api.rateLimits.requestsPerDay}/day</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {api.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-card rounded-lg shadow border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">API Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Active APIs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.reduce((total, api) => total + api.usage.totalRequests, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.configStatus === 'configured').length}
              </p>
              <p className="text-sm text-muted-foreground">Configured</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {apiStatuses.filter(api => api.configStatus === 'missing-key').length}
              </p>
              <p className="text-sm text-muted-foreground">Need Setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 