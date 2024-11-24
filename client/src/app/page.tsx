'use client';
import { Button } from "@/components/ui/button"
import { Moon, Sun, Shield, Lock, Eye } from "lucide-react"
import { useTheme } from "next-themes"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export default function Home() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                VigilAI
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Malware Detection
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Network Security
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Endpoint Protection
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                  {/* <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Documentation
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Blog
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Case Studies
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent> */}
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Contact Us</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    {/* <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        About Us
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Careers
                      </NavigationMenuLink>
                      <NavigationMenuLink className="block p-3 hover:bg-accent rounded-md">
                        Contact
                      </NavigationMenuLink>
                    </div> */}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost">Sign In</Button>
              <Button>Get Started</Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
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
      </main>
    </div>
  )
}