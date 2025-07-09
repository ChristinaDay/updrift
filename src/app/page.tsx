'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon, ChartBarIcon, SparklesIcon, RocketLaunchIcon, UserIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
  const topY = 62

  const bottomAmplitude = 7
  const bottomFrequency = 1.7
  const bottomOffset = 1.5
  const bottomPhase = 1.3
  const bottomY = 138

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
  const bgTopY = 92

  const bgBottomAmplitude = 12
  const bgBottomFrequency = 1.1
  const bgBottomOffset = 2.2
  const bgBottomPhase = 1.1
  const bgBottomY = 148

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
  const bg2TopY = 102

  const bg2BottomAmplitude = 14
  const bg2BottomFrequency = 0.8
  const bg2BottomOffset = 2.8
  const bg2BottomPhase = 0.8
  const bg2BottomY = 130

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
          <stop offset="0%" stopColor="#b8e1ff" stopOpacity={0.21} />
          <stop offset="25%" stopColor="#7c3aed" stopOpacity={0.24} />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.26} />
          <stop offset="75%" stopColor="#06b6d4" stopOpacity={0.23} />
          <stop offset="100%" stopColor="#818cf8" stopOpacity={0.31} />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.12} />
          <stop offset="33%" stopColor="#22d3ee" stopOpacity={0.14} />
          <stop offset="66%" stopColor="#f472b6" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.20} />
        </linearGradient>
        <linearGradient id="liquid-gradient-bg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0abfc" stopOpacity={0.056} />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.077} />
          <stop offset="100%" stopColor="#f9a8d4" stopOpacity={0.098} />
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
function RiverParticles({ numParticles = 35, numStreams = 4 }) {
  // All particles: sharp, twinkling stars (within river)
  const starParticles = Array.from({ length: numParticles }).map((_, i) => {
    const progress = Math.random();
    const baseSpeed = rand(6, 10) * 0.6; // 40% faster
    const speed = baseSpeed * rand(1.3, 1.5);
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
    const y = 0.495 + Math.random() * 0.01; // extremely tight vertical spread
    const baseSpeed = rand(2, 4) * 0.6; // 40% faster
    const speed = baseSpeed * rand(1.3, 1.5);
    const width = rand(12, 32); // much longer, still thin
    const blur = rand(0.05, 0.2); // even less blur, max 0.2px
    const progress = Math.random();
    // Reduce opacity by 20%
    const baseOpacity = rand(0.09, 0.16);
    const opacity = baseOpacity * 0.8;
    return {
      id: `stream-line-${i}`,
      x: -0.15, // spawn much further left
      y,
      width,
      color: 'linear-gradient(90deg, white 0%, #f0abfc 18%, #a5b4fc 36%, #7c3aed 54%, #06b6d4 72%, #22d3ee 90%, transparent 100%)',
      opacity, // 20% more transparent
      blur,
      speed,
      delay: -progress * speed
    }
  });
  // Above river moving particles (20% slower, much higher)
  const aboveParticles = Array.from({ length: 10 }).map((_, i) => {
    const baseSpeed = rand(6, 10) * 0.6 * 1.2; // 20% slower
    const speed = baseSpeed * rand(1.3, 1.5);
    // Place 40-45px above the river band (river band is at 45-55% of 180px = 81-99px)
    // So above: 40-45px above 81px = 36-41px (20-23% of 180px)
    // We'll use 18-25% for a nice spread
    const y = 0.18 + Math.random() * 0.07; // 18-25%
    const progress = Math.random();
    return {
      id: `river-star-above-${i}`,
      x: -0.15 + progress * 1.3,
      y,
      size: 0.8 + Math.random() * 2.2,
      color: 'white',
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  // Below river moving particles (20% slower, much lower)
  const belowParticles = Array.from({ length: 10 }).map((_, i) => {
    const baseSpeed = rand(6, 10) * 0.6 * 1.2; // 20% slower
    const speed = baseSpeed * rand(1.3, 1.5);
    // Place 40-45px below the river band (river band is at 45-55% of 180px = 81-99px)
    // So below: 40-45px below 99px = 139-144px (77-80% of 180px)
    // We'll use 75-82% for a nice spread
    const y = 0.75 + Math.random() * 0.07; // 75-82%
    const progress = Math.random();
    return {
      id: `river-star-below-${i}`,
      x: -0.15 + progress * 1.3,
      y,
      size: 0.8 + Math.random() * 2.2,
      color: 'white',
      speed,
      delay: -progress * speed,
      twinkleDur: rand(1.5, 3.5),
      twinkleDelay: rand(0, 2)
    }
  });
  return (
    <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10">
      {/* Twinkling star particles (river) */}
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
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
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
      {/* Above river moving particles */}
      {aboveParticles.map(p => (
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
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
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
      {/* Below river moving particles */}
      {belowParticles.map(p => (
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
            animation: `riverFlow ${p.speed}s linear ${p.delay}s infinite`,
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
            animation: `streamFlow ${s.speed}s linear ${s.delay}s infinite`,
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

// --- AnimatedCount component (helper, place above Home) ---

const AnimatedCount: React.FC<{ value: string }> = ({ value }) => {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const end = parseInt(value.replace(/\D/g, '')) || 0;
    if (isNaN(end) || end === 0) {
      setDisplay(value);
      return;
    }
    let current = 0;
    const duration = 1200;
    const step = Math.ceil(end / (duration / 16));
    const interval = setInterval(() => {
      current += step;
      if (current >= end) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(current.toLocaleString() + value.replace(/\d/g, ''));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{display}</span>;
};

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [radius] = useState(25)
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Real job data for hero preview
  // Removed unused variables: heroJobs, formatSalary, formatLocation, formatTimeAgo

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
      const baseSpeed = rand(6, 10) * 0.6; // 40% faster
      const speed = baseSpeed * rand(1.3, 1.5); // keep the multiplier for variety
      const riverDepth = Math.random() * 10; // 10% height of river area
      const progress = Math.random();
      newParticles.push({
        id: `river-particle-${i}`,
        x: -15, // spawn much further left
        y: 45 + riverDepth, // River area (45-55%) distributed naturally
        size: 0.8 + Math.random() * 2.2, // Varied particle sizes
        color: `radial-gradient(circle, rgba(147, 51, 234, 0.8), rgba(59, 130, 246, 0.6))`,
        animationType: 'riverFlow',
        speed: speed,
        delay: -progress * speed // negative delay for smooth flow
      })
    }

    // Generate streaming lines within the river area - like current lines
    for (let i = 0; i < 12; i++) {
      const baseSpeed = rand(2, 4) * 0.6; // 40% faster
      const speed = baseSpeed * rand(1.3, 1.5); // keep the multiplier for variety
      const streamHeight = 49.5 + Math.random() * 1; // extremely tight vertical spread
      const width = rand(12, 32); // much longer, still thin
      const blur = rand(0.05, 0.2); // even less blur, max 0.2px
      const progress = Math.random();
      newParticles.push({
        id: `stream-line-${i}`,
        x: -0.15, // spawn much further left
        y: streamHeight, // River area distributed
        size: width, // Will be overridden by CSS for line shape
        color: `linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), rgba(59, 130, 246, 0.8), transparent)`,
        animationType: 'streamFlow',
        speed: speed,
        delay: -progress * speed, // negative delay for smooth flow
        blur,
      })
    }

    // setParticles(newParticles) // This line was removed as per the edit hint
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
        
        type NominatimResult = { address: { city?: string; town?: string; village?: string; hamlet?: string; state?: string; region?: string; country?: string }; display_name: string };
        const suggestions = data.map((item: NominatimResult) => {
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
        
        /* Subtle floating/bobbing for hero job cards */
        @keyframes heroCardFloat {
          0%, 100% { transform: translateY(0px); }
          20% { transform: translateY(-3.5px); }
          50% { transform: translateY(2px); }
          80% { transform: translateY(-2.5px); }
        }
        .hero-job-card-float-0 { animation: heroCardFloat 5.2s ease-in-out infinite; animation-delay: 0s; }
        .hero-job-card-float-1 { animation: heroCardFloat 5.7s ease-in-out infinite; animation-delay: 0.5s; }
        .hero-job-card-float-2 { animation: heroCardFloat 5.4s ease-in-out infinite; animation-delay: 1.1s; }
        .hero-job-card-float-3 { animation: heroCardFloat 5.9s ease-in-out infinite; animation-delay: 1.7s; }
        /* Liquid container waves */
        .liquid-waves {
          pointer-events: none;
        }
        
        /* Dynamic waves - no CSS animation needed */

      `}</style>

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">UpDrift</h1>
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
                      {session?.user?.name?.split(' ')[0] || 'User'}
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
      <section className="hero-section relative min-h-screen flex items-center overflow-hidden z-10">
        {/* Starfield Background - behind river and hero content */}
        {isClient && (
          <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
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
        {isClient && <div className="absolute left-0 top-1/2 w-full h-[180px] -translate-y-1/2 pointer-events-none z-10"><RiverParticles numParticles={35} numStreams={4} /></div>}
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
                  UpDrift finds jobs that actually match what you&apos;re looking for. No more scrolling through irrelevant listings or applying into the void.
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
                      className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400 transform hover:scale-105 transition-all shadow-lg"
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
                    className={`hero-job-card-float-${index} transition-all duration-500 hover:scale-105`}
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
        {/* Animated gradient blob background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute left-1/4 top-0 w-96 h-96 bg-gradient-to-br from-fuchsia-500/30 via-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute right-1/4 bottom-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/30 via-fuchsia-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slower" />
        </div>
        <div className="relative z-10 mt-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="text-center bg-background/70 backdrop-blur-lg border-2 border-transparent hover:border-gradient-to-r hover:from-primary hover:to-accent transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 group relative overflow-hidden"
                  style={{ boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10)' }}
                >
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      <AnimatedCount value={stat.value} />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</div>
                    <div className="text-xs text-muted-foreground/80 mt-1">{stat.description}</div>
                  </CardContent>
                  {/* Animated border accent */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
              Why UpDrift Beats LinkedIn
            </h2>
            <p className="mt-4 text-xl text-muted-foreground">
              Experience the future of job searching with features that actually work for you
            </p>
          </div>
          <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-shadow duration-300 group snap-center min-w-[260px] md:min-w-0 relative border border-border bg-card/80 backdrop-blur-xl"
              >
                {/* Vertical accent divider on desktop */}
                {index !== 0 && (
                  <div className="hidden lg:block absolute -left-4 top-6 bottom-6 w-1 bg-gradient-to-b from-primary/30 via-accent/30 to-secondary/30 rounded-full" />
                )}
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-lg mb-4 animate-bounce-on-hover">
                    <div className="text-primary group-hover:scale-110 group-hover:text-accent transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative grid-texture-bg overflow-hidden">
        {/* Animated grid or gradient background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-fuchsia-500/10 via-cyan-400/10 to-blue-500/10 animate-gradient-move" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Find Your Dream Job?
          </h2>
          <p className="mt-4 text-xl opacity-90">
            Join thousands of professionals who&apos;ve upgraded their job search experience
          </p>
          {/* Trusted by row */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 opacity-80">
            {['Google','Meta','Stripe','Netflix','Amazon'].map((logo) => (
              <div key={logo} className="grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all text-2xl font-bold tracking-wide px-4 py-2 bg-white/10 rounded-lg shadow-sm">
                {logo}
              </div>
            ))}
          </div>
          <div className="mt-12">
            {session ? (
              <Button variant="secondary" size="lg" asChild className="animate-cta-pulse">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button variant="secondary" size="lg" asChild className="animate-cta-pulse">
                <Link href="/auth/signup">Start Searching Now</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t-4 border-gradient-to-r from-primary via-accent to-secondary py-12 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-background/80 to-background/100 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">UpDrift</h3>
              <p className="text-muted-foreground">
                The intelligent job search platform that outperforms traditional job boards.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Job Search</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Company Insights</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Salary Data</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Career Advice</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">About</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Careers</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Press</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground hover:underline underline-offset-4 transition-all">API</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; 2025 UpDrift. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 

// --- Extra CSS for animations (add to global CSS or in a <style jsx global> block) ---
/*
.animate-pulse-slow { animation: pulse 6s ease-in-out infinite; }
.animate-pulse-slower { animation: pulse 12s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
.animate-gradient-move { animation: gradientMove 16s ease-in-out infinite; }
@keyframes gradientMove { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.animate-cta-pulse { animation: ctaPulse 2.5s infinite alternate; }
@keyframes ctaPulse { 0% { box-shadow: 0 0 0 0 rgba(236,72,153,0.2); } 100% { box-shadow: 0 0 24px 8px rgba(34,211,238,0.18); } }
.animate-bounce-on-hover:hover { animation: bounce 0.7s; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } 60% { transform: translateY(4px); } }
*/ 