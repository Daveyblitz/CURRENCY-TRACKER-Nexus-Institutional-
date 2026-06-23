import { useState, useEffect, useRef } from 'react'

/**
 * useFetch - Generic data fetching hook with:
 * - Loading state
 * - Error fallback
 * - Optional polling interval (ms)
 * - Stale indicator (if server responds with isStale flag)
 */
export function useFetch(url, options = {}) {
  const { interval = null } = options
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [isStale, setIsStale] = useState(false)
  const timerRef = useRef(null)

  const fetchData = async () => {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setIsStale(json?.source?.includes('Offline') || json?.source?.includes('Mock') || false)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData()
    if (interval) {
      timerRef.current = setInterval(fetchData, interval)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [url])

  return { data, loading, error, isStale, refetch: fetchData }
}
