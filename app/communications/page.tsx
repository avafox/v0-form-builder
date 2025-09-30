import { CommunicationsTemplate } from "@/components/communications-template"

export default function CommunicationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-orange-400 via-purple-500 to-blue-600 px-6 py-12">
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">GPE Comms</h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">Create Professional Email-Ready Communications</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white/95 rounded-lg p-8">
          <CommunicationsTemplate />
        </div>
      </main>
    </div>
  )
}
