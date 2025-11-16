/**
 * Minimal Kerala-inspired illustrations for empty states
 * Two-color design with coconut teal and clay maroon
 */

export function CoconutTreeIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Palm fronds */}
      <path
        d="M100 100C100 100 85 70 70 60C55 50 40 45 40 45"
        stroke="hsl(170 43% 30%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 100C100 100 90 65 80 50C70 35 60 25 60 25"
        stroke="hsl(170 43% 30%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 100C100 100 105 65 120 50C135 35 150 25 150 25"
        stroke="hsl(170 43% 30%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 100C100 100 115 70 130 60C145 50 160 45 160 45"
        stroke="hsl(170 43% 30%)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 100C100 100 95 75 90 60C85 45 80 35 80 35"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M100 100C100 100 105 75 110 60C115 45 120 35 120 35"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Trunk */}
      <path
        d="M100 100L100 170"
        stroke="hsl(5 39% 44%)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Coconuts */}
      <circle cx="95" cy="95" r="5" fill="hsl(5 39% 44%)" />
      <circle cx="105" cy="98" r="5" fill="hsl(5 39% 44%)" />
      <circle cx="100" cy="105" r="5" fill="hsl(5 39% 44%)" />
    </svg>
  )
}

export function BackwatersIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Water waves */}
      <path
        d="M20 120C30 115 40 125 50 120C60 115 70 125 80 120C90 115 100 125 110 120C120 115 130 125 140 120C150 115 160 125 170 120"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M20 135C30 130 40 140 50 135C60 130 70 140 80 135C90 130 100 140 110 135C120 130 130 140 140 135C150 130 160 140 170 135"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M20 150C30 145 40 155 50 150C60 145 70 155 80 150C90 145 100 155 110 150C120 145 130 155 140 150C150 145 160 155 170 150"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Houseboat silhouette */}
      <path
        d="M60 90L140 90L150 100L145 110L55 110L50 100L60 90Z"
        fill="hsl(5 39% 44%)"
        opacity="0.6"
      />
      <path
        d="M70 75L130 75L135 85L65 85L70 75Z"
        fill="hsl(5 39% 44%)"
        opacity="0.8"
      />

      {/* Sun */}
      <circle cx="160" cy="50" r="15" fill="hsl(28 35% 85%)" opacity="0.7" />
    </svg>
  )
}

export function CoffeeBrewingIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Coffee cup */}
      <path
        d="M70 90L70 140C70 150 75 155 85 155L115 155C125 155 130 150 130 140L130 90L70 90Z"
        fill="hsl(28 35% 85%)"
        stroke="hsl(5 39% 44%)"
        strokeWidth="3"
      />

      {/* Coffee surface */}
      <ellipse cx="100" cy="90" rx="30" ry="8" fill="hsl(5 39% 44%)" opacity="0.3" />

      {/* Steam */}
      <path
        d="M85 80C85 80 82 70 85 65C88 60 85 55 85 55"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M100 75C100 75 97 65 100 60C103 55 100 50 100 50"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M115 80C115 80 112 70 115 65C118 60 115 55 115 55"
        stroke="hsl(170 43% 30%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Handle */}
      <path
        d="M130 100C130 100 145 100 145 115C145 130 130 130 130 130"
        stroke="hsl(5 39% 44%)"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  )
}

export function HeartConnectionIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left heart */}
      <path
        d="M70 90C70 80 75 75 82 75C88 75 92 80 95 85C98 80 102 75 108 75C115 75 120 80 120 90C120 105 95 120 95 120C95 120 70 105 70 90Z"
        fill="hsl(170 43% 30%)"
        opacity="0.6"
      />

      {/* Connecting dots */}
      <circle cx="95" cy="95" r="4" fill="hsl(5 39% 44%)" />
      <circle cx="105" cy="95" r="4" fill="hsl(5 39% 44%)" />
      <circle cx="115" cy="95" r="4" fill="hsl(5 39% 44%)" />

      {/* Right heart */}
      <path
        d="M80 90C80 80 85 75 92 75C98 75 102 80 105 85C108 80 112 75 118 75C125 75 130 80 130 90C130 105 105 120 105 120C105 120 80 105 80 90Z"
        fill="hsl(5 39% 44%)"
        opacity="0.6"
      />
    </svg>
  )
}
