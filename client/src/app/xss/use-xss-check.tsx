import { useState } from 'react'

export function useXssCheck() {
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkXss = async (code: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('http://localhost:8000/xss-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: code }),
      })
      console.log(response)
      if (!response.ok) {
        throw new Error('Failed to check XSS vulnerability')
      }

      const data = await response.json()
      console.log(data)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return { checkXss, result, isLoading, error }
}

