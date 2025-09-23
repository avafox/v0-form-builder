"use client"
// import { MessageSquare } from 'lucide-react'

interface MarinaPortalTileProps {
  onClick?: () => void
  className?: string
}

export function MarinaPortalTile({ onClick, className = "" }: MarinaPortalTileProps) {
  return (
    <div
      className={`bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-6 cursor-pointer hover:from-purple-700 hover:to-pink-600 transition-all duration-200 shadow-lg ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/20 rounded-lg p-3">
          <img src="/images/gpe-logo.png" alt="GPE Logo" className="h-8 w-8 object-contain" />
        </div>
        <h3 className="text-2xl font-bold text-white">GPE Comms</h3>
      </div>
      <p className="text-white/90 text-base leading-relaxed">
        Create professional email-ready communications with styled templates and visual exports
      </p>
    </div>
  )
}
