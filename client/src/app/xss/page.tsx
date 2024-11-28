'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useXssCheck } from './use-xss-check'

export default function XssChecker() {
  const [code, setCode] = useState('')
  const { checkXss, result, isLoading, error } = useXssCheck()

  const handleSubmit = async () => {
    await checkXss(code)
  }

  return (
    <div className="container mx-auto p-4 ">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Is your Code Vulnerable to Cross Site Scripting?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Check for XSS'}
          </Button>
        </CardFooter>
      </Card>

      {result && (
        <Alert className="mt-4 max-w-2xl mx-auto">
          <AlertTitle>Result</AlertTitle>
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4 max-w-2xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

