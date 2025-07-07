'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon, ChartBarIcon, SparklesIcon, RocketLaunchIcon, UserIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import ThemeToggle from '@/components/ThemeToggle'

// Dynamic Wave Component
function DynamicWaves() {
  const [time, setTime] = useState(0)
  
  useEffect(() => {
    let animationId: number
    const animate = () => {
      setTime(prev => prev + 0.02)
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => { if (animationId) cancelAnimationFrame(animationId) }
  }, [])

  // Generate a wave path for a given y offset (top or bottom)
  const generateWavePoints = (
    amplitude: number,
    frequency: number,
    offset: number,
    phase: number,
    yBase: number,
    invert: boolean = false
  ) => {
    const points = []
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    for (let x = 0; x <= width; x += width / 200) {
      const normalizedX = x / width
      const y = yBase + amplitude * Math.sin(frequency * normalizedX * Math.PI * 2 + time * phase + offset)
      points.push([x, invert ? yBase * 2 - y : y])
    }
    return points
  }

  // Main wave parameters (less tall)
  const topAmplitude = 10
  const topFrequency = 1.2
  const topOffset = 0
  const topPhase = 1
  const topY = 50

  const bottomAmplitude = 7
  const bottomFrequency = 1.7
  const bottomOffset = 1.5
  const bottomPhase = 1.3
  const bottomY = 150

  // Generate points for top and bottom waves
  const topPoints = generateWavePoints(topAmplitude, topFrequency, topOffset, topPhase, topY)
  const bottomPoints = generateWavePoints(bottomAmplitude, bottomFrequency, bottomOffset, bottomPhase, bottomY)

  // Build the path: top wave → right edge → bottom wave (reversed) → left edge
  const path = [
    `M ${topPoints[0][0]},${topPoints[0][1]}`,
    ...topPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bottomPoints[bottomPoints.length - 1][0]},${bottomPoints[bottomPoints.length - 1][1]}`,
    ...bottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  // Background wave parameters (more compact)
  const bgTopAmplitude = 18
  const bgTopFrequency = 0.9
  const bgTopOffset = 0.7
  const bgTopPhase = 0.7
  const bgTopY = 80

  const bgBottomAmplitude = 12
  const bgBottomFrequency = 1.1
  const bgBottomOffset = 2.2
  const bgBottomPhase = 1.1
  const bgBottomY = 160

  const bgTopPoints = generateWavePoints(bgTopAmplitude, bgTopFrequency, bgTopOffset, bgTopPhase, bgTopY)
  const bgBottomPoints = generateWavePoints(bgBottomAmplitude, bgBottomFrequency, bgBottomOffset, bgBottomPhase, bgBottomY)

  const bgPath = [
    `M ${bgTopPoints[0][0]},${bgTopPoints[0][1]}`,
    ...bgTopPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bgBottomPoints[bgBottomPoints.length - 1][0]},${bgBottomPoints[bgBottomPoints.length - 1][1]}`,
    ...bgBottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  // Third, most transparent background wave parameters
  const bg2TopAmplitude = 22
  const bg2TopFrequency = 0.7
  const bg2TopOffset = 1.2
  const bg2TopPhase = 0.5
  const bg2TopY = 90

  const bg2BottomAmplitude = 14
  const bg2BottomFrequency = 0.8
  const bg2BottomOffset = 2.8
  const bg2BottomPhase = 0.8
  const bg2BottomY = 140

  const bg2TopPoints = generateWavePoints(bg2TopAmplitude, bg2TopFrequency, bg2TopOffset, bg2TopPhase, bg2TopY)
  const bg2BottomPoints = generateWavePoints(bg2BottomAmplitude, bg2BottomFrequency, bg2BottomOffset, bg2BottomPhase, bg2BottomY)

  const bgPath2 = [
    `M ${bg2TopPoints[0][0]},${bg2TopPoints[0][1]}`,
    ...bg2TopPoints.slice(1).map(([x, y]) => `L ${x},${y}`),
    `L ${bg2BottomPoints[bg2BottomPoints.length - 1][0]},${bg2BottomPoints[bg2BottomPoints.length - 1][1]}`,
    ...bg2BottomPoints.slice(0, -1).reverse().map(([x, y]) => `L ${x},${y}`),
    'Z',
  ].join(' ')

  return (
    <svg
      className="w-full h-[180px]"
      width="100%"
      height="180"
      viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1200} 180`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="liquid-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.56" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.24" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Third, most transparent background wave for extra depth */}
      <path d={bgPath2} fill="url(#liquid-gradient-bg2)" />
      {/* Background wave for depth */}
      <path d={bgPath} fill="url(#liquid-gradient-bg)" />
      {/* Main dynamic wave */}
      <path d={path} fill="url(#liquid-gradient)" />
    </svg>
  )
}

// Starfield Component
function Starfield({ width = 1920, height = 400, numLayers = 3, starsPerLayer = [40, 30, 20] }) {
  const layers = Array.from({ length: numLayers })
  const colors = [
    'rgba(255,255,255,0.7)',
    'rgba(180,200,255,0.5)',
    'rgba(140,160,255,0.3)'
  ]
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {layers.map((_, layerIdx) => (
        <svg
          key={layerIdx}
          className={`absolute inset-0 w-full h-full animate-starfield-parallax parallax-layer-${layerIdx}`}
          width={width}
          height={height}
          style={{
            zIndex: layerIdx,
            opacity: 0.7 - layerIdx * 0.2,
            filter: 'blur(' + layerIdx * 0.5 + 'px)'
          }}
        >
          {Array.from({ length: starsPerLayer[layerIdx] }).map((_, i) => {
            const x = Math.random() * width
            const y = Math.random() * height
            const r = 0.7 + Math.random() * (1.2 - 0.7)
            const twinkleDur = 2.5 + Math.random() * 2.5
            const twinkleDelay = Math.random() * 3
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                fill={colors[layerIdx % colors.length]}
                style={{
                  opacity: 0.7,
                  transformOrigin: `${x}px ${y}px`,
                  animation: `starTwinkle ${twinkleDur}s ease-in-out ${twinkleDelay}s infinite`
                }}
              />
            )
          })}
        </svg>
      ))}
      <style jsx>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          25% { opacity: 0.7; transform: scale(1.1); }
          50% { opacity: 1; transform: scale(1.2); }
          75% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-starfield-parallax.parallax-layer-0 { animation: parallax0 60s linear infinite; }
        .animate-starfield-parallax.parallax-layer-1 { animation: parallax1 90s linear infinite; }
        .animate-starfield-parallax.parallax-layer-2 { animation: parallax2 120s linear infinite; }
        @keyframes parallax0 { 0% { transform: translateY(0px); } 100% { transform: translateY(10px); } }
        @keyframes parallax1 { 0% { transform: translateY(0px); } 100% { transform: translateY(20px); } }
        @keyframes parallax2 { 0% { transform: translateY(0px); } 100% { transform: translateY(30px); } }
      `}</style>
    </div>
  )
}

// Utility for random between min and max
function rand(min: number, max: number) { return min + Math.random() * (max - min); }

// RiverParticles Component
function RiverParticles({ width = 1920, height = 180, numParticles = 35, numStreams = 4 }) {
  // All particles: sharp, twinkling stars
  const starParticles = Array.from({ length: numParticles }).map((_, i) => {
    const progress = Math.random();
    const speed = rand(18, 28);
    const riverDepth = Math.random() * 0.1;
    const size = rand(1.2, 2.6);
    const color = [
      'white',
      '#a5b4fc',
      '#7c3aed',
      '#6366f1',
      '#bae6fd',
      '#f0abfc'
    ][Math.floor(Math.random() * 6)];
    return {
      id: `river-star-${i}`,
      x: -0.15 + progress * 1.3,
      y: 0.45 + riverDepth,
      size,
      color,
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  // Streaming lines within the river area
  const streams = Array.from({ length: numStreams }).map((_, i) => {
    // Fully random positions and delays for organic, sparse effect
    const progress = Math.random(); // random horizontal start
    const y = 0.45 + Math.random() * 0.1; // random vertical position
    const speed = rand(18, 26);
    const delay = -rand(0, speed * 2); // negative delay, up to 2x speed, for big gaps
    return {
      id: `stream-line-${i}`,
      x: -0.25 + progress * 1.5,
      y,
      width: rand(32, 54), // shorter lines for subtle effect
      color: 'linear-gradient(90deg, white 0%, #f0abfc 18%, #a5b4fc 36%, #7c3aed 54%, #06b6d4 72%, #22d3ee 90%, transparent 100%)',
      opacity: rand(0.13, 0.22),
      blur: rand(0.8, 1.5),
      speed,
      delay
    }
  });
  return (
    <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10">
      {/* Twinkling star particles */}
      {starParticles.map(p => (
        <svg
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: p.size,
            height: p.size,
            pointerEvents: 'none',
            zIndex: 2,
            animation: `riverFlow ${p.speed}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <circle
            cx={p.size / 2}
            cy={p.size / 2}
            r={p.size / 2}
            fill={p.color}
            style={{
              opacity: 0.85,
              filter: 'drop-shadow(0 0 2px white)',
              animation: `starTwinkle ${p.twinkleDur}s ease-in-out ${p.twinkleDelay}s infinite`,
            }}
          />
        </svg>
      ))}
      {/* Streaming lines */}
      {streams.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x * 100}%`,
            top: `${s.y * 100}%`,
            width: s.width,
            height: 1,
            background: s.color,
            borderRadius: 1,
            opacity: s.opacity,
            filter: `blur(${s.blur}px)`,
            animation: `streamFlow ${s.speed}s linear infinite`,
            animationDelay: `${s.delay}s`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes riverFlow {
          0% { transform: translateX(-20px); opacity: 0; }
          8% { opacity: 0.9; }
          15% { transform: translateX(15vw); }
          35% { transform: translateX(35vw); }
          55% { transform: translateX(55vw); }
          75% { transform: translateX(75vw); }
          92% { opacity: 0.9; }
          100% { transform: translateX(calc(100vw + 20px)); opacity: 0; }
        }
        @keyframes streamFlow {
          0% { transform: translateX(-30px) scaleX(0.3); opacity: 0; }
          12% { opacity: 0.7; transform: translateX(5vw) scaleX(1); }
          25% { transform: translateX(25vw) scaleX(1.1); }
          50% { transform: translateX(50vw) scaleX(1); }
          75% { transform: translateX(75vw) scaleX(1.1); }
          88% { opacity: 0.7; transform: translateX(95vw) scaleX(1); }
          100% { transform: translateX(calc(100vw + 30px)) scaleX(0.3); opacity: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          25% { opacity: 1; transform: scale(1.2); }
          50% { opacity: 0.5; transform: scale(0.9); }
          75% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(25) // Default 25 mile radius
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: string;
    x: number;
    y: number;
    size: number;
    color: string;
    animationType: string;
    speed: number;
    delay: number;
  }>>([])

  // Real job data for hero preview
  const heroJobs = [
    {
      job_id: 'hero-1',
      job_title: 'Senior Frontend Engineer',
      employer_name: 'Stripe',
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: false,
      job_min_salary: 160000,
      job_max_salary: 220000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_employment_type: 'FULLTIME',
      job_posted_at_timestamp: Date.now() - 86400000, // 1 day ago
      job_posted_at_datetime_utc: new Date(Date.now() - 86400000).toISOString(),
      job_apply_link: '#',
      job_apply_is_direct: true,
      job_publisher: 'Stripe Careers',
      job_description: 'Build the future of internet commerce with cutting-edge payment infrastructure.',
      job_required_skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
      delay: 0
    },
    {
      job_id: 'hero-2',
      job_title: 'Product Manager - AI',
      employer_name: 'Anthropic',
      job_city: 'Remote',
      job_state: '',
      job_country: 'US',
      job_is_remote: true,
      job_min_salary: 180000,
      job_max_salary: 250000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_employment_type: 'FULLTIME',
      job_posted_at_timestamp: Date.now() - 172800000, // 2 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 172800000).toISOString(),
      job_apply_link: '#',
      job_apply_is_direct: true,
      job_publisher: 'Anthropic Careers',
      job_description: 'Shape the future of AI safety and alignment in our next-generation language models.',
      job_required_skills: ['Product Strategy', 'AI/ML', 'Data Analysis', 'Leadership'],
      delay: 1
    },
    {
      job_id: 'hero-3',
      job_title: 'DevOps Engineer',
      employer_name: 'Docker',
      job_city: 'Austin',
      job_state: 'TX',
      job_country: 'US',
      job_is_remote: true,
      job_min_salary: 130000,
      job_max_salary: 170000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_employment_type: 'FULLTIME',
      job_posted_at_timestamp: Date.now() - 345600000, // 4 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 345600000).toISOString(),
      job_apply_link: '#',
      job_apply_is_direct: true,
      job_publisher: 'Docker Careers',
      job_description: 'Scale containerized applications and improve developer experience across our global platform.',
      job_required_skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
      delay: 2
    },
    {
      job_id: 'hero-4',
      job_title: 'UX Designer',
      employer_name: 'Figma',
      job_city: 'San Francisco',
      job_state: 'CA',
      job_country: 'US',
      job_is_remote: true,
      job_min_salary: 120000,
      job_max_salary: 160000,
      job_salary_currency: 'USD',
      job_salary_period: 'YEAR',
      job_employment_type: 'FULLTIME',
      job_posted_at_timestamp: Date.now() - 518400000, // 6 days ago
      job_posted_at_datetime_utc: new Date(Date.now() - 518400000).toISOString(),
      job_apply_link: '#',
      job_apply_is_direct: true,
      job_publisher: 'Figma Careers',
      job_description: 'Design intuitive interfaces that empower creative teams worldwide to bring ideas to life.',
      job_required_skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
      delay: 3
    }
  ];

  // Helper function to format salary
  const formatSalary = (minSalary?: number, maxSalary?: number) => {
    if (!minSalary && !maxSalary) return 'Competitive';
    if (minSalary && maxSalary) {
      const minK = Math.round(minSalary / 1000);
      const maxK = Math.round(maxSalary / 1000);
      return `$${minK}k - $${maxK}k`;
    }
    if (minSalary) return `$${Math.round(minSalary / 1000)}k+`;
    if (maxSalary) return `Up to $${Math.round(maxSalary / 1000)}k`;
    return 'Competitive';
  };

  // Helper function to format location
  const formatLocation = (job: any) => {
    if (job.job_is_remote) return 'Remote';
    if (job.job_city && job.job_state) return `${job.job_city}, ${job.job_state}`;
    if (job.job_city) return job.job_city;
    return 'Location TBD';
  };

  // Helper function to format posting time
  const formatTimeAgo = (timestamp: number) => {
    const daysAgo = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (daysAgo === 0) return 'Today';
    if (daysAgo === 1) return '1 day ago';
    return `${daysAgo} days ago`;
  };

  // Initialize stars only on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
    
    const newParticles = []
    
    // Generate stars outside the river area in the hero section
    for (let i = 0; i < 120; i++) {
      // Avoid river area (45-53%) by placing stars in top and bottom regions
      const isTopRegion = Math.random() < 0.5;
      const yPosition = isTopRegion ? Math.random() * 43 : 54 + Math.random() * 46; // 0-43% or 54-100%
      
      newParticles.push({
        id: `star-${i}`,
        x: Math.random() * 100,
        y: yPosition,
        size: 0.5 + Math.random() * 1.5,
        color: `radial-gradient(circle, #9333ea, #06b6d4)`,
        animationType: 'starTwinkle',
        speed: 300 + Math.random() * 200,
        delay: Math.random() * 300
      })
    }

    // Generate flowing particles within the river area - more natural distribution
    for (let i = 0; i < 35; i++) {
      const progress = Math.random(); // Random position in animation (0 to 1)
      const speed = 20 + Math.random() * 10; // Varied speeds for natural flow
      const riverDepth = Math.random() * 10; // 10% height of river area
      newParticles.push({
        id: `river-particle-${i}`,
        x: -15 + (progress * 130), // Spread across extended journey (-15% to 115%)
        y: 45 + riverDepth, // River area (45-55%) distributed naturally
        size: 0.8 + Math.random() * 2.2, // Varied particle sizes
        color: `radial-gradient(circle, rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.6))`,
        animationType: 'riverFlow',
        speed: speed,
        delay: -progress * speed // Negative delay based on position to sync animation
      })
    }

    // Generate streaming lines within the river area - like current lines
    for (let i = 0; i < 12; i++) {
      const progress = Math.random(); // Random position in animation (0 to 1)
      const speed = 18 + Math.random() * 8; // Varied stream speeds
      const streamHeight = 45 + Math.random() * 10; // Distribute across river height
      newParticles.push({
        id: `stream-line-${i}`,
        x: -25 + (progress * 150), // Extended journey for longer streams
        y: streamHeight, // River area distributed
        size: 1, // Will be overridden by CSS for line shape
        color: `linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), rgba(59, 130, 246, 0.8), transparent)`,
        animationType: 'streamFlow',
        speed: speed,
        delay: -progress * speed // Negative delay based on position to sync animation
      })
    }

    setParticles(newParticles)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (location) params.append('location', location)
    if (location && radius) params.append('radius', radius.toString())
    
    router.push(`/search?${params.toString()}`)
  }

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (location.length < 2) {
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
        return
      }

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au`)
        const data = await response.json()
        
        const suggestions = data.map((item: any) => {
          const address = item.address
          const city = address.city || address.town || address.village || address.hamlet
          const state = address.state || address.region
          const country = address.country
          
          if (city && state) {
            return `${city}, ${state}`
          } else if (city) {
            return `${city}, ${country}`
          } else {
            return item.display_name.split(',').slice(0, 2).join(',')
          }
        }).filter((suggestion: string, index: number, array: string[]) => 
          array.indexOf(suggestion) === index // Remove duplicates
        )
        
        setLocationSuggestions(suggestions)
        setShowLocationSuggestions(suggestions.length > 0)
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
        setLocationSuggestions([])
        setShowLocationSuggestions(false)
      }
    }

    const delayedFetch = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(delayedFetch)
  }, [location])

  const handleLocationSelect = (suggestion: string) => {
    setLocation(suggestion)
    setShowLocationSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const features = [
    {
      icon: <SparklesIcon className="h-8 w-8 text-blue-600" />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze your skills and experience to find perfect job matches'
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-green-600" />,
      title: 'Multi-Platform Aggregation',
      description: 'Search across LinkedIn, Indeed, Glassdoor, and 50+ job boards simultaneously'
    },
    {
      icon: <BriefcaseIcon className="h-8 w-8 text-purple-600" />,
      title: 'Application Tracking',
      description: 'Never lose track of your applications with our intelligent tracking system'
    },
    {
      icon: <RocketLaunchIcon className="h-8 w-8 text-orange-600" />,
      title: 'Smart Notifications',
      description: 'Get notified about new opportunities that match your criteria instantly'
    }
  ]

  const stats = [
    { label: 'Job Listings', value: '2M+', description: 'Fresh opportunities daily' },
    { label: 'Companies', value: '50K+', description: 'From startups to Fortune 500' },
    { label: 'Success Rate', value: '85%', description: 'Users find jobs faster' },
    { label: 'Platforms', value: '50+', description: 'All major job boards' }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes starTwinkle {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          25% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
          75% { 
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes riverFlow {
          0% { 
            transform: translateX(-20px) translateY(0px);
            opacity: 0;
          }
          8% {
            opacity: 0.9;
          }
          15% {
            transform: translateX(15vw) translateY(-1px);
          }
          35% {
            transform: translateX(35vw) translateY(1px);
          }
          55% {
            transform: translateX(55vw) translateY(-0.5px);
          }
          75% {
            transform: translateX(75vw) translateY(0.5px);
          }
          92% {
            opacity: 0.9;
          }
          100% { 
            transform: translateX(calc(100vw + 20px)) translateY(-1px);
            opacity: 0;
          }
        }
        
        @keyframes streamFlow {
          0% { 
            transform: translateX(-30px) translateY(0px) scaleX(0.3);
            opacity: 0;
          }
          12% {
            opacity: 0.7;
            transform: translateX(5vw) translateY(0px) scaleX(1);
          }
          25% {
            transform: translateX(25vw) translateY(-0.5px) scaleX(1.1);
          }
          50% {
            transform: translateX(50vw) translateY(0px) scaleX(1);
          }
          75% {
            transform: translateX(75vw) translateY(0.5px) scaleX(1.1);
          }
          88% {
            opacity: 0.7;
            transform: translateX(95vw) translateY(0px) scaleX(1);
          }
          100% { 
            transform: translateX(calc(100vw + 30px)) translateY(-0.5px) scaleX(0.3);
            opacity: 0;
          }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        /* Liquid container waves */
        .liquid-waves {
          pointer-events: none;
        }
        
        /* Dynamic waves - no CSS animation needed */

      `}</style>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">UpFetch</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {status === 'loading' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : session ? (
                <>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {session.user.name?.split(' ')[0] || 'User'}
                    </span>
                  </div>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => signIn()}>
                    Sign In
                  </Button>
                  <Button asChild>
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative py-20 overflow-hidden z-10">
        {/* Starfield Background - behind river and hero content */}
        {isClient && (
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Starfield
              width={typeof window !== 'undefined' ? window.innerWidth : 1920}
              height={typeof window !== 'undefined'
                ? ((document.querySelector('.hero-section') as HTMLElement)?.offsetHeight || 400)
                : 400}
            />
          </div>
        )}
        {/* River of Smoke Animation - behind the hero content */}
        {isClient && (
          <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-0">
            <DynamicWaves />
          </div>
        )}
        {/* Foreground River Particles */}
        {isClient && <RiverParticles width={typeof window !== 'undefined' ? window.innerWidth : 1920} height={180} />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
                  Smart Job Matching
                </Badge>
                <h1 className="text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  Happy with your
                  <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    current position?
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  UpFetch finds jobs that actually match what you're looking for. No more scrolling through irrelevant listings or applying into the void.
                </p>
              </div>
              {/* Flowing Search Form */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-card/70 backdrop-blur-xl rounded-2xl p-6 border border-primary/20 shadow-xl">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-primary" />
                          <Input 
                            placeholder="Job title or keywords"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-secondary rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative">
                          <MapPinIcon className="absolute left-4 top-4 h-5 w-5 text-accent" />
                          <Input 
                            placeholder="City, state, or remote"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
                            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                            className="pl-12 h-14 text-lg bg-background/50 border-0 rounded-xl focus:ring-2 focus:ring-accent/50"
                          />
                          {showLocationSuggestions && locationSuggestions.length > 0 && (
                            <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto bg-card/90 backdrop-blur-xl border-primary/30">
                              <CardContent className="p-0">
                                {locationSuggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    onClick={() => handleLocationSelect(suggestion)}
                                    variant="ghost"
                                    className="w-full justify-start text-sm border-b border-primary/20 last:border-b-0 rounded-none text-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <div className="flex items-center">
                                      <MapPinIcon className="h-4 w-4 text-accent mr-2" />
                                      {suggestion}
                                    </div>
                                  </Button>
                                ))}
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      size="lg" 
                      className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary via-accent to-secondary hover:from-primary/90 hover:via-accent/90 hover:to-secondary/90 transform hover:scale-105 transition-all shadow-lg"
                    >
                      Search Jobs
                    </Button>
                  </div>
                </div>
              </div>
              {/* Flowing Tags */}
              <div className="flex flex-wrap gap-3">
                {['Remote Work', 'Tech Companies', 'High Growth', 'Well Funded'].map((tag, index) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10 transform hover:scale-110 transition-all px-4 py-2 border-primary/30 hover:border-primary/50"
                    style={{
                      animation: `float ${2 + index * 0.5}s ease-in-out infinite`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Right: Flowing Job Cards */}
            <div className="relative">
              <div className="space-y-6">
                {[
                  { company: 'Stripe', role: 'Senior Frontend Engineer', salary: '$160k - $220k', logo: '💳' },
                  { company: 'Anthropic', role: 'Product Manager - AI', salary: '$180k - $250k', logo: '🤖' },
                  { company: 'Docker', role: 'DevOps Engineer', salary: '$130k - $170k', logo: '🐳' },
                  { company: 'Figma', role: 'UX Designer', salary: '$120k - $160k', logo: '🎨' }
                ].map((job, index) => (
                  <div
                    key={index}
                    className="transform hover:scale-105 transition-all duration-500"
                    style={{
                      animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                      animationDelay: `${index * 0.7}s`
                    }}
                  >
                    <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center text-xl backdrop-blur-xl">
                            {job.logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{job.role}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <p className="text-sm font-medium text-primary">{job.salary}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors opacity-60 hover:opacity-100"
                            asChild
                          >
                            <Link href={`/search?q=${encodeURIComponent(job.role)}&location=Remote`}>
                              View →
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Liquid Container */}
      <section className="relative bg-background pt-32 pb-32 overflow-hidden">
        <div className="relative z-10 mt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                    <div className="text-xs text-muted-foreground/80 mt-1">{stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Why UpFetch Beats LinkedIn
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Experience the future of job searching with features that actually work for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative grid-texture-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Find Your Dream Job?
          </h2>
          <p className="mt-4 text-xl opacity-90">
            Join thousands of professionals who've upgraded their job search experience
          </p>
          <div className="mt-8">
            {session ? (
              <Button variant="secondary" size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button variant="secondary" size="lg" asChild>
                <Link href="/auth/signup">Start Searching Now</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">UpFetch</h3>
              <p className="text-muted-foreground">
                The intelligent job search platform that outperforms traditional job boards.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Job Search</a></li>
                <li><a href="#" className="hover:text-foreground">Company Insights</a></li>
                <li><a href="#" className="hover:text-foreground">Salary Data</a></li>
                <li><a href="#" className="hover:text-foreground">Career Advice</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Press</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2024 UpFetch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 