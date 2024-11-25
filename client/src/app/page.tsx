import { Button } from "@/components/ui/button"
import { Lock, Eye, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 my-20 py-12">
      <div className="grid grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            VigilAI - AI for Cybersecurity
          </h2>
          <p className="text-xl text-muted-foreground">
            Secure Your Digital Future with AI-Powered Protection
          </p>
          <div className="flex gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">See Demo</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-lg shadow-lg">
              <Lock className="h-12 w-12 text-white mb-4" />
              <h3 className="text-lg font-semibold text-white">Secure Access</h3>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-6 rounded-lg shadow-lg">
              <Eye className="h-12 w-12 text-white mb-4" />
              <h3 className="text-lg font-semibold text-white">Threat Monitoring</h3>
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 p-6 rounded-lg shadow-lg">
              <Shield className="h-12 w-12 text-white mb-4" />
              <h3 className="text-lg font-semibold text-white">AI Protection</h3>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg">
              <div className="space-y-2">
                <div className="h-2 w-16 bg-blue-500/20 rounded"></div>
                <div className="h-2 w-12 bg-blue-500/20 rounded"></div>
                <div className="h-2 w-20 bg-blue-500/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

