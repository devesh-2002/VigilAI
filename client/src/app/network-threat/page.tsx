"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from 'lucide-react'

export default function NetworkThreat() {
  const [file, setFile] = React.useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Handle file submission here
    console.log("File submitted:", file)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suspecting a Network Threat?</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <span className="text-sm text-gray-500">
                  {file ? file.name : "No file chosen"}
                </span>
              </div>
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Network Threat Information</CardTitle>
            <CardDescription>Details about potential network threats</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Here you can display information about network threats, tips for identifying them, or any other relevant details.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

